// =============================================================================
// LikedAlbumsViewModel.kt  —  PROBLEM 3 (the NavViewModelState skill)
//
// Owns ONE piece of shared state: the set of "liked" album ids. It is shared by
// every screen (the Activity hands out a single instance via viewModel()), so a
// ❤️ toggled on the detail screen also shows up in the album list. Because the
// state lives in a ViewModel (scoped to the Activity / ViewModelStoreOwner), it
// SURVIVES rotation and navigation — a plain remember{} would reset.
//
// Pattern: private MutableStateFlow (only the VM writes) + public read-only
// StateFlow (the UI only reads); a single toggleLike() event mutates it.
// =============================================================================
package com.example.musiclibrary

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

class LikedAlbumsViewModel : ViewModel() {

    // PRIVATE, writable source of truth — a Set<Int> of liked album ids.
    private val _liked = MutableStateFlow<Set<Int>>(emptySet())

    // PUBLIC, read-only view the UI observes (state flows DOWN).
    val liked: StateFlow<Set<Int>> = _liked.asStateFlow()

    // The single EVENT the UI sends UP: flip an album's liked status.
    fun toggleLike(albumId: Int) {
        _liked.update { current ->
            if (albumId in current) current - albumId else current + albumId
        }
    }
}
