// =============================================================================
// PokemonDetailViewModel.kt  —  UI STATE for the detail screen
//
// Same Loading / Success / Error pattern as the list VM, but for ONE Pokémon
// loaded by name. The control flow (set Loading -> try repository call -> publish
// Success or Error) is identical to WeatherViewModel.loadWeather().
//
// The screen calls load(name) from a LaunchedEffect, so navigating to a new
// Pokémon re-runs the load. PROVIDED and working (drives detail from the Fake).
// =============================================================================

package com.example.pokedex

import android.app.Application
import androidx.lifecycle.AndroidViewModel
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

class PokemonDetailViewModel(app: Application) : AndroidViewModel(app) {

    private val repository: PokemonRepository = providePokemonRepository(app)

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
        fun factory(app: Application): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T =
                    PokemonDetailViewModel(app) as T
            }
    }
}
