// =============================================================================
// PokemonListViewModel.kt  —  UI STATE for the list: Loading / Success / Error
//
// CONCEPT: a network screen is never just "the data". At any moment it is LOADING,
// loaded SUCCESS(list), or failed ERROR(message). Model those with a SEALED
// interface, expose the current one as a StateFlow, and the UI becomes a pure
// function of that state. Same pattern as NetworkParsing's WeatherViewModel.
//
// OFFLINE-FIRST: this VM collects the repository's cached Flow into Success, AND
// kicks a network refresh. If the cache already has rows we stay on Success even
// if the refresh fails — the user sees data, not an error. Error is reserved for
// "nothing cached AND the fetch failed".
//
// TESTABILITY (the change that makes Part G's VM tests possible): this is a PLAIN
// ViewModel that takes its PokemonRepository as a constructor parameter. A test
// passes a fake repository directly — no Android, no Application, no Robolectric.
// The screen builds the real repository (with a Context) and hands it to factory().
// =============================================================================

package com.example.pokedex

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider           // the factory interface used to construct this VM
import androidx.lifecycle.viewModelScope              // coroutine scope tied to the VM's lifetime
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.launchIn              // start collecting a Flow in a scope
import kotlinx.coroutines.flow.onEach                // run an action on each emission
import kotlinx.coroutines.launch

/** The complete set of states the LIST screen can be in (exactly one at a time). */
sealed interface ListUiState {
    data object Loading : ListUiState
    data class Success(val pokemon: List<PokemonSummary>) : ListUiState
    data class Error(val message: String) : ListUiState
}

/**
 * PokemonListViewModel — publishes the list screen's [ListUiState].
 *
 * @param repository injected so tests can pass a fake. The screen supplies the real
 *   one via [providePokemonRepository]; see [factory].
 */
class PokemonListViewModel(private val repository: PokemonRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<ListUiState>(ListUiState.Loading)
    val uiState: StateFlow<ListUiState> = _uiState.asStateFlow()

    init {
        // 1) Read the CACHE reactively: any non-empty list becomes Success. With the
        //    real repo this is Room's live Flow, so a background refresh re-renders
        //    the screen for free; with the fake it emits the sample list at once.
        repository.observePokemon()
            .onEach { list -> if (list.isNotEmpty()) _uiState.value = ListUiState.Success(list) }
            .launchIn(viewModelScope)
        // 2) Refresh from the network in the background.
        refresh()
    }

    /** (Re)fetch the list. Used on launch and by the Retry button. */
    fun refresh() {
        viewModelScope.launch {
            // Only show the spinner if we have nothing to display yet.
            if (_uiState.value !is ListUiState.Success) _uiState.value = ListUiState.Loading
            try {
                repository.refreshList()                       // suspend: network (real) or no-op (fake)
            } catch (e: Exception) {
                // Surface an error ONLY when the cache hasn't given us anything.
                if (_uiState.value !is ListUiState.Success) {
                    _uiState.value = ListUiState.Error(
                        e.message ?: "Couldn't load Pokémon. Check your connection and retry."
                    )
                }
            }
        }
    }

    companion object {
        /** Build the VM with a specific repository (the screen passes the real one). */
        fun factory(repository: PokemonRepository): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T =
                    PokemonListViewModel(repository) as T
            }
    }
}
