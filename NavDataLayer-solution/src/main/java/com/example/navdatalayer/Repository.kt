// =============================================================================
// Repository.kt
//
// THE DATA LAYER. This file is the entire point of the "Nav Data Layer" lesson.
//
// THE LESSON (read this once and the whole app makes sense):
//   Screens should NOT own or hardcode their data. Instead, data lives behind a
//   *repository* — a small interface that says WHAT data is available but hides
//   HOW (and from WHERE) it is fetched. The UI asks the repository for data
//   through a ViewModel and simply *reacts* to whatever arrives.
//
//   Why bother? Because the source of truth can then change — in-memory today,
//   a Room database or a Retrofit network call tomorrow — WITHOUT editing a
//   single line of the screens or the ViewModel. They depend on the INTERFACE,
//   not the implementation. That is the "data boundary".
//
// This file contains:
//   1. The plain data models (Category, Item) — the shapes that cross the boundary.
//   2. The PlanetRepository INTERFACE — the boundary contract itself.
//   3. InMemoryPlanetRepository — one concrete implementation (fake/sample data,
//      with an artificial delay so the UI's Loading state is actually visible).
//   4. Big sign-posted comments showing EXACTLY where a Room DAO or a Retrofit
//      service would slot in — by swapping ONLY this implementation.
// =============================================================================

// Package declaration — must match the folder path under src/main/java/.
package com.example.navdatalayer

// --- Coroutines / Flow imports -----------------------------------------------
import kotlinx.coroutines.delay                       // suspends a coroutine for a time, WITHOUT blocking a thread
import kotlinx.coroutines.flow.Flow                   // a cold, asynchronous stream of values over time
import kotlinx.coroutines.flow.flow                   // builder that emits values into a Flow (flow { emit(...) })
import kotlinx.coroutines.flow.emitAll                // C3 — forwards every value of another Flow into this one

// ===========================================================================
// DATA MODELS
// These are plain, dumb value objects — just the SHAPE of the data that crosses
// the repository boundary. They contain no logic and know nothing about where
// they came from (memory, disk, or network) or where they are shown.
// ===========================================================================

/**
 * A top-level grouping of planets (e.g. "Rocky Planets", "Gas Giants").
 *
 * @property id          stable unique identifier (the "primary key").
 * @property name        short label shown as the category row.
 * @property description one-line summary shown under the name.
 */
data class Category(val id: Int, val name: String, val description: String)

/**
 * A single planet — the unit of data shown in the list and detail screens.
 *
 * @property id         stable unique identifier (travels inside the nav key).
 * @property categoryId which Category this item belongs to (the "foreign key").
 * @property title      short name shown as the row/headline.
 * @property blurb      one-line description shown under the title.
 * @property fact       a longer "fun fact" shown on the detail screen.
 */
data class Item(
    val id: Int,
    val categoryId: Int,
    val title: String,
    val blurb: String,
    val fact: String,
)

// ===========================================================================
// SAMPLE DATA
// The hardcoded planets. NOTE WHERE THIS LIVES: inside the data layer, NOT in
// the screens. The screens never see this list directly — they only ever get
// what the repository hands them. This is the whole discipline being taught.
// ===========================================================================

// The two categories. `internal` so previews/tests in this module can read them,
// but the screens are expected to receive data via the repository, not reach in.
internal val sampleCategories = listOf(
    Category(1, "Rocky Planets", "Small, dense worlds with solid surfaces."),
    Category(2, "Gas Giants", "Massive planets made mostly of gas."),
)

// The planets. Each one's `categoryId` ties it back to a Category (1 = Rocky,
// 2 = Gas Giant). In a real app these rows would come from a database table or
// a JSON response — see the RoomPlanetRepository / RetrofitPlanetRepository notes.
internal val samplePlanets = listOf(
    Item(1, 1, "Mercury", "The smallest planet and the closest to the Sun.",
        "A year on Mercury is just 88 Earth days, but a single day lasts 176."),
    Item(2, 1, "Venus", "The hottest planet, wrapped in thick clouds of acid.",
        "Venus spins backwards, so the Sun rises in the west and sets in the east."),
    Item(3, 1, "Earth", "The only planet known to support life — so far.",
        "Earth is the only planet not named after a Greek or Roman god."),
    Item(4, 1, "Mars", "The red planet, a frequent target for rovers.",
        "Mars hosts Olympus Mons, the tallest volcano in the solar system."),
    Item(5, 2, "Jupiter", "The largest planet, a gas giant with a great red spot.",
        "Jupiter's Great Red Spot is a storm wider than the entire Earth."),
    Item(6, 2, "Saturn", "The ringed gas giant, second largest in the system.",
        "Saturn is so light it would float in water — if you found a big enough tub."),

    // C1 — two NEW gas giants (categoryId 2). WHY does adding rows here need ZERO
    // changes to MainActivity.kt or PlanetsViewModel.kt? Because the UI never sees
    // this list. The screens get their data ONLY from the repository, through the
    // PlanetRepository interface: PlanetsViewModel calls repo.planets() and renders
    // whatever Flow<List<Item>> arrives; PlanetDetailScreen calls repo.planet(id).
    // The list IS the data source behind that interface, so growing it just makes the
    // existing Flow emit more items — the ViewModel maps them to Success and the
    // LazyColumn draws every row it's handed. That is the whole point of the data boundary.
    Item(7, 2, "Uranus", "The tilted ice giant that rolls on its side.",          // C1
        "Uranus rotates almost completely sideways, so its poles take turns facing the Sun."),
    Item(8, 2, "Neptune", "The windiest planet, a deep-blue ice giant.",          // C1
        "Neptune has the fastest winds in the solar system — over 2,000 km/h."),
)

