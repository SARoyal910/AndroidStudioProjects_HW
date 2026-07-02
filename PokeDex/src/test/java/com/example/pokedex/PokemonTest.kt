// =============================================================================
// PokemonTest.kt  —  UNIT TESTS (Part G) — run on the plain JVM, no emulator
//
// The two tests below ALREADY PASS against the provided code (the DTOs + the
// offline Fake). They show the two techniques you need: decoding JSON, and
// driving suspend repository code with runTest. The TODO checklist at the bottom
// is YOUR job — implement the mapper (Part B4) and the real repository (Part D2),
// then add tests that prove them.
//
// Run: right-click this file ▸ Run, or `./gradlew testDebugUnitTest`.
// =============================================================================

package com.example.pokedex

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import kotlinx.serialization.json.Json
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class PokemonTest {

    // A trimmed but REAL-shaped detail payload. It includes "base_experience",
    // which we do NOT model — proving ignoreUnknownKeys lets decoding succeed.
    private val detailJson = """
        {
          "id": 1,
          "name": "bulbasaur",
          "base_experience": 64,
          "height": 7,
          "weight": 69,
          "types": [
            { "slot": 1, "type": { "name": "grass" } },
            { "slot": 2, "type": { "name": "poison" } }
          ]
        }
    """.trimIndent()

    /** PROVIDED, passing: the DTOs decode the JSON (and drop unknown keys). */
    @Test
    fun detailDto_decodesFromJson_ignoringUnknownKeys() {
        val json = Json { ignoreUnknownKeys = true }
        val dto = json.decodeFromString<PokemonDetailDto>(detailJson)

        assertEquals(1, dto.id)
        assertEquals(7, dto.height)          // still raw DECIMETRES on the DTO
        assertEquals(69, dto.weight)         // still raw HECTOGRAMS on the DTO
        assertEquals(2, dto.types.size)
        assertEquals("grass", dto.types[0].type.name)
    }

    /** PROVIDED, passing: the Fake repository returns a Pokémon (no network). */
    @Test
    fun fakeRepository_getDetail_returnsPokemon() = runTest {
        val repo = FakePokemonRepository()
        val pikachu = repo.getDetail("pikachu")

        assertEquals("pikachu", pikachu.name)
        assertEquals(25, pikachu.dexNumber)
        assertTrue(pikachu.types.isNotEmpty())
    }

    // =========================================================================
    // TODO (Part G) — write these AFTER implementing the mapper (B4) & real repo (D2):
    //
    //   • mapper · dex number  — dexNumberFromUrl(".../pokemon/25/") == 25
    //   • mapper · units       — PokemonDetailDto(height = 7, weight = 69).toDetail()
    //                            gives heightMeters == 0.7 and weightKg == 6.9
    //   • mapper · type→emoji  — typeEmoji("grass") is your grass glyph; an unknown
    //                            type returns the fallback (does NOT crash)
    //   • mapper · summary     — NamedResourceDto("pikachu", ".../pokemon/25/")
    //                            .toSummary() == PokemonSummary(25, "pikachu")
    //
    //   NOTE: testing the ViewModels needs one extra step — they launch work in
    //   viewModelScope (Dispatchers.Main), which doesn't exist on a plain JVM test.
    //   Swap in a test dispatcher: Dispatchers.setMain(StandardTestDispatcher()) in
    //   an @Before and Dispatchers.resetMain() in @After (a "MainDispatcherRule").
    // =========================================================================


    @OptIn(ExperimentalCoroutinesApi::class)
    private val testDispatcher = StandardTestDispatcher()

    @OptIn(ExperimentalCoroutinesApi::class)
    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
    }

    @OptIn(ExperimentalCoroutinesApi::class)
    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun mapper_testAllConversions() {
        // Test URL parsing for dex number
        assertEquals(25, dexNumberFromUrl("https://pokeapi.co/api/v2/pokemon/25/"))
        assertEquals(1, dexNumberFromUrl("https://pokeapi.co/api/v2/pokemon/1"))

        // Test unit conversion (height dm -> m, weight hg -> kg)
        val dto = PokemonDetailDto(1, "bulbasaur", 7, 69, emptyList())
        val detail = dto.toDetail()
        assertEquals(0.7, detail.heightMeters, 0.001)
        assertEquals(6.9, detail.weightKg, 0.001)

        // Test type emoji mapping
        assertEquals("🌿", typeEmoji("grass"))
        assertEquals("🔥", typeEmoji("fire"))
        assertEquals("❓", typeEmoji("unknown"))
    }

    @Test
    fun toSummary_mapsDtoCorrectly() {
        val dto = NamedResourceDto("pikachu", "https://pokeapi.co/api/v2/pokemon/25/")
        val summary = dto.toSummary()
        assertEquals("pikachu", summary.name)
        assertEquals(25, summary.dexNumber)
    }


    @Test
    fun listViewModel_loadsDataFromFake() = runTest {

    }
}
