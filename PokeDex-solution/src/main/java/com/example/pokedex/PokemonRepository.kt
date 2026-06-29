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
// SOLUTION: providePokemonRepository(...) defaults to useFake = false, so the
// finished app fetches LIVE from PokéAPI and caches into Room. Pass useFake = true
// for a fully-offline demo; the unit tests construct the fakes directly.
//
// "OFFLINE-FIRST" means: the UI always reads the Room CACHE (so it shows instantly
// and works offline); the network only REFRESHES that cache in the background.
// ===========================================================================

package com.example.pokedex

import android.content.Context
import com.example.pokedex.data.CachedPokemon
import com.example.pokedex.data.PokemonDao
import com.example.pokedex.data.PokemonDatabase
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map

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
// REAL IMPLEMENTATION  —  network + cache, offline-first         [SOLUTION — D2]
//
// "Offline-first" = the UI always reads the Room CACHE (so it shows instantly and
// works with no network); the network only REFRESHES that cache in the background.
// ===========================================================================

class RealPokemonRepository(
    private val api: PokemonApi,
    private val dao: PokemonDao,
) : PokemonRepository {

    // D2a — the UI reads the CACHE. We map the DAO's reactive Flow of entities to a
    // Flow of domain summaries. Because it's Room's live Flow, a successful refresh
    // (below) re-emits a fresh list and the screen redraws itself for free.
    override fun observePokemon(): Flow<List<PokemonSummary>> =
        dao.observeAll().map { rows -> rows.map { PokemonSummary(it.dexNumber, it.name) } }

    // D2b — fetch the list and add any NEW Pokémon to the cache. We use
    // insertNewSummaries (IGNORE), NOT upsertAll (REPLACE): the list endpoint only
    // knows name + dexNumber, so REPLACE would wipe the height/weight/types of any
    // Pokémon whose detail we'd already cached. If the network is down this throws —
    // and the already-cached Flow keeps feeding the UI, so the user still sees data.
    override suspend fun refreshList() {
        val response = api.listPokemon()
        val rows = response.results.map { dto ->
            val summary = dto.toSummary()
            CachedPokemon(name = summary.name, dexNumber = summary.dexNumber)
        }
        dao.insertNewSummaries(rows)
    }

    // D2c — cache-then-network for one Pokémon. If the cached row is already
    // hydrated (detail columns present), return it without hitting the network.
    // Otherwise fetch it, write the FULL row (REPLACE via upsert), and return it.
    override suspend fun getDetail(name: String): PokemonDetail {
        dao.getByName(name)?.toDetailOrNull()?.let { return it }   // cache hit
        val detail = api.getPokemon(name).toDetail()               // miss -> network
        dao.upsert(detail.toCacheRow())                            // hydrate the cache
        return detail
    }
}

// --- cache <-> domain mappers (the typesCsv round-trip) --------------------

/** A hydrated cache row -> domain detail; null if this row holds only the summary. */
private fun CachedPokemon.toDetailOrNull(): PokemonDetail? {
    if (heightMeters == null || weightKg == null || typesCsv == null) return null
    val types = typesCsv.split(",").filter { it.isNotBlank() }
        .map { PokemonType(it, typeEmoji(it)) }
    return PokemonDetail(dexNumber, name, types, heightMeters, weightKg)
}

/** Domain detail -> a fully-hydrated cache row (types flattened to a CSV string). */
private fun PokemonDetail.toCacheRow(): CachedPokemon =
    CachedPokemon(
        name = name,
        dexNumber = dexNumber,
        heightMeters = heightMeters,
        weightKg = weightKg,
        typesCsv = types.joinToString(",") { it.name },
    )

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
 * SOLUTION: defaults to the REAL repository — the finished app fetches LIVE from
 * PokéAPI and caches into Room (PokéAPI is free + keyless, so no secrets needed).
 * Pass `useFake = true` to run fully offline against the hardcoded sample (handy
 * for demos with no network; the unit tests construct the fakes directly).
 */
fun providePokemonRepository(context: Context, useFake: Boolean = false): PokemonRepository =
    if (useFake) {
        FakePokemonRepository()                 // offline: works with no internet
    } else {
        RealPokemonRepository(                   // live (default): PokéAPI + Room cache
            api = providePokemonApi(),
            dao = PokemonDatabase.getInstance(context).pokemonDao(),
        )
    }
