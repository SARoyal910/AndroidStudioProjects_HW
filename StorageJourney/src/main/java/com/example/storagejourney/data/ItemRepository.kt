// =============================================================================
// ItemRepository.kt  —  THE STORAGE COMPONENT'S FRONT DOOR (a thin wrapper over the DAO)
//
// CONCEPT: a Repository is the single, named boundary the rest of the app talks to when
// it wants to persist or read data. The ViewModel never touches the DAO directly; it asks
// the repository, and the repository owns the Room engine. That boundary is exactly what
// "the storage component" means in this project — one clear place data goes in and comes
// out, so the journey has obvious doors.
//
// In a tiny app the repository can look like it "just forwards to the DAO", and here it
// almost does — but it earns its keep two ways:
//   1. It is the seam where you would later add caching, validation, a second data source,
//      or a network sync — without the ViewModel ever knowing.
//   2. It is the honest vantage point to NARRATE the write: right here we can see the call
//      go into Room (the suspend insert) and see the new id come back, so this is where we
//      record the Repository and Room legs of the JourneyLog.
// =============================================================================
package com.example.storagejourney.data

import com.example.storagejourney.journey.JourneyLog     // the observable trace we record steps into
import com.example.storagejourney.journey.JourneyStage   // which layer each step belongs to
import kotlinx.coroutines.flow.Flow                       // reactive stream type re-exposed from the DAO

// ---------------------------------------------------------------------------
// DATA  (the storage boundary)
// ---------------------------------------------------------------------------

/**
 * The app's one storage component. Wraps [ItemDao] (the Room read/write surface) and the
 * [JourneyLog] (so each leg of the trip is recorded where it actually happens).
 *
 * @param dao     the generated Room DAO — the real door to SQLite.
 * @param journey the shared trace; the same instance the ViewModel exposes to the UI.
 */
class ItemRepository(
    private val dao: ItemDao,
    private val journey: JourneyLog,
) {

    /**
     * The live list of saved items, straight from Room's reactive query.
     *
     * We simply re-expose the DAO's [Flow] here. Whoever collects it (the ViewModel) gets a
     * fresh list every time the table changes — that is the "return trip" of the journey.
     */
    val items: Flow<List<StoredItem>> = dao.observeItems()

    /**
     * Persist one element — the heart of the WRITE path.
     *
     * Steps recorded here (so the in-app log matches reality):
     *   • REPOSITORY — we are about to hand the element to the engine via a suspend insert.
     *   • ROOM       — the insert returned the new primary key, which means SQLite has
     *                  COMMITTED the row to the journey.db file on disk.
     *
     * `suspend` ripples up: because [ItemDao.insert] is suspend, so is this function, so its
     * caller (the ViewModel) must launch it in a coroutine. That is how the disk write stays
     * off the main thread without us ever naming a background thread.
     *
     * @return the new row's auto-generated id, straight from SQLite.
     */
    suspend fun save(item: StoredItem): Long {
        journey.record(
            JourneyStage.REPOSITORY,
            "Repository.save(...) handed the element to the engine: dao.insert(item) — a " +
                "suspend write Room runs off the main thread.",
        )
        val newId = dao.insert(item)                       // <-- THE write; suspends until SQLite commits
        journey.record(
            JourneyStage.ROOM,
            "Room executed INSERT INTO items(...) and SQLite committed the row to " +
                "journey.db as id #$newId. The element is now on disk.",
        )
        return newId
    }

    /** Delete one element (suspend Room delete by primary key). */
    suspend fun delete(item: StoredItem) = dao.delete(item)

    /** Wipe every row (suspend Room delete-all) — the "Clear storage" action. */
    suspend fun clear() = dao.clearAll()
}