// Resolve a Category by id. Used only by screens that already received an Item
// (so the category is guaranteed to exist); `first` is therefore safe here.
internal fun categoryById(id: Int): Category = sampleCategories.first { it.id == id }

// ===========================================================================
// THE REPOSITORY INTERFACE — *** THE DATA BOUNDARY ***
//
// This interface is the contract between the UI side (ViewModel + screens) and
// the data side (memory / database / network). The UI depends ONLY on this
// interface. It never references InMemoryPlanetRepository directly, so any class
// that honours this contract can be dropped in without touching the UI.
// ===========================================================================

/**
 * The data-layer boundary for planets.
 *
 * The ViewModel talks to THIS — never to a concrete data source. Swapping the
 * implementation (memory → Room → Retrofit) changes nothing above this line.
 */
interface PlanetRepository {

    /**
     * A STREAM of the planet list.
     *
     * Returning a [Flow] (rather than a one-shot `List`) means the data source
     * can push NEW values over time — e.g. a Room `@Query` re-emits automatically
     * whenever the underlying table changes. The UI observes the stream and
     * re-renders on every emission.
     */
    fun planets(): Flow<List<Item>>

    /**
     * Fetch a SINGLE planet by id, or `null` if none exists.
     *
     * This is a one-shot `suspend` read (like loading one row, or one network
     * GET). It is `suspend` because it may take time and must not block the UI.
     */
    suspend fun planet(id: Int): Item?
}

// ===========================================================================
// CONCRETE IMPLEMENTATION #1 — IN-MEMORY (the only one wired up today)
// ===========================================================================

/**
 * An in-memory [PlanetRepository] backed by the hardcoded [samplePlanets] list.
 *
 * It deliberately adds an artificial [delay] before emitting so the UI's
 * **Loading** state is visible during the lesson (a real database or network
 * call would have genuine latency here). Everything above this class — the
 * ViewModel and every screen — is written against [PlanetRepository] and is
 * completely unaware that the data happens to be a fixed Kotlin list.
 */
// C2 — a compile-checked switch for the demo modes (no stringly-typed "ok"/"error").
// An enum means a typo is a COMPILE error and the `when` below can be exhaustive.
enum class Simulate { OK, EMPTY, ERROR }                  // C2

class InMemoryPlanetRepository(
    private val simulate: Simulate = Simulate.OK,          // C2 — default: behave normally. SET THIS BACK TO OK before C3.
) : PlanetRepository {

    // Tunable fake latency so Loading/Detail-loading states are observable.
    private val fakeLatencyMillis = 1_200L

    /**
     * Emit the planet list once, after a simulated delay.
     *
     * `flow { ... }` builds a COLD stream: the delay + emit only run when a
     * collector starts collecting (here, the ViewModel inside viewModelScope).
     *
     * ┌──────────────────────────────────────────────────────────────────────┐
     * │ SWAP POINT — this is the ONLY method a real data source would change.  │
     * │                                                                        │
     * │  • RoomPlanetRepository would return planetDao.observePlanets()        │
     * │    — a Flow<List<Item>> that Room re-emits whenever the table changes. │
     * │  • RetrofitPlanetRepository would do:                                  │
     * │        flow { emit(api.getPlanets()) }                                 │
     * │    (or wrap it in a cache). The `suspend` network call replaces        │
     * │    `delay + samplePlanets`.                                            │
     * │                                                                        │
     * │  In BOTH cases the return TYPE stays Flow<List<Item>>, so the          │
     * │  ViewModel and the screens do not change AT ALL.                       │
     * └──────────────────────────────────────────────────────────────────────┘
     */
    // C2 — WHAT DOES RETRY DO IN ERROR MODE, AND WHY CAN IT NEVER SUCCEED?
    //   Retry (PlanetsViewModel.retry) resets the state to Loading and calls
    //   observePlanets() again, which re-collects this cold flow and RE-RUNS this body.
    //   But `simulate` is fixed at construction to ERROR, so every fresh collection
    //   hits the `throw` branch again -> the .catch in the ViewModel maps it back to
    //   Error. Retry keeps re-running deterministically failing code, so it can NEVER
    //   succeed here — the failure is permanent, not transient. (C3 builds a repository
    //   whose first attempt fails but later ones succeed, which is what makes Retry useful.)
    override fun planets(): Flow<List<Item>> = flow {
        delay(fakeLatencyMillis)            // pretend we're hitting a disk/network — makes Loading visible
        when (simulate) {                                                      // C2 — exhaustive over the enum
            Simulate.OK    -> emit(samplePlanets)                             // C2 -> the UI's Success state
            Simulate.EMPTY -> emit(emptyList())                              // C2 -> the UI's Empty state
            Simulate.ERROR -> throw IllegalStateException("Simulated data-source failure") // C2 -> Error + Retry
        }
    }

    /**
     * Look up one planet by id after a (shorter) simulated delay.
     *
     * SWAP POINT: a real implementation would be `planetDao.findById(id)`
     * (Room) or `api.getPlanet(id)` (Retrofit). Same signature, same `null`-for-
     * missing contract, so the detail screen is unaffected.
     */
    override suspend fun planet(id: Int): Item? {
        delay(fakeLatencyMillis / 2)        // shorter fake latency for the single-item detail load
        return samplePlanets.firstOrNull { it.id == id }   // null when not found — caller handles it
    }
}

