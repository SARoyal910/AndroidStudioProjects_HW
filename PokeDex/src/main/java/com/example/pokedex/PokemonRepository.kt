// =============================================================================
// PokemonRepository.kt  —  ONE SOURCE OF TRUTH: offline-first, REAL vs FAKE
//
// CONCEPT THIS FILE TEACHES: the ViewModels should not care WHERE Pokémon come
// from. They ask a PokemonRepository; behind that interface sits either a REAL
// implementation (PokéAPI over the network + Room cache) or a FAKE one (hardcoded
// data, no network, no Room). Swapping them is a ONE-LINE change — which is what
// lets the app and its unit tests run completely OFFLINE. Same shape as
// NetworkParsing's WeatherRepository.
//
// >>> WHAT RUNS OUT OF THE BOX: the FAKE. <<<
// providePokemonRepository(...) defaults to useFake = true, so pressing Run shows
// sample Pokémon immediately with NO internet. Your job (Part D2) is to implement
// RealPokemonRepository, then flip useFake to false to go LIVE + cached.
//
// "OFFLINE-FIRST" means: the UI always reads the Room CACHE (so it shows instantly
// and works offline); the network only REFRESHES that cache in the background.
// ===========================================================================

package com.example.pokedex

import android.content.Context
import com.example.pokedex.data.PokemonDao
import com.example.pokedex.data.PokemonDatabase
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf

// ===========================================================================
// REPOSITORY CONTRACT  —  what the ViewModels depend on
// ===========================================================================

/**
 * PokemonRepository — the abstraction the ViewModels talk to. It hides whether the
 * data arrives from PokéAPI + Room or from a hardcoded fake.
 */
interface PokemonRepository {
    /** The cached list the list screen reads (live; offline-first source of truth). */
    fun observePokemon(): Flow<List<PokemonSummary>>

    /** Fetch the list endpoint and write it into the cache. May THROW (no network). */
    suspend fun refreshList()

    /** Return one Pokémon's detail (cache-first, then network). May THROW. */
    suspend fun getDetail(name: String): PokemonDetail
}

// ===========================================================================
// REAL IMPLEMENTATION  —  network + cache, offline-first              [YOUR JOB]
//
// >>> PART D2: implement the three methods. <<<
//
// They are TODO() stubs for now. Because the app defaults to the FAKE, these never
// run until you flip the switch — so the project still compiles and launches.
// Use [api] (PokemonApi.kt) for the network and [dao] (PokemonDao.kt) for the cache,
// and the mappers in Pokemon.kt (toSummary/toDetail) to convert DTOs -> domain.
// ===========================================================================

class RealPokemonRepository(
    private val api: PokemonApi,
    private val dao: PokemonDao,
) : PokemonRepository {

    override fun observePokemon(): Flow<List<PokemonSummary>> {
        // TODO D2a: map dao.observeAll() (a Flow<List<CachedPokemon>>) to
        //           Flow<List<PokemonSummary>> — e.g. dao.observeAll().map { rows ->
        //           rows.map { PokemonSummary(it.dexNumber, it.name) } }.
        //           The UI reads the CACHE, so it shows instantly and works offline.
        TODO("Part D2a: expose the cached list as a Flow<List<PokemonSummary>>")
    }

    override suspend fun refreshList() {
        // TODO D2b: api.listPokemon() -> map each NamedResourceDto.toSummary() ->
        //           dao.upsertAll(...) as CachedPokemon rows. If this throws (no
        //           network), the already-cached Flow keeps feeding the UI.
        TODO("Part D2b: fetch the list and upsert it into the cache")
    }

    override suspend fun getDetail(name: String): PokemonDetail {
        // TODO D2c: cache-then-network. If dao.getByName(name) already has the
        //           detail columns filled, return it. Otherwise api.getPokemon(name)
        //           -> toDetail(), upsert the hydrated row, and return it.
        TODO("Part D2c: return cached detail if present, else fetch + cache + return")
    }
}

// ===========================================================================
// FAKE IMPLEMENTATION  —  no network, no Room (powers the runnable starter)
//
// Returns a handful of hardcoded Pokémon after a short delay() so you can see the
// Loading spinner. It implements the WHOLE contract — crucially observePokemon()
// EMITS its sample summaries, which is how the list ViewModel reaches Success.
// ===========================================================================

class FakePokemonRepository : PokemonRepository {

    override fun observePokemon(): Flow<List<PokemonSummary>> =
        flowOf(SAMPLE_DETAILS.map { PokemonSummary(it.dexNumber, it.name) })

    override suspend fun refreshList() {
        delay(400)                              // pretend to hit the network; sample data is already "loaded"
    }

    override suspend fun getDetail(name: String): PokemonDetail {
        delay(400)                              // pretend to fetch; lets the spinner show
        return SAMPLE_DETAILS.firstOrNull { it.name == name } ?: SAMPLE_DETAILS.first()
    }
}

/** A few real Gen-1 Pokémon as ready-made domain objects (no mapper needed). */
private val SAMPLE_DETAILS: List<PokemonDetail> = listOf(
    PokemonDetail(1, "bulbasaur", listOf(PokemonType("grass", "🌿"), PokemonType("poison", "☠️")), 0.7, 6.9),
    PokemonDetail(4, "charmander", listOf(PokemonType("fire", "🔥")), 0.6, 8.5),
    PokemonDetail(7, "squirtle", listOf(PokemonType("water", "💧")), 0.5, 9.0),
    PokemonDetail(25, "pikachu", listOf(PokemonType("electric", "⚡")), 0.4, 6.0),
    PokemonDetail(39, "jigglypuff", listOf(PokemonType("normal", "⚪"), PokemonType("fairy", "🧚")), 0.5, 5.5),
    PokemonDetail(133, "eevee", listOf(PokemonType("normal", "⚪")), 0.3, 6.5),
)

// ===========================================================================
// THE SWITCH  —  pick FAKE (default, offline) or REAL (live + cached)
// ===========================================================================

/**
 * Factory that returns the repository the app should use.
 *
 * @param useFake DEFAULT true for the starter: the app runs offline on sample data
 *   out of the box. Once you implement [RealPokemonRepository] (Part D2), pass
 *   `useFake = false` (or change this default) to fetch LIVE from PokéAPI and cache
 *   into Room. PokéAPI is free + keyless, so the real path needs no secrets.
 */
fun providePokemonRepository(context: Context, useFake: Boolean = true): PokemonRepository =
    if (useFake) {
        FakePokemonRepository()                 // offline: works with no internet (DEFAULT for the starter)
    } else {
        RealPokemonRepository(                   // live: PokéAPI over the network + Room cache
            api = providePokemonApi(),
            dao = PokemonDatabase.getInstance(context).pokemonDao(),
        )
    }
