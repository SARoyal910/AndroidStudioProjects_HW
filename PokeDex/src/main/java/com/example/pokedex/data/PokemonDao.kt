// =============================================================================
// PokemonDao.kt  —  THE DATA ACCESS OBJECT (queries for the cache table)
//
// CONCEPT: LOCAL PERSISTENCE with Room — the READ/WRITE surface. You DESCRIBE the
// queries as an annotated interface; Room generates the implementation at build
// time (via KSP). Same idea as RoomAndPreferences' NoteDao.
//
// WHAT TO INSPECT:
//   • observeAll(): Flow<List<CachedPokemon>>  — a REACTIVE query. Room re-emits a
//        fresh list EVERY TIME the table changes, so when the repository upserts
//        freshly-fetched data the list screen redraws itself with no manual refresh.
//   • upsert(...) with onConflict = REPLACE     — insert-or-overwrite by name; this
//        is how the cache stays current ("write what you fetched").
//   • suspend on the writes + the single read    — disk I/O must run off the main
//        thread, so those are suspend functions the repository calls from coroutines.
// =============================================================================

package com.example.pokedex.data

import androidx.room.Dao             // marks an interface as a Room Data Access Object
import androidx.room.Insert          // generates an INSERT statement
import androidx.room.OnConflictStrategy  // REPLACE = overwrite an existing row with the same key
import androidx.room.Query           // attach a custom SQL string to a function
import kotlinx.coroutines.flow.Flow  // a stream Room re-emits on every table change

@Dao
interface PokemonDao {

    /**
     * Observe the whole cache as a reactive stream, ordered by Pokédex number.
     * The list screen collects this; any upsert re-emits a fresh list automatically.
     */
    @Query("SELECT * FROM cached_pokemon ORDER BY dexNumber ASC")
    fun observeAll(): Flow<List<CachedPokemon>>

    /** Read one cached row by name (NULL if not cached yet). Used by the detail path. */
    @Query("SELECT * FROM cached_pokemon WHERE name = :name LIMIT 1")
    suspend fun getByName(name: String): CachedPokemon?

    /** Insert-or-replace ONE row (e.g. after fetching a detail). */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(pokemon: CachedPokemon)

    /** Insert-or-replace a WHOLE list (e.g. after fetching the list endpoint). */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(pokemon: List<CachedPokemon>)
}
