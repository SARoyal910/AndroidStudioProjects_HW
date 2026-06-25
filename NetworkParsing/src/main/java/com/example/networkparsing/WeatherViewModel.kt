// =============================================================================
// WeatherViewModel.kt  —  UI STATE: Loading / Success / Error via StateFlow
//
// CONCEPT THIS FILE TEACHES: a network screen is never just "the data". At any moment
// it is in ONE of three states — still LOADING, loaded SUCCESS(with data), or failed
// ERROR(with a message). Model those states explicitly with a SEALED INTERFACE, expose
// the current one as a StateFlow, and the UI becomes a pure function of that state.
//
// WHAT THE STUDENT SHOULD INSPECT HERE:
//   1. WeatherUiState — a sealed interface with exactly three cases.
//   2. _uiState (MutableStateFlow, private) vs uiState (StateFlow, public, read-only).
//   3. loadWeather() — launches in viewModelScope, sets Loading, then try/catch sets
//      Success or Error. The try/catch is THE error-handling boundary.
// =============================================================================

// Package declaration: ties this file to the app's namespace + directory layout.
package com.example.networkparsing

// Base class that survives configuration changes and owns viewModelScope.
import androidx.lifecycle.ViewModel
// The coroutine scope tied to this ViewModel's lifetime (auto-cancelled on clear()).
import androidx.lifecycle.viewModelScope
// Read/write reactive state holder backing the screen.
import kotlinx.coroutines.flow.MutableStateFlow
// Read-only view of the state exposed to the UI.
import kotlinx.coroutines.flow.StateFlow
// Exposes the mutable flow as an immutable StateFlow (encapsulation).
import kotlinx.coroutines.flow.asStateFlow
// Starts a coroutine to do the (suspending) network load without blocking.
import kotlinx.coroutines.launch

// ===========================================================================
// STATE  —  the three things the screen can be, made into a closed type
//
// A SEALED interface means the compiler knows the COMPLETE set of subtypes. A `when`
// over a WeatherUiState can therefore be exhaustive (no `else` branch needed), so it is
// impossible to forget to render one of the states.
// ===========================================================================

/**
 * WeatherUiState — the complete set of states the weather screen can be in.
 * Exactly one of these is active at any time.
 */
sealed interface WeatherUiState {
    /** The request is in flight; show a spinner. (A singleton — no data to carry.) */
    data object Loading : WeatherUiState

    /**
     * The request succeeded.
     * @property weather the parsed weather to render.
     */
    data class Success(val weather: Weather) : WeatherUiState

    /**
     * The request failed.
     * @property message a human-readable reason to show alongside a Retry button.
     */
    data class Error(val message: String) : WeatherUiState
}

// ===========================================================================
// VIEWMODEL  —  owns the state and the loading logic
// ===========================================================================

/**
 * WeatherViewModel — loads the current weather from a [WeatherRepository] and publishes
 * the current [WeatherUiState] as a [StateFlow] the screen observes.
 *
 * The repository is injected (defaulting to the real, keyless Open-Meteo one) so the
 * ViewModel never hard-codes WHERE the weather comes from — and so tests can pass a
 * controlled fake.
 *
 * @param repository the data source; defaults to [provideWeatherRepository].
 */
class WeatherViewModel(
    private val repository: WeatherRepository = provideWeatherRepository(),
) : ViewModel() {

    // The city currently shown. Public-read, private-write so the UI can highlight it but
    // only loadWeather() changes it. Seeded with the first preset for the initial load.
    var city: City = PRESET_CITIES.first()
        private set

    // PRIVATE mutable state: only the ViewModel may change it. Seeded with Loading
    // because the screen begins fetching immediately (see init).
    private val _uiState = MutableStateFlow<WeatherUiState>(WeatherUiState.Loading)

    // PUBLIC read-only state: the screen collects this but cannot mutate it. This
    // one-way exposure (private mutable -> public immutable) is the standard pattern.
    val uiState: StateFlow<WeatherUiState> = _uiState.asStateFlow()

    // Kick off the first load as soon as the ViewModel is created.
    init {
        loadWeather()
    }

    /**
     * (Re)load the weather for [city] (defaults to the current city — used by Retry).
     *
     * Flow: remember the city -> set Loading -> try the (suspending) repository call ->
     * on success publish Success(weather); on ANY exception publish Error(message). This
     * try/catch is the single place network failures are turned into a visible UI state.
     */
    fun loadWeather(city: City = this.city) {
        this.city = city
        // Launch on viewModelScope so the coroutine is cancelled if the VM is cleared,
        // and so the suspending getWeather() never blocks the main thread.
        viewModelScope.launch {
            _uiState.value = WeatherUiState.Loading             // 1) show the spinner
            try {
                val weather = repository.getWeather(city)        // 2) suspend: network/parse
                _uiState.value = WeatherUiState.Success(weather) // 3a) publish the data
            } catch (e: Exception) {
                // 3b) ERROR HANDLING: any failure (no network, bad JSON, timeout) becomes
                // an Error state with a readable message instead of a crash.
                _uiState.value = WeatherUiState.Error(
                    e.message ?: "Something went wrong while loading the weather."
                )
            }
        }
    }
}
