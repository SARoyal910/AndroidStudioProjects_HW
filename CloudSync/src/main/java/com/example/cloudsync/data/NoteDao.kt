// =============================================================================
// NoteDao.kt  —  the DATA ACCESS OBJECT for the local cache
//
// CONCEPT: the DAO has two kinds of methods in an offline-first app:
//   • REACTIVE READS (Flow) the UI observes — they must show only VISIBLE notes
//     (soft-deleted tombstones are hidden) and re-emit on every change.
//   • SYNC-ENGINE methods the repository/SyncWorker use to find unsynced rows
//     ("the outbox"), upsert cloud rows, flip sync state, and hard-delete confirmed
//     tombstones.
// =============================================================================
package com.example.cloudsync.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface NoteDao {

    // --- reactive reads for the UI ---------------------------------------
    /** Visible notes (tombstones hidden), newest first — the only list the screen shows. */
    @Query("SELECT * FROM notes WHERE deleted = 0 ORDER BY updatedAt DESC")
    fun observeVisibleNotes(): Flow<List<Note>>

    /** Live count of rows not yet pushed — drives the "N pending" UI. */
    @Query("SELECT COUNT(*) FROM notes WHERE syncState != 'SYNCED'")
    fun observePendingCount(): Flow<Int>

    // --- sync-engine queries ---------------------------------------------
    /**
     * The pull cursor: the newest updatedAt we already know about (null when the table is
     * empty). We pull only cloud rows changed AFTER this. (A production server usually hands
     * back its own opaque cursor; MAX(updatedAt) keeps this teaching demo dependency-free.)
     */
    @Query("SELECT MAX(updatedAt) FROM notes")
    suspend fun maxUpdatedAt(): Long?

    /** Every row the sync engine still has to PUSH — created, edited, or deleted offline. */
    @Query("SELECT * FROM notes WHERE syncState != 'SYNCED'")
    suspend fun notesToPush(): List<Note>

    @Query("SELECT * FROM notes WHERE id = :id")
    suspend fun findById(id: String): Note?

    // --- writes ----------------------------------------------------------
    /** Insert-or-replace one row (used for local edits AND for upserting cloud rows). */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(note: Note)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(notes: List<Note>)

    /** Hard-delete a row — used ONLY after the cloud confirms a tombstone was pushed. */
    @Query("DELETE FROM notes WHERE id = :id")
    suspend fun hardDelete(id: String)
}
