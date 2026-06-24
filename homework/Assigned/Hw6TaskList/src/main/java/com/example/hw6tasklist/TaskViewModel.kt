// =============================================================================
// TaskViewModel.kt  —  STATE HOLDER bridging Room persistence to the Compose UI
//
// CONCEPT: BASIC STORAGE surfaced as Compose STATE.
// The ViewModel is where Room's reactive Flow becomes observable UI state, and where
// user actions (add / edit / delete / toggle) become `suspend` database writes
// launched on viewModelScope. It survives configuration changes (rotation), so the
// screen never re-queries on every recomposition.
//
// ──────────────────────────────────────────────────────────────────────────────
// YOUR WORK IN THIS FILE:  ★ TODO 2, TODO 3, TODO 4 ★  (each marked below).
// The DAO handle, the Factory, and all imports are done for you. Compare this file
// with RoomAndPreferences/NotesViewModel.kt — it is the same pattern, Room-only.
// ──────────────────────────────────────────────────────────────────────────────
// =============================================================================
package com.example.hw6tasklist

import android.app.Application                                 // app Context source for building the DB
import androidx.lifecycle.AndroidViewModel                    // ViewModel that holds an Application reference
import androidx.lifecycle.ViewModel                           // base class (referenced by the Factory type)
import androidx.lifecycle.ViewModelProvider                   // factory interface to construct ViewModels
import androidx.lifecycle.viewModelScope                      // CoroutineScope tied to the ViewModel's lifetime
import com.example.hw6tasklist.data.Task                      // the Room entity (a task row)
import com.example.hw6tasklist.data.TaskDatabase              // Room database singleton (provides the DAO)
import kotlinx.coroutines.flow.SharingStarted                 // controls WHEN the StateFlow is kept hot
import kotlinx.coroutines.flow.StateFlow                      // observable, always-has-a-value stream for UI
import kotlinx.coroutines.flow.stateIn                        // converts a cold Flow into a hot StateFlow
import kotlinx.coroutines.launch                              // starts a coroutine for the suspend writes

/**
 * ViewModel for the task screens. Owns the Room wiring and exposes the task list as
 * a [StateFlow] the UI collects.
 *
 * Extends [AndroidViewModel] so it can obtain an [Application] Context to build the
 * Room database — without leaking an Activity.
 */
class TaskViewModel(app: Application) : AndroidViewModel(app) {

    // The Room DAO (read/write surface for the "tasks" table). DONE for you.
    private val taskDao = TaskDatabase.getInstance(app).taskDao()

    // =========================================================================
    // ★ TODO 2 — expose Room's Flow as UI state (builds on NotesViewModel.notes) ★
    //
    // `taskDao.observeTasks()` returns a Flow<List<Task>> that re-emits whenever the
    // table changes. Compose, though, wants a value it can read SYNCHRONOUSLY at any
    // time. `stateIn(...)` converts the cold Flow into a hot StateFlow that always
    // holds the latest list.
    //
    // Replace the placeholder below with:
    //     taskDao.observeTasks()
    //         .stateIn(
    //             scope = viewModelScope,                               // lives as long as the ViewModel
    //             started = SharingStarted.WhileSubscribed(5_000),     // stay hot 5s after the last collector
    //             initialValue = emptyList(),                          // render an empty list until the first DB emit
    //         )
    //
    // The PLACEHOLDER (MutableStateFlow(emptyList())) compiles and shows an empty
    // list, but it is NOT connected to Room — so adding tasks will not appear until
    // you wire this to observeTasks().
    //
    // (Once you wire it up, the `MutableStateFlow` import near the top of this file is
    //  no longer used — Android Studio greys it out. Remove it with Alt+Enter /
    //  Code ▸ Optimize Imports so the finished file has no leftover warnings.)
    // =========================================================================
    val tasks: StateFlow<List<Task>> = taskDao.observeTasks()
        .stateIn(
            scope = viewModelScope,                               // lives as long as the ViewModel
            started = SharingStarted.WhileSubscribed(5_000),     // stay hot 5s after the last collector
            initialValue = emptyList(),                          // render an empty list until the first DB emit
        )

    // --- ACTIONS (user intents -> suspend Room writes) -----------------------

    // =========================================================================
    // ★ TODO 3 — save a task (insert when new, update when editing) ★
    //
    // The edit screen hands us a [Task]. If it is a NEW task its id is 0 (the entity
    // default); if we are editing an existing task its id is the real, non-zero row id.
    // Use that to decide which DAO write to call. Both DAO methods are `suspend`, so
    // they MUST run inside a coroutine — launch one on viewModelScope.
    //
    // Replace the empty body with:
    //     viewModelScope.launch {
    //         if (task.id == 0L) taskDao.insert(task)   // new row -> INSERT (SQLite assigns the id)
    //         else               taskDao.update(task)   // existing row -> UPDATE by primary key
    //     }
    // =========================================================================
    fun save(task: Task) {
        viewModelScope.launch {
            if (task.id == 0L) taskDao.insert(task)   // new row -> INSERT (SQLite assigns the id)
            else               taskDao.update(task)   // existing row -> UPDATE by primary key
        }
    }

    // =========================================================================
    // ★ TODO 4 — delete a task, and toggle its "done" flag ★
    //
    // Both are `suspend` Room writes, so wrap each in viewModelScope.launch { }.
    //   • delete(task)        -> taskDao.delete(task)
    //   • toggleDone(task)    -> persist the SAME task with `done` flipped. Because Task
    //                            is a data class, use copy(): taskDao.update(task.copy(done = !task.done))
    //
    // Replace the empty bodies below.
    // =========================================================================
    fun delete(task: Task) {
        viewModelScope.launch { taskDao.delete(task) }
    }

    fun toggleDone(task: Task) {
        viewModelScope.launch { taskDao.update(task.copy(done = !task.done)) }
    }

    /**
     * Factory that constructs [TaskViewModel] with an [Application]. DONE for you.
     *
     * AndroidViewModel needs the Application passed in, so we supply a tiny factory
     * rather than pulling in a DI library for this teaching sample.
     */
    companion object {
        fun factory(app: Application): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T =
                    TaskViewModel(app) as T
            }
    }
}
