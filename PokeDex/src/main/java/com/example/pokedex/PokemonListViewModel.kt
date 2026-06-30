// =============================================================================
// PokemonListViewModel.kt  —  UI STATE for the list: Loading / Success / Error
//
// CONCEPT THIS FILE TEACHES: a network screen is never just "the data". At any
// moment it is LOADING, loaded SUCCESS(list), or failed ERROR(message). Model
// those with a SEALED interface, expose the current one as a StateFlow, and the
// UI becomes a pure function of that state. Same pattern as NetworkParsing's
// WeatherViewModel and MvvmState.
//
// OFFLINE-FIRST DETAIL: this VM collects the repository's cached Flow into
// Success, AND kicks a network refresh. If the cache already has rows we show
// Success even if the refresh fails — the user sees data, not an error. Error is
// reserved for "nothing cached AND the fetch failed".
//
// This is PROVIDED and working — it already drives the screen from the offline
// Fake. (It becomes the live screen the moment you implement the real repository.)
// =============================================================================

package com.example.pokedex

import android.app.Application
import androidx.lifecycle.AndroidViewModel          // a ViewModel that can reach an Application Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider          // the factory interface used to construct this VM
import androidx.lifecycle.viewModelScope             // coroutine scope tied to the VM's lifetime
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.launchIn             // start collecting a Flow in a scope
import kotlinx.coroutines.flow.onEach               // run an action on each emission
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
 * Extends [AndroidViewModel] so it can hand the Application Context to the
 * repository (the real one needs it to open Room). The repository defaults to the
 * offline Fake (see [providePokemonRepository]).
 */
class PokemonListViewModel(app: Application) : AndroidViewModel(app) {

    private val repository: PokemonRepository = providePokemonRepository(app)

    private val _uiState = MutableStateFlow<ListUiState>(ListUiState.Loading)
    val uiState: StateFlow<ListUiState> = _uiState.asStateFlow()

    init {
        // 1) Read the CACHE reactively: any non-empty list becomes Success. With the
        //    Fake this emits the sample list immediately; with the real repo it is
        //    Room's live Flow, so a background refresh re-renders the screen for free.
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
        /** Tiny factory so `viewModel(factory = …)` can build an AndroidViewModel. */
        fun factory(app: Application): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T =
                    PokemonListViewModel(app) as T
            }
    }
}
