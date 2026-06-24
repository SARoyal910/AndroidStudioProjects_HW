// =============================================================================
// ItemDatabase.kt  —  THE STORAGE COMPONENT ITSELF (the Room database holder)
//
// CONCEPT: this abstract class is the single connection point to the actual SQLite
// FILE on disk ("journey.db"). It ties the @Entity (StoredItem) to the @Dao (ItemDao)
// and is what `Room.databaseBuilder(...)` brings to life. THIS is the "storage
// component" the project title talks about — the thing the element is added to.
//
// WHY abstract + WHERE is the real code? Room GENERATES the concrete subclass
// (ItemDatabase_Impl) and the DAO implementation (ItemDao_Impl) at build time via KSP.
// That is why the class and `itemDao()` are `abstract` — YOU never implement them; the
// build does. (After a build you can see them under app/build/generated/.)
//
// WHAT TO INSPECT HERE:
//   • @Database(entities = [StoredItem::class], version = 1) — lists every table and the
//        schema version (bump it + add a Migration whenever a shipped column changes).
//   • abstract fun itemDao() — Room implements this to return the generated DAO.
//   • getInstance() — a thread-safe SINGLETON. Opening two databases over the same file
//        is wasteful and can corrupt state, so we build exactly one and cache it.
// =============================================================================
package com.example.storagejourney.data

import android.content.Context              // needed by Room.databaseBuilder to locate app storage
import androidx.room.Database               // marks this class as the Room database + lists its tables
import androidx.room.Room                   // the factory used to build the database instance
import androidx.room.RoomDatabase           // base class every Room database extends

// ---------------------------------------------------------------------------
// DATA  (database holder)
// ---------------------------------------------------------------------------

/**
 * The app's Room database. Holds the single "items" table and exposes its DAO.
 *
 * `abstract`: Room generates the real subclass (ItemDatabase_Impl) at compile time. The
 * @Database annotation tells Room which entities (tables) belong to this database and the
 * schema version.
 */
@Database(
    entities = [StoredItem::class],         // <-- every table in this DB; here just StoredItem
    version = 1,                            // schema version; increment when columns change
    exportSchema = false,                   // <-- skip writing schema JSON (no schema dir needed for the demo)
)
abstract class ItemDatabase : RoomDatabase() {

    /**
     * Room implements this to return the generated [ItemDao]. Calling `db.itemDao()` gives
     * you the object whose annotated methods run real SQLite operations.
     */
    abstract fun itemDao(): ItemDao         // <-- Room fills this in with ItemDao_Impl

    // -----------------------------------------------------------------------
    // SINGLETON — exactly ONE database instance per process.
    //
    // `companion object` = a block of members that belong to the CLASS itself, not to any
    // instance (Kotlin's version of "static"). You call them as ItemDatabase.getInstance(…).
    // -----------------------------------------------------------------------
    companion object {
        // @Volatile: a write to INSTANCE is immediately visible to all threads, which makes
        // the double-checked locking below correct under concurrency.
        @Volatile private var INSTANCE: ItemDatabase? = null

        /**
         * Return the shared [ItemDatabase], creating it on first use.
         *
         * READ THE `?:` (the "elvis" operator) AS "if the left side is null, use the right":
         *   INSTANCE ?: synchronized(this) { ... }
         *   = "if we already built it, return it; otherwise enter the lock and build it once."
         * The inner `INSTANCE ?:` re-checks after acquiring the lock so two threads racing on
         * first launch can't each build their own database for the same file.
         */
        fun getInstance(context: Context): ItemDatabase =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,             // applicationContext => no Activity leak
                    ItemDatabase::class.java,               // the database class to implement
                    "journey.db",                           // the SQLite FILE name on disk
                ).build().also { INSTANCE = it }            // cache the instance for next time
            }
    }
}
