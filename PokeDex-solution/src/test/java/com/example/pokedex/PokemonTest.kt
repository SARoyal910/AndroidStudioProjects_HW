// =============================================================================
// PokemonTest.kt  —  UNIT TESTS (Part G) — SOLUTION — run on the plain JVM
//
// Two kinds of tests here:
//   • PURE tests of the mapper + decoding (Parts B1/B4) — trivial: call a function,
//     assert the output. No coroutines, no Android.
//   • ViewModel tests (Part E/G) — the VMs launch work in viewModelScope, which
//     uses Dispatchers.Main. There is no Main dispatcher on a plain JVM, so we
//     install a TEST dispatcher with a MainDispatcherRule (see bottom) and pass its
//     scheduler to runTest, so advanceUntilIdle() drives the VM's coroutines too.
//     The VMs take their repository as a constructor arg, so we inject a fake.
//
// Run: right-click ▸ Run, or `./gradlew testDebugUnitTest`. All 8 pass.
// =============================================================================

package com.example.pokedex

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.TestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TestWatcher
import org.junit.runner.Description

@OptIn(ExperimentalCoroutinesApi::class)
class PokemonTest {

    // Installs a test dispatcher as Dispatchers.Main for the duration of each test.
    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    // ---- Part B4 — the mapper (pure functions) ------------------------------

    @Test
    fun `dexNumberFromUrl parses the trailing number`() {
        assertEquals(25, dexNumberFromUrl("https://pokeapi.co/api/v2/pokemon/25/"))
        assertEquals(1, dexNumberFromUrl("https://pokeapi.co/api/v2/pokemon/1/"))
    }

    @Test
    fun `toDetail converts units decimetres to metres and hectograms to kg`() {
        val dto = PokemonDetailDto(
            id = 1, name = "bulbasaur", height = 7, weight = 69,
            types = listOf(TypeSlotDto(1, TypeRefDto("grass")), TypeSlotDto(2, TypeRefDto("poison"))),
        )
        val detail = dto.toDetail()
        assertEquals(1, detail.dexNumber)
        assertEquals(0.7, detail.heightMeters, 0.001)   // 7 dm -> 0.7 m
        assertEquals(6.9, detail.weightKg, 0.001)       // 69 hg -> 6.9 kg
        assertEquals(2, detail.types.size)
        assertEquals("grass", detail.types[0].name)
        assertEquals("🌿", detail.types[0].emoji)
    }

    @Test
    fun `typeEmoji maps known types and falls back for unknown`() {
        assertEquals("⚡", typeEmoji("electric"))
        assertEquals("🔥", typeEmoji("fire"))
        assertEquals("❓", typeEmoji("totally-made-up"))  // unknown -> fallback, never crashes
    }

    @Test
    fun `toSummary takes the dex number from the url`() {
        val summary = NamedResourceDto(name = "pikachu", url = "https://pokeapi.co/api/v2/pokemon/25/").toSummary()
        assertEquals(PokemonSummary(dexNumber = 25, name = "pikachu"), summary)
    }

    // ---- Part B1 — decoding (ignoreUnknownKeys) -----------------------------

    @Test
    fun `detail DTO decodes from JSON ignoring unknown keys`() {
        val json = Json { ignoreUnknownKeys = true }
        val dto = json.decodeFromString<PokemonDetailDto>(DETAIL_JSON)   // has an unmodelled "base_experience"
        assertEquals(1, dto.id)
        assertEquals(7, dto.height)
        assertEquals(69, dto.weight)
        assertEquals(2, dto.types.size)
        assertEquals("grass", dto.types[0].type.name)
    }

    // ---- Part G — ViewModels (fake repo + test dispatcher) ------------------

    @Test
    fun `list ViewModel reaches Success with the cached list`() = runTest(mainDispatcherRule.dispatcher) {
        val vm = PokemonListViewModel(FakePokemonRepository())
        advanceUntilIdle()                               // let init's coroutines run
        val state = vm.uiState.value
        assertTrue("expected Success but was $state", state is ListUiState.Success)
        assertTrue((state as ListUiState.Success).pokemon.isNotEmpty())
    }

    @Test
    fun `detail ViewModel reaches Success for a known Pokemon`() = runTest(mainDispatcherRule.dispatcher) {
        val vm = PokemonDetailViewModel(FakePokemonRepository())
        vm.load("pikachu")
        advanceUntilIdle()
        assertTrue(vm.uiState.value is DetailUiState.Success)
    }

    @Test
    fun `detail ViewModel reaches Error when the repository throws`() = runTest(mainDispatcherRule.dispatcher) {
        val vm = PokemonDetailViewModel(ThrowingRepository())
        vm.load("pikachu")
        advanceUntilIdle()
        assertTrue(vm.uiState.value is DetailUiState.Error)
    }
}

// A trimmed real-shaped detail payload; "base_experience" is NOT modelled, proving
// ignoreUnknownKeys lets decoding succeed.
private const val DETAIL_JSON = """
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
"""

/** A repository whose network calls always fail — used to drive the Error state. */
private class ThrowingRepository : PokemonRepository {
    override fun observePokemon(): Flow<List<PokemonSummary>> = flowOf(emptyList())
    override suspend fun refreshList() { throw RuntimeException("no network") }
    override suspend fun getDetail(name: String): PokemonDetail = throw RuntimeException("no network")
}

/**
 * MainDispatcherRule — swaps Dispatchers.Main for a TestDispatcher around each test
 * (and restores it after), so ViewModels that use viewModelScope can be tested on
 * the JVM. Expose the dispatcher so a test can `runTest(rule.dispatcher)` and share
 * its scheduler, making advanceUntilIdle() drive the ViewModel's coroutines.
 */
@OptIn(ExperimentalCoroutinesApi::class)
class MainDispatcherRule(
    val dispatcher: TestDispatcher = StandardTestDispatcher(),
) : TestWatcher() {
    override fun starting(description: Description) { Dispatchers.setMain(dispatcher) }
    override fun finished(description: Description) { Dispatchers.resetMain() }
}
