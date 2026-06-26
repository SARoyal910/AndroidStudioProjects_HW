// =============================================================================
// PokemonApi.kt  —  RETROFIT: turning a Kotlin interface into real HTTP calls
//
// CONCEPT THIS FILE TEACHES: with Retrofit you DESCRIBE each endpoint as an
// annotated interface method; Retrofit generates the actual networking code at
// runtime. You never open a socket or build a URL by hand. This file is a
// near-verbatim copy of NetworkParsing's WeatherApi.kt — two endpoints instead
// of one, against PokéAPI instead of Open-Meteo.
//
// THE TWO ENDPOINTS (PokéAPI — FREE, no API key, no account):
//   GET v2/pokemon?limit=151&offset=0      -> a page of { name, url } summaries
//   GET v2/pokemon/{name}                  -> one Pokémon's full detail
//
// WHAT TO INSPECT:
//   1. @GET("pokemon")          — relative path appended to the Retrofit baseUrl.
//   2. @Query(...)              — each becomes one ?key=value in the URL.
//   3. @Path("name")            — substitutes into the {name} slot in the path.
//   4. `suspend fun`            — the call is a coroutine; it suspends, not blocks.
//   5. providePokemonApi()      — baseUrl + the kotlinx.serialization JSON converter.
//   6. There is NO api-key parameter anywhere — PokéAPI is open and keyless.
// =============================================================================

package com.example.pokedex

// Tells Retrofit/OkHttp the response media type when wiring the converter.
import okhttp3.MediaType.Companion.toMediaType
// The configurable JSON engine; we set ignoreUnknownKeys so the dozens of fields
// we DON'T model (sprites, stats, moves, …) are dropped instead of throwing.
import kotlinx.serialization.json.Json
// Retrofit's builder — assembles a working client from baseUrl + converter.
import retrofit2.Retrofit
// The bridge that lets Retrofit decode bodies with kotlinx.serialization.
import retrofit2.converter.kotlinx.serialization.asConverterFactory
// The HTTP annotations used below.
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

// ===========================================================================
// API SURFACE  —  the two endpoints, described as an interface
// ===========================================================================

/**
 * PokemonApi — the Retrofit description of the PokéAPI endpoints we use. Retrofit
 * creates the concrete implementation at runtime (see [providePokemonApi]).
 */
interface PokemonApi {

    /**
     * GET {baseUrl}pokemon?limit=…&offset=… -> a page of name/url summaries.
     * Each `@Query` becomes one `?name=value` (or `&name=value`) in the URL.
     */
    @GET("pokemon")
    suspend fun listPokemon(
        @Query("limit") limit: Int = 151,      // how many to fetch (151 = the original Gen-1 set)
        @Query("offset") offset: Int = 0,       // where to start (0 = from the top)
    ): PokemonListResponseDto

    /**
     * GET {baseUrl}pokemon/{name} -> one Pokémon's full detail object.
     * `@Path("name")` substitutes into the `{name}` slot, e.g. pokemon/pikachu.
     */
    @GET("pokemon/{name}")
    suspend fun getPokemon(
        @Path("name") name: String,
    ): PokemonDetailDto
}

// ===========================================================================
// RETROFIT ASSEMBLY  —  baseUrl + the kotlinx.serialization JSON converter
// ===========================================================================

// The robust JSON parser. ignoreUnknownKeys = true is the #1 real-world setting:
// the real detail JSON has dozens of fields we don't model, and without this the
// first unmodelled key would make decoding throw.
private val json = Json { ignoreUnknownKeys = true }

/**
 * Build a ready-to-use [PokemonApi] backed by Retrofit.
 *   • baseUrl — the root every @GET path is appended to. MUST end in "/".
 *   • addConverterFactory — installs the kotlinx.serialization converter so bodies
 *     are decoded by [json] into our @Serializable DTOs.
 *   • create(...) — Retrofit generates the implementation of PokemonApi.
 */
fun providePokemonApi(): PokemonApi =
    Retrofit.Builder()
        .baseUrl("https://pokeapi.co/api/v2/")  // trailing "/" is required by Retrofit
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()
        .create(PokemonApi::class.java)