// ===========================================================================
// C3 — CONCRETE IMPLEMENTATION #2 (LIVE): A FLAKY REPOSITORY
// ===========================================================================

// C3 — a flaky repository: FAILS the first collection, SUCCEEDS on every later one.
//
// WHY DOES RETRY REACH THIS CODE AGAIN AT ALL?
//   The list flow is COLD. repo.planets() returns a flow { } whose body does NOT run
//   until something collects it. The ViewModel's observePlanets() ends in
//   .launchIn(viewModelScope), which STARTS a collection. retry() calls
//   observePlanets() a SECOND time, which launches a SECOND collection of the same
//   cold flow — so the flow { } body runs AGAIN from the top. Each fresh collection
//   re-executes `attempts++`, and on the 2nd run attempts == 2, so we skip the throw
//   and emitAll the real data. Cold = "re-run the body per collector"; that re-run is
//   exactly what lets Retry escape a transient failure.
class FlakyPlanetRepository(
    // C3 — Explicitly OK — don't inherit whatever demo mode C2 left as the default.
    private val wrapped: PlanetRepository = InMemoryPlanetRepository(Simulate.OK),
) : PlanetRepository {

    private var attempts = 0                               // C3 — how many times planets() has been collected

    override fun planets(): Flow<List<Item>> = flow {
        attempts++                                         // C3 — the flow body runs on EVERY collection (cold flow)
        if (attempts == 1) {
            delay(800)                                     // C3 — a little fake latency before failing
            throw IllegalStateException("Network hiccup — try again")  // C3 — first try always fails
        }
        emitAll(wrapped.planets())                         // C3 — afterwards: defer to the real repository
    }

    // C3 — Required by the interface. Note: the app never actually calls THIS delegate —
    // PlanetDetailScreen builds its OWN InMemoryPlanetRepository (you'll see it in C4).
    override suspend fun planet(id: Int): Item? = wrapped.planet(id)
}

// ===========================================================================
// CONCRETE IMPLEMENTATION #2 & #3 — WHERE ROOM / RETROFIT WOULD PLUG IN
//
// These are intentionally left as commented SIGN-POSTS, not live code (this
// teaching project ships no Room/Retrofit dependencies). The point is the
// SHAPE: each one implements the SAME PlanetRepository interface, so wiring one
// in is a one-line change in MainActivity (the ViewModel's default constructor
// arg) — the ViewModel and every screen stay byte-for-byte identical.
//
//   // --- Room (local database) -------------------------------------------
//   class RoomPlanetRepository(private val dao: PlanetDao) : PlanetRepository {
//       override fun planets(): Flow<List<Item>> = dao.observePlanets()
//       override suspend fun planet(id: Int): Item? = dao.findById(id)
//   }
//
//   // --- Retrofit (remote network API) -----------------------------------
//   class RetrofitPlanetRepository(private val api: PlanetApi) : PlanetRepository {
//       override fun planets(): Flow<List<Item>> = flow { emit(api.getPlanets()) }
//       override suspend fun planet(id: Int): Item? = api.getPlanet(id)
//   }
//
// Swapping it in (MainActivity):
//   PlanetsViewModel(repo = RoomPlanetRepository(dao))      // instead of InMemoryPlanetRepository()
// ===========================================================================
