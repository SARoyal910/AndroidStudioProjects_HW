// =============================================================================
// StorageViewModel.kt  —  ties ALL the storage layers to the UI as StateFlows
//
// CONCEPT: the ViewModel is where each persistence Flow (Room notes/categories,
// Preferences settings, the typed profile, the scratch file) becomes observable UI
// state via stateIn(...), and where user intents become writes on viewModelScope.
//   • flatMapLatest swaps the Room query when the persisted sort-order changes.
//   • Room suspend/Flow work runs on Room's own executor — NOT wrapped in
//     withContext(Dispatchers.IO). Raw FILE I/O, however, IS wrapped in IO.
// =============================================================================
package com.example.storageshowcase

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.storageshowcase.data.Category
import com.example.storageshowcase.data.FileInfo
import com.example.storageshowcase.data.FileStore
import com.example.storageshowcase.data.Note
import com.example.storageshowcase.data.Priority
import com.example.storageshowcase.data.ProfileRepository
import com.example.storageshowcase.data.SettingsRepository
import com.example.storageshowcase.data.SortOrder
import com.example.storageshowcase.data.StorageDatabase
import com.example.storageshowcase.data.StoragePaths
import com.example.storageshowcase.data.UserProfile
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@OptIn(ExperimentalCoroutinesApi::class)
class StorageViewModel(app: Application) : AndroidViewModel(app) {

    private val dao = StorageDatabase.getInstance(app).noteDao()
    private val settings = SettingsRepository(app)
    private val profileRepo = ProfileRepository(app)
    private val fileStore = FileStore(app)

    /** The real on-disk path each store writes to (shown in the UI so it's concrete). */
    val paths: StoragePaths = StoragePaths.of(app)

    private val started = SharingStarted.WhileSubscribed(5_000)

    // --- Room (structured) ---
    val notes: StateFlow<List<Note>> = settings.sortOrder
        .flatMapLatest { order ->
            when (order) {
                SortOrder.NEWEST_FIRST -> dao.observeNotes()
                SortOrder.TITLE_ASC -> dao.observeNotesByTitle()
            }
        }
        .stateIn(viewModelScope, started, emptyList())

    val categories: StateFlow<List<Category>> =
        dao.observeCategories().stateIn(viewModelScope, started, emptyList())

    val noteCount: StateFlow<Int> =
        dao.observeCount().stateIn(viewModelScope, started, 0)

    // --- Preferences DataStore (settings) ---
    val darkTheme: StateFlow<Boolean> =
        settings.darkTheme.stateIn(viewModelScope, started, false)

    val sortOrder: StateFlow<SortOrder> =
        settings.sortOrder.stateIn(viewModelScope, started, SortOrder.NEWEST_FIRST)

    // --- Typed DataStore (profile object) ---
    val profile: StateFlow<UserProfile> =
        profileRepo.profile.stateIn(viewModelScope, started, UserProfile())

    // --- File storage (scratch note) ---
    private val _scratch = MutableStateFlow("")
    val scratch: StateFlow<String> = _scratch.asStateFlow()
    private val _fileInfo = MutableStateFlow(FileInfo("", 0L, 0L))
    val fileInfo: StateFlow<FileInfo> = _fileInfo.asStateFlow()

    init {
        // Make sure at least one category exists so every note has a valid FK target.
        viewModelScope.launch { dao.insertCategory(Category(name = "Inbox")) }
        // Load the scratch file OFF the main thread (raw file I/O is blocking).
        viewModelScope.launch {
            _scratch.value = withContext(Dispatchers.IO) { fileStore.readScratch() }
            refreshFileInfo()
        }
    }

    // --- Room writes (suspend DAO runs on Room's executor) ---
    fun addNote(title: String, body: String, categoryId: Long, tags: List<String>, priority: Priority) {
        val clean = title.trim()
        if (clean.isEmpty()) return
        viewModelScope.launch {
            dao.insert(
                Note(
                    title = clean,
                    body = body.trim(),
                    categoryId = categoryId,
                    tags = tags,
                    priority = priority,
                    createdAt = System.currentTimeMillis(),
                )
            )
            profileRepo.incrementNotesCreated()   // also bumps the typed profile
        }
    }

    fun deleteNote(note: Note) {
        viewModelScope.launch { dao.delete(note) }
    }

    fun toggleDone(note: Note) {
        viewModelScope.launch { dao.update(note.copy(done = !note.done)) }
    }

    fun addCategory(name: String) {
        val clean = name.trim()
        if (clean.isEmpty()) return
        viewModelScope.launch { dao.insertCategory(Category(name = clean)) }
    }

    // --- Preferences writes ---
    fun setDarkTheme(enabled: Boolean) {
        viewModelScope.launch { settings.setDarkTheme(enabled) }
    }

    fun cycleSortOrder() {
        viewModelScope.launch {
            settings.setSortOrder(
                if (sortOrder.value == SortOrder.NEWEST_FIRST) SortOrder.TITLE_ASC
                else SortOrder.NEWEST_FIRST
            )
        }
    }

    // --- Typed profile writes ---
    fun setDisplayName(name: String) {
        viewModelScope.launch { profileRepo.setDisplayName(name) }
    }

    fun setAccent(seed: Int) {
        viewModelScope.launch { profileRepo.setAccent(seed) }
    }

    // --- File writes (raw I/O -> Dispatchers.IO) ---
    fun onScratchChange(text: String) {
        _scratch.value = text   // local, not yet persisted
    }

    fun saveScratch() {
        viewModelScope.launch {
            withContext(Dispatchers.IO) { fileStore.writeScratch(_scratch.value) }
            refreshFileInfo()
        }
    }

    fun writeCacheBlob() {
        viewModelScope.launch {
            withContext(Dispatchers.IO) { fileStore.writeCacheBlob() }
            refreshFileInfo()
        }
    }

    fun clearCache() {
        viewModelScope.launch {
            withContext(Dispatchers.IO) { fileStore.clearCache() }
            refreshFileInfo()
        }
    }

    private suspend fun refreshFileInfo() {
        _fileInfo.value = withContext(Dispatchers.IO) { fileStore.info() }
    }

    companion object {
        fun factory(app: Application): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T =
                    StorageViewModel(app) as T
            }
    }
}
