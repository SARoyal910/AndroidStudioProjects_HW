// =============================================================================
// NoteDao.kt  —  the DATA ACCESS OBJECT (queries for notes + categories)
//
// CONCEPT: a @Dao is an INTERFACE; Room generates the implementation at build time.
//   • Flow<…> return  -> REACTIVE: re-emits whenever the queried table(s) change.
//   • suspend          -> one-shot, runs on Room's own executor (off the main thread).
//   • @Transaction     -> reads a relation (CategoryWithNotes) as one consistent snapshot.
// =============================================================================
package com.example.storageshowcase.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface NoteDao {

    // --- reactive reads (Flow) -------------------------------------------
    @Query("SELECT * FROM notes ORDER BY id DESC")
    fun observeNotes(): Flow<List<Note>>

    @Query("SELECT * FROM notes ORDER BY title COLLATE NOCASE ASC")
    fun observeNotesByTitle(): Flow<List<Note>>

    @Query("SELECT * FROM categories ORDER BY name COLLATE NOCASE ASC")
    fun observeCategories(): Flow<List<Category>>

    /** A relation read — one category + its notes. @Transaction = consistent snapshot. */
    @Transaction
    @Query("SELECT * FROM categories ORDER BY name COLLATE NOCASE ASC")
    fun observeCategoriesWithNotes(): Flow<List<CategoryWithNotes>>

    @Query("SELECT COUNT(*) FROM notes")
    fun observeCount(): Flow<Int>

    // --- suspend writes (off the main thread, on Room's executor) --------
    @Insert
    suspend fun insert(note: Note): Long                 // returns new rowid

    @Update
    suspend fun update(note: Note)

    @Delete
    suspend fun delete(note: Note)

    /** IGNORE: a category with a duplicate name is skipped (returns -1). */
    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertCategory(category: Category): Long

    @Query("SELECT * FROM categories WHERE name = :name LIMIT 1")
    suspend fun findCategoryByName(name: String): Category?
}
