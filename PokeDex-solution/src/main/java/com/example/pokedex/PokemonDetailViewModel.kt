// =============================================================================
// PokemonDetailViewModel.kt  —  UI STATE for the detail screen
//
// Same Loading / Success / Error pattern as the list VM, but for ONE Pokémon
// loaded by name. The control flow (set Loading -> try repository call -> publish
// Success or Error) is identical to WeatherViewModel.loadWeather().
//
// The screen calls load(name) from a LaunchedEffect, so navigating to a new
// Pokémon re-runs the load. Like the list VM, it's a PLAIN ViewModel that takes
// its repository as a parameter, so Part G can test it on the JVM with a fake.
// =============================================================================

package com.example.pokedex

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/** The complete set of states the DETAIL screen can be in. */
sealed interface DetailUiState {
    data object Loading : DetailUiState
    data class Success(val pokemon: PokemonDetail) : DetailUiState
    data class Error(val message: String) : DetailUiState
}

class PokemonDetailViewModel(private val repository: PokemonRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<DetailUiState>(DetailUiState.Loading)
    val uiState: StateFlow<DetailUiState> = _uiState.asStateFlow()

    // Remember the last name so Retry can re-run the same load.
    private var currentName: String? = null

    /** Load (or reload) one Pokémon's detail by name. */
    fun load(name: String) {
        currentName = name
        viewModelScope.launch {
            _uiState.value = DetailUiState.Loading                 // 1) spinner
            try {
                _uiState.value = DetailUiState.Success(repository.getDetail(name))  // 2) data
            } catch (e: Exception) {
                _uiState.value = DetailUiState.Error(              // 3) any failure -> readable error
                    e.message ?: "Couldn't load this Pokémon."
                )
            }
        }
    }

    /** Re-run the most recent load (wired to the Retry button). */
    fun retry() {
        currentName?.let { load(it) }
    }

    companion object {
        fun factory(repository: PokemonRepository): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T =
                    PokemonDetailViewModel(repository) as T
            }
    }
}
