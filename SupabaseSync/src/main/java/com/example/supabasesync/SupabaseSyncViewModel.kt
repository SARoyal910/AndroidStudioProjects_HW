// =============================================================================
// SupabaseSyncViewModel.kt  —  Room flows + connectivity → UI state; intents → writes + sync
//
// CONCEPT: the ViewModel exposes the LOCAL Room data as StateFlows (so the UI is offline-
// first by construction), plus a live online/offline signal. Every user intent does the
// same two steps: write to Room (optimistic, via the repository) and REQUEST a sync (which
// WorkManager runs now if online, later if not).
// =============================================================================
package com.example.supabasesync

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.supabasesync.data.ConnectivityObserver
import com.example.supabasesync.data.Note
import com.example.supabasesync.data.NoteRepository
import com.example.supabasesync.sync.SyncScheduler
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class SupabaseSyncViewModel(app: Application) : AndroidViewModel(app) {

    private val repo = NoteRepository.get(app)
    private val connectivity = ConnectivityObserver(app)
    private val started = SharingStarted.WhileSubscribed(5_000)

    // --- local data, surfaced as UI state (works offline) ---
    val notes: StateFlow<List<Note>> = repo.notes.stateIn(viewModelScope, started, emptyList())
    val pendingCount: StateFlow<Int> = repo.pendingCount.stateIn(viewModelScope, started, 0)
    val isOnline: StateFlow<Boolean> = connectivity.isOnline.stateIn(
        viewModelScope,
        started,
        connectivity.currentlyOnline(),
    )

    init {
        requestSync()
    }

    // --- intents: write to Room, then ask for a sync ---
    fun addNote(title: String, body: String) = writeThenSync { repo.addNote(title, body) }
    fun editNote(id: String, title: String, body: String) = writeThenSync { repo.editNote(id, title, body) }
    fun deleteNote(id: String) = writeThenSync { repo.deleteNote(id) }

    /** Manual "Sync now" — enqueue the worker and sync immediately when this foreground screen is online. */
    fun syncNow() = requestSync()

    /** Demo: pretend another device added a note to the cloud, then pull it in. */
    fun simulateRemoteEdit() = writeThenSync { repo.simulateRemoteEdit() }

    private fun writeThenSync(block: suspend () -> Unit) {
        viewModelScope.launch {
            block()                                     // 1) optimistic local write (Room updates the UI)
            requestSync()                               // 2) durable retry + immediate foreground sync when online
        }
    }

    private fun requestSync() {
        SyncScheduler.requestSync(getApplication())      // durable background retry path
        if (connectivity.currentlyOnline()) {
            viewModelScope.launch {
                runCatching { repo.sync() }              // online emulator writes flip to Synced now
            }
        }
    }

    companion object {
        fun factory(app: Application): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T =
                    SupabaseSyncViewModel(app) as T
            }
    }
}
