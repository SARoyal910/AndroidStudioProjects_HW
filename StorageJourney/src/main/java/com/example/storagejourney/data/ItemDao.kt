// =============================================================================
// ItemDao.kt  —  THE READ/WRITE DOOR into the storage component (a Room @Dao)
//
// CONCEPT: a DAO ("Data Access Object") is the set of methods that read and write the
// table. You describe it as an INTERFACE; Room GENERATES the implementation
// (ItemDao_Impl) during the build via KSP. You never write `ItemDao_Impl()` yourself —
// the database object hands you the generated instance (see ItemDatabase.kt).
//
// THIS is the door our one element walks through to get onto disk:
//   • insert(item)        — the WRITE. Returns the new row's id. `suspend` because it
//                           touches disk and must not run on the main/UI thread.
//   • observeItems()      — the READ. Returns a Flow that RE-EMITS the whole list every
//                           time the table changes. This is how the new row gets back to
//                           the screen with zero manual "refresh" code.
//
// HOW TO READ A Flow RETURN TYPE: `Flow<List<StoredItem>>` is a cold async STREAM of
// lists. Room watches the "items" table; on any insert/delete it re-runs the SELECT and
// pushes a brand-new List down the stream. Whoever is collecting (our ViewModel/UI)
// updates automatically. Contrast with `suspend` writes, which run once and return.
// =============================================================================
package com.example.storagejourney.data

import androidx.room.Dao       // marks an interface as a Room Data Access Object
import androidx.room.Delete    // generates a DELETE-by-primary-key statement
import androidx.room.Insert    // generates an INSERT statement
import androidx.room.Query     // lets you attach a custom SQL string to a function
import kotlinx.coroutines.flow.Flow  // a cold async STREAM; Room emits a new list on every table change

// ---------------------------------------------------------------------------
// DATA  (the queries)
// ---------------------------------------------------------------------------

/**
 * Data Access Object for [StoredItem] rows — the storage component's public API.
 *
 * Only an INTERFACE: Room generates the concrete `ItemDao_Impl` at build time from the
 * annotations below. Each annotated method maps to exactly one SQLite operation.
 */
@Dao
interface ItemDao {

    /**
     * Observe ALL saved items as a reactive stream, newest first.
     *
     * THE KEY ROOM IDEA (the "return trip" of the journey): a query that returns [Flow]
     * is LIVE. Room watches the "items" table; whenever a row is inserted or deleted it
     * re-runs this SELECT and pushes a fresh List down the Flow. The ViewModel collects
     * it, the UI recomposes — so the item the user just saved appears on screen without
     * any explicit "reload the list" call.
     *
     * `ORDER BY id DESC` = highest id first = newest row on top (ids increase per insert).
     */
    @Query("SELECT * FROM items ORDER BY id DESC")        // <-- reactive read; re-emits on every table change
    fun observeItems(): Flow<List<StoredItem>>

    /**
     * Insert one item — THE WRITE that puts our element on disk.
     *
     * `suspend` marks a function that can pause without blocking its thread; Room runs the
     * actual disk write on a background thread for us, so calling it from a coroutine keeps
     * the UI smooth. (Because Room already moves the work off the main thread, you do NOT
     * wrap a normal suspend DAO call in `Dispatchers.IO` — that would be redundant.)
     *
     * RETURNS the new row's auto-generated primary key as a [Long]. We surface that id in
     * the in-app Journey log so you can literally watch SQLite hand back "row #N".
     */
    @Insert
    suspend fun insert(item: StoredItem): Long            // <-- disk write => suspend; returns the new id

    /** Delete one item (matched by its @PrimaryKey id). A `suspend` disk write. */
    @Delete
    suspend fun delete(item: StoredItem)                  // <-- disk write => suspend

    /**
     * Delete every row (the "Clear storage" button). `@Query` with a DELETE statement lets
     * us wipe the whole table in one operation. Still a `suspend` write.
     */
    @Query("DELETE FROM items")
    suspend fun clearAll()                                // <-- disk write => suspend
}
