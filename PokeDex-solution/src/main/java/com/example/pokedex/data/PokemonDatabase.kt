// =============================================================================
// PokemonDatabase.kt  —  THE ROOM DATABASE (ties the entity + DAO into a DB file)
//
// CONCEPT: LOCAL PERSISTENCE with Room — the database holder + singleton. This is
// the single connection to the SQLite file on disk. Room generates the concrete
// PokemonDatabase_Impl at build time (KSP), which is why the class and dao() are
// `abstract`. Identical structure to RoomAndPreferences' NoteDatabase.
//
// WHAT TO INSPECT:
//   • @Database(entities = [CachedPokemon::class], version = 1)
//   • abstract fun pokemonDao()  — Room implements this to return the generated DAO.
//   • getInstance()              — a thread-safe SINGLETON (double-checked locking),
//        so the whole app shares ONE database for the "pokedex_cache.db" file.
// =============================================================================

package com.example.pokedex.data

import android.content.Context              // needed by Room.databaseBuilder to locate app storage
import androidx.room.Database               // marks this class as the Room database + lists its tables
import androidx.room.Room                   // factory used to build the database instance
import androidx.room.RoomDatabase           // base class every Room database extends

@Database(
    entities = [CachedPokemon::class],      // every table in this DB; here just the cache
    version = 1,                            // schema version; bump + migrate when columns change
    exportSchema = false,                   // skip writing schema JSON (none needed for the cache)
)
abstract class PokemonDatabase : RoomDatabase() {

    /** Room implements this to return the generated [PokemonDao]. */
    abstract fun pokemonDao(): PokemonDao

    companion object {
        // @Volatile: writes are immediately visible to all threads, making the
        // double-checked locking below correct under concurrency.
        @Volatile private var INSTANCE: PokemonDatabase? = null

        /** Return the shared database, creating it on first use (thread-safe). */
        fun getInstance(context: Context): PokemonDatabase =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,            // applicationContext => no Activity leak
                    PokemonDatabase::class.java,           // the database class to implement
                    "pokedex_cache.db",                    // the SQLite FILE name on disk
                ).build().also { INSTANCE = it }           // cache for next time
            }
    }
}
