// =============================================================================
// TaskDao.kt  —  THE DATA ACCESS OBJECT (the "queries" for the tasks table)
//
// CONCEPT: BASIC STORAGE with Room — the READ/WRITE surface.
// A DAO is an INTERFACE you describe; Room generates the implementation (TaskDao_Impl)
// during the build (via KSP). You never write `TaskDao()` yourself — Room hands you
// the generated class from the database object (see TaskDatabase.kt).
//
// WHAT TO INSPECT HERE (the heart of the Room layer):
//   • observeTasks(): Flow<List<Task>>  — a REACTIVE query. Room re-emits a fresh
//        list EVERY TIME the "tasks" table changes. The UI just collects this Flow
//        and updates automatically — no manual refresh after insert/delete.
//   • suspend insert/update/delete       — these touch disk, so they are `suspend`
//        functions and must run off the main thread (the ViewModel uses coroutines).
//
// ──────────────────────────────────────────────────────────────────────────────
// YOUR WORK IN THIS FILE:  ★ TODO 1 ★  (just below — add an ORDER BY to one @Query).
// Everything else here is done for you as a reference for how a DAO is written.
// ──────────────────────────────────────────────────────────────────────────────
// =============================================================================
package com.example.hw6tasklist.data

import androidx.room.Dao       // marks an interface as a Room Data Access Object
import androidx.room.Delete    // generates a DELETE-by-primary-key statement
import androidx.room.Insert    // generates an INSERT statement
import androidx.room.Query     // lets you attach a custom SQL string to a function
import androidx.room.Update    // generates an UPDATE-by-primary-key statement
import kotlinx.coroutines.flow.Flow  // a cold async STREAM; Room emits a new list on every table change

/**
 * Data Access Object for [Task] rows.
 *
 * This is only an INTERFACE — Room generates the concrete `TaskDao_Impl` at build
 * time from the annotations below. Each annotated method maps to one SQLite operation.
 */
@Dao
interface TaskDao {

    // =========================================================================
    // ★ TODO 1 — Room query (builds on RoomAndPreferences: NoteDao.observeNotes) ★
    //
    // Observe ALL tasks as a reactive Flow. THE KEY ROOM IDEA: a query that returns
    // Flow is "live" — Room watches the "tasks" table and, on every insert/update/
    // delete, re-runs this SELECT and pushes a brand-new List down the Flow, so the
    // UI refreshes with zero extra work.
    //
    // RIGHT NOW the query has NO sort order, so rows come back in an arbitrary order.
    // Replace the SQL string below so the list reads in a sensible order:
    //     1) unfinished tasks FIRST  (done = 0 before done = 1)   -> ORDER BY done ASC
    //     2) then HIGHER priority first (2 before 1 before 0)     -> priority DESC
    //     3) then NEWEST first within the same priority           -> createdAt DESC
    //
    // HINT (the exact shape — you only change the string):
    //     @Query("SELECT * FROM tasks ORDER BY done ASC, priority DESC, createdAt DESC")
    //
    // NOTE: Room CHECKS this SQL at compile time against the Task table. If you mistype
    // a column name (it's `createdAt`, not `created_at`), the build fails with a clear
    // Room error pointing at this line — that is Room protecting you, not a bug.
    // =========================================================================
    @Query("SELECT * FROM tasks ORDER BY done ASC, priority DESC, createdAt DESC")
    fun observeTasks(): Flow<List<Task>>

    /**
     * Insert one task. `suspend` because writing to disk must not block the UI
     * thread; the ViewModel calls this from a coroutine. (DONE — reference.)
     */
    @Insert
    suspend fun insert(task: Task)                          // <-- disk write => suspend

    /**
     * Update an existing task, matched by its @PrimaryKey id. Used both to edit a
     * task's fields and to flip its `done` flag. (DONE — reference.)
     */
    @Update
    suspend fun update(task: Task)                          // <-- disk write => suspend

    /** Delete a task, matched by its @PrimaryKey id. (DONE — reference.) */
    @Delete
    suspend fun delete(task: Task)                          // <-- disk write => suspend
}
