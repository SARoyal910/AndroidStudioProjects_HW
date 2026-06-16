// =============================================================================
// PlanetsViewModel.kt
//
// THE UI-STATE LAYER. This file sits BETWEEN the data layer (Repository.kt) and
// the screens (MainActivity.kt). It does two jobs:
//
//   1. Defines PlanetsUiState — an explicit enumeration of EVERY state the list
//      screen can be in: Loading, Empty, Error, Success. Modeling these as a
//      sealed type forces the UI to handle each case (no forgotten spinner, no
//      blank screen on failure).
//
//   2. Defines PlanetsViewModel — it collects the repository's Flow inside
//      viewModelScope, maps each emission into a PlanetsUiState, catches errors,
//      and exposes the result as a StateFlow the screen observes.
//
// KEY LESSON: the ViewModel talks to a PlanetRepository INTERFACE, never to a
// concrete data source. It has no idea whether the data is in memory, in Room,
// or behind Retrofit — and it does not care. That ignorance is the goal.
// =============================================================================

// Package declaration — matches the folder path under src/main/java/.
package com.example.navdatalayer

// --- AndroidX lifecycle / ViewModel imports ----------------------------------
import androidx.lifecycle.ViewModel                       // base class: survives configuration changes (rotation)
import androidx.lifecycle.viewModelScope                  // a CoroutineScope auto-cancelled when the ViewModel dies

// --- Coroutines / Flow imports -----------------------------------------------
import kotlinx.coroutines.flow.MutableStateFlow           // a writable StateFlow (always holds one current value)
import kotlinx.coroutines.flow.StateFlow                  // a read-only, always-has-a-value hot stream for the UI
import kotlinx.coroutines.flow.asStateFlow                // exposes a MutableStateFlow as a read-only StateFlow
import kotlinx.coroutines.flow.catch                      // intercepts exceptions thrown UPSTREAM in a Flow
import kotlinx.coroutines.flow.onEach                     // runs a side effect for each emitted value
import kotlinx.coroutines.flow.launchIn                   // starts collecting a Flow in a given CoroutineScope

// ===========================================================================
// THE UI STATE — one sealed type covering EVERY possible list-screen state.
//
// A `sealed interface` means the set of subtypes is CLOSED and known at compile
// time. A `when` over it can be exhaustive, so the compiler guarantees the
// screen handles Loading, Empty, Error, AND Success — you cannot forget one.
// ===========================================================================

/**
 * Every state the planet-list screen can be in. The screen renders purely as a
 * function of which subtype is current — it holds no other state of its own.
 */
sealed interface PlanetsUiState {

    /** Data is still being fetched. Screen shows a spinner. */
    data object Loading : PlanetsUiState

    /** Fetch succeeded but returned zero planets. Screen shows a friendly note. */
    data object Empty : PlanetsUiState

    /**
     * Fetch failed. Screen shows the message and a Retry button.
     * @property message human-readable explanation of what went wrong.
     */
    data class Error(val message: String) : PlanetsUiState

    /**
     * Fetch succeeded with at least one planet. Screen shows the list.
     * @property planets the planets to render.
     */
    data class Success(val planets: List<Item>) : PlanetsUiState
}

// ===========================================================================
// THE VIEW MODEL
// ===========================================================================

/**
 * Holds and exposes the list screen's [PlanetsUiState], sourced from a
 * [PlanetRepository].
 *
 * The repository is injected as a CONSTRUCTOR PARAMETER with a default of
 * [InMemoryPlanetRepository]. That single default is the ONLY place the app
 * names a concrete data source — point it at a Room/Retrofit implementation and
 * nothing else in this class (or in any screen) changes.
 *
 * @param repo the data-layer boundary this ViewModel reads from.
 */
// C3 — swap the data source by changing ONLY this default ctor arg. The ViewModel
// body (observePlanets, retry, the StateFlow) and every screen are untouched —
// that is the data boundary paying off. Cold-flow Retry now actually rescues the
// load: attempt 1 fails ("Network hiccup — try again"), Retry re-collects, attempt 2
// emitAll's the real list -> Success.
class PlanetsViewModel(
    private val repo: PlanetRepository = FlakyPlanetRepository(),   // C3 — was InMemoryPlanetRepository()
) : ViewModel() {

    // The single source of truth for the list screen. We START in Loading so the
    // very first frame the user sees is a spinner, before any data has arrived.
    private val _uiState = MutableStateFlow<PlanetsUiState>(PlanetsUiState.Loading)

    /**
     * The read-only state the screen observes via collectAsStateWithLifecycle().
     * Exposing `asStateFlow()` (not the mutable backing field) keeps writes
     * private to the ViewModel — the UI can only READ.
     */
    val uiState: StateFlow<PlanetsUiState> = _uiState.asStateFlow()

    // `init` runs once when the ViewModel is created and starts the data flow.
    init {
        observePlanets()
    }

    /**
     * Subscribe to the repository's planet stream and translate each emission
     * (or failure) into a [PlanetsUiState] for the UI.
     *
     * Reading the chain top-to-bottom:
     *   • repo.planets()  — the repository's Flow<List<Item>> (memory/Room/network).
     *   • .onEach { ... } — for each emitted list, publish Empty or Success.
     *   • .catch { ... }  — if ANYTHING upstream throws, publish Error instead of
     *                       crashing. try/catch can't wrap a Flow, so we use the
     *                       Flow operator `catch` (its structured equivalent).
     *   • .launchIn(viewModelScope) — collect on the ViewModel's scope, which is
     *                       cancelled automatically when the ViewModel is cleared,
     *                       so no leaked coroutines.
     */
    private fun observePlanets() {
        repo.planets()
            .onEach { planets ->
                // Map the raw list into the right success-side state.
                _uiState.value =
                    if (planets.isEmpty()) PlanetsUiState.Empty            // got data, but none of it
                    else PlanetsUiState.Success(planets)                  // got at least one planet
            }
            .catch { throwable ->
                // Any upstream failure (disk error, network error, etc.) lands here.
                _uiState.value =
                    PlanetsUiState.Error(throwable.message ?: "Failed to load planets")
            }
            .launchIn(viewModelScope)
    }

    /**
     * Re-run the load. Wired to the Error state's "Retry" button.
     * Resets to Loading first so the user gets immediate feedback, then
     * re-subscribes to the repository stream.
     */
    fun retry() {
        _uiState.value = PlanetsUiState.Loading                            // show the spinner again
        observePlanets()                                                   // and re-collect from the repo
    }
}
