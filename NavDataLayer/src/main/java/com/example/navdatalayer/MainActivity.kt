// =============================================================================
// MainActivity.kt
//
// THE UI LAYER for the "Nav Data Layer" sample. Built with:
//   • Jetpack Compose        — the declarative UI toolkit (no XML layouts).
//   • Navigation 3 (Nav3)    — the modern, Compose-first navigation library.
//   • Kotlinx Serialization  — used to mark navigation keys @Serializable.
//   • Lifecycle ViewModel    — holds UI state across rotation; survives the screen.
//
// THE LESSON THIS APP TEACHES (the whole reason it exists):
//   Screens do NOT own or hardcode data. They observe a *repository* through a
//   *ViewModel* and react to explicit UI states — Loading, Empty, Error, Success.
//   The hardcoded planets live in Repository.kt, behind the PlanetRepository
//   interface; the screens below never touch that list directly. Swap the
//   repository implementation (memory → Room → Retrofit) and these screens do
//   not change at all. See Repository.kt and PlanetsViewModel.kt.
//
//   Navigation flow (list → detail):
//     PlanetListScreen   --tap a planet-->   PlanetDetailScreen
//     (observes ViewModel)                   (loads its own planet via suspend)
//
// Reading order below: package + imports, then NAV KEYS, then the Activity, then
// the navigation host, then each screen (stateful wrapper + stateless body),
// then @Preview functions covering every UI state.
// =============================================================================

// Package declaration — matches the directory under src/main/java/.
package com.example.navdatalayer

// --- Android framework imports ------------------------------------------------
import android.os.Bundle                                    // savedInstanceState type passed to onCreate
import android.util.Log                                     // Logcat logging (Log.d, Log.e, ...)
import androidx.activity.ComponentActivity                  // base Activity class with Compose support
import androidx.activity.compose.setContent                 // bridges an Activity to a Compose UI tree
import androidx.activity.enableEdgeToEdge                    // lets the app draw behind the system bars

// --- Compose layout / foundation imports -------------------------------------
import androidx.compose.foundation.clickable                // makes a row tappable
import androidx.compose.foundation.layout.Arrangement        // controls spacing/alignment inside Row/Column
import androidx.compose.foundation.layout.Box               // overlap/centering container
import androidx.compose.foundation.layout.Column            // stacks children vertically
import androidx.compose.foundation.layout.Spacer            // empty box used to add fixed gaps
import androidx.compose.foundation.layout.fillMaxSize       // modifier: take all available width AND height
import androidx.compose.foundation.layout.fillMaxWidth      // modifier: take all available width
import androidx.compose.foundation.layout.height            // modifier: force a specific height
import androidx.compose.foundation.layout.padding           // modifier: add space around content
import androidx.compose.foundation.lazy.LazyColumn          // scrolling list (only renders visible rows)
import androidx.compose.foundation.lazy.items               // iterate a List inside a LazyColumn

// --- Material 3 component imports ---------------------------------------------
import androidx.compose.material3.Button                    // filled, tappable button
import androidx.compose.material3.CircularProgressIndicator  // the spinner shown during Loading
import androidx.compose.material3.HorizontalDivider         // thin horizontal separator line
import androidx.compose.material3.MaterialTheme             // access to the current theme's colors/typography
import androidx.compose.material3.Scaffold                  // standard screen frame (handles insets, bars, etc.)
import androidx.compose.material3.Surface                   // a themed background container (used for the banner)
import androidx.compose.material3.Text                      // draws text

// --- Compose runtime / tooling imports ---------------------------------------
import androidx.compose.runtime.Composable                  // marks a function as emitting UI
import androidx.compose.runtime.LaunchedEffect              // runs a suspend block tied to the composition
import androidx.compose.runtime.getValue                    // `by` delegate support for State reads
import androidx.compose.runtime.mutableStateOf              // creates observable State (used in the detail loader)
import androidx.compose.runtime.remember                    // remembers a value across recomposition
import androidx.compose.runtime.setValue                    // `by` delegate support for State writes
import androidx.compose.ui.Alignment                        // alignment constants (e.g. center) for Box/Column
import androidx.compose.ui.Modifier                         // the "how to lay out / decorate" object
import androidx.compose.ui.tooling.preview.Preview          // enables @Preview rendering in Android Studio
import androidx.compose.ui.unit.dp                          // density-independent pixel unit (e.g. 16.dp)

// --- Lifecycle + Compose interop imports -------------------------------------
import androidx.lifecycle.compose.collectAsStateWithLifecycle // observe a StateFlow as State, pausing when stopped
import androidx.lifecycle.viewmodel.compose.viewModel        // obtain a lifecycle-scoped ViewModel in a @Composable

// --- Navigation 3 imports -----------------------------------------------------
// Nav3 is the modern, Compose-first navigation approach: one Activity holds a
// back stack of "keys", and Compose swaps the screen when the top key changes.
import androidx.navigation3.runtime.NavKey                  // marker interface every navigation key implements
import androidx.navigation3.runtime.entryProvider           // DSL that maps each key type to a screen
import androidx.navigation3.runtime.rememberNavBackStack    // creates + remembers the back stack across recomposition
import androidx.navigation3.ui.NavDisplay                   // the composable that renders the current top key

// --- App + serialization imports ---------------------------------------------
import com.example.navdatalayer.ui.theme.NavDataLayerTheme  // our app's Material theme wrapper (see Theme.kt)
import kotlinx.serialization.Serializable                   // makes Nav3 keys serializable (required by Nav3)

// Logcat tag — filter Logcat by "DataLayer" to follow this app's breadcrumbs.
private const val TAG = "DataLayer"

// ===========================================================================
// NAVIGATION KEYS
// Each screen is identified by a "key" that also carries its arguments. Nav3
// requires keys to implement NavKey and be @Serializable (for state saving).
//   • ListKey   has no arguments — there is one planet-list screen.
//   • DetailKey carries a planetId — which single planet to show.
// ===========================================================================

// `data object` = a singleton; there is only ever one list screen.
@Serializable
data object ListKey : NavKey                                // first screen (no arguments)

// `data class` because each detail screen differs by which planet it shows.
@Serializable
data class DetailKey(val planetId: Int) : NavKey           // second screen; which planet was tapped

/**
 * MainActivity — the app's single Activity and the entry point Android launches.
 * In a Nav3 app you have exactly one Activity hosting the Compose UI + back stack.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)                 // always call through to the framework first
        enableEdgeToEdge()                                 // draw under the system bars for a modern look
        setContent {                                       // everything inside is the Compose UI
            NavDataLayerTheme {                            // apply colors, typography, dark/light handling
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    // Hand the inset padding to the nav host so screens stay in the safe area.
                    AppNavigation(modifier = Modifier.padding(innerPadding))
                }
            }
        }
    }
}

/**
 * AppNavigation — owns the navigation back stack and maps each key to its screen.
 *
 * NOTE: navigation carries only a tiny planetId in [DetailKey] — never the whole
 * object. The detail screen re-fetches its planet from the repository (via a
 * `suspend` call), reinforcing that the data layer, not the nav key, is the
 * source of truth.
 */
@Composable
fun AppNavigation(modifier: Modifier = Modifier) {
    // Back stack seeded with the list screen; preserved across recomposition.
    val backStack = rememberNavBackStack(ListKey)

    Log.d("LT", "Entered AppNavigation")                    // breadcrumb (filter Logcat by "DataLayer")

    NavDisplay(
        backStack = backStack,
        modifier = modifier,
        onBack = { backStack.removeLastOrNull() },          // system back = pop the top key
        // entryProvider is a DSL (a small "language" for one job): it builds the
        // map of "which key type -> which screen". You call entry<...> once per
        // screen inside the { } block, and Nav3 runs the block whose key type
        // matches the key currently on top of the back stack.
        //
        // How to read one  entry<KeyType> { key -> SomeScreen(...) }  line:
        //   • entry          — a Nav3 builder function (from
        //                      androidx.navigation3.runtime) that registers ONE
        //                      screen for ONE key type.
        //   • <KeyType>      — a GENERIC TYPE ARGUMENT, in angle brackets (a TYPE
        //                      slot, not a value in parentheses): the key type this
        //                      block handles. Nav3 matches it against the top key.
        //   • { key -> ... } — the @Composable CONTENT shown while that key is on
        //                      top. The lambda is handed the key instance, so a
        //                      data-class key can read its arguments (e.g. key.itemId).
        //                      A data-OBJECT key carries no data, so its block can
        //                      omit the `key ->` parameter.
        //
        // WHEN does an entry block RUN? entry<...> { } only REGISTERS a screen here
        // (like adding a `case` to a switch) — the { } body does NOT run yet. NavDisplay
        // runs the body whose key type matches the key currently on TOP of the back
        // stack: when you push that key (navigate forward), when you pop back to it, and
        // on recomposition while it is showing. A key in the stack but not on top is kept
        // (state preserved) but not drawn; popping it off removes its screen from
        // composition. So pushing a key turns its screen on and popping turns it off —
        // and `key` is the exact instance on top, so the same block runs with different
        // data per instance (e.g. ItemsKey(1) vs ItemsKey(5)).
        entryProvider = entryProvider {
            // LEVEL 1 — the planet LIST, driven entirely by the ViewModel's UI state.
            entry<ListKey> {
                PlanetListScreen(
                    // Tapping a planet pushes a DetailKey carrying only its id.
                    // THE JUMP — how a tap reaches the next screen: this line does NOT name a
                    // screen, it just ADDS A KEY to the back stack. NavDisplay then matches that
                    // key by its TYPE to the matching entry<...> { } block above and runs it; the
                    // id inside the key only chooses WHICH data that screen shows, not WHICH screen
                    // — so every key of this type lands on the same entry block.
                    onOpen = { planetId -> backStack.add(DetailKey(planetId)) }
                )
            }
            // LEVEL 2 — the DETAIL screen, which loads its own planet by id.
            entry<DetailKey> { key ->
                PlanetDetailScreen(
                    planetId = key.planetId,
                    onBack = { backStack.removeLastOrNull() }   // pop back to the list
                )
            }
        }
    )
}

// ===========================================================================
// TEACHING BANNER — a small reusable header explaining the data-boundary lesson.
// ===========================================================================

/**
 * A themed banner pinned to the top of the list screen, spelling out the lesson
 * so it is impossible to miss while learning.
 */
@Composable
private fun DataLayerBanner(modifier: Modifier = Modifier) {
    Log.d("LT", "Entered DataLayerBanner")
    Surface(
        modifier = modifier.fillMaxWidth(),
        color = MaterialTheme.colorScheme.secondaryContainer,   // tinted background to stand out
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Data-layer demo",
                style = MaterialTheme.typography.titleSmall,
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "This screen owns NO data. It observes a PlanetRepository " +
                    "through PlanetsViewModel and just renders the current state " +
                    "(Loading / Empty / Error / Success).",
                style = MaterialTheme.typography.bodySmall,
            )
        }
    }
}

// ===========================================================================
// LEVEL 1 — THE PLANET LIST SCREEN
//
// Split into TWO composables, a common and important pattern:
//   • PlanetListScreen      — STATEFUL wrapper: grabs the ViewModel, observes its
//                             StateFlow, and forwards the plain state downward.
//   • PlanetListScreenBody  — STATELESS body: takes a PlanetsUiState + callbacks
//                             and just renders. No ViewModel, no navigation. This
//                             is what the @Previews drive directly.
// ===========================================================================

/**
 * Stateful entry point for the list screen.
 *
 * It obtains a [PlanetsViewModel] (lifecycle-scoped, survives rotation), observes
 * its [PlanetsViewModel.uiState] with [collectAsStateWithLifecycle] (which pauses
 * collection while the screen is stopped), and hands the resulting plain state to
 * the stateless body. It deliberately holds NO data itself.
 *
 * @param onOpen invoked with a planet's id when a row is tapped.
 */
@Composable
fun PlanetListScreen(
    onOpen: (Int) -> Unit,
    modifier: Modifier = Modifier,
    // The ViewModel is obtained via viewModel(); its default repo is in-memory.
    viewModel: PlanetsViewModel = viewModel(),
) {
    Log.d("LT", "Entered PlanetListScreen")
    // Observe the StateFlow as Compose State. `by` unwraps it to a PlanetsUiState.
    // collectAsStateWithLifecycle() (not plain collectAsState) stops collecting
    // when the screen is in the background — the lifecycle-aware way to observe.
    // THREE ideas in one line —  val X by someStateFlow.collectAsStateWithLifecycle():
    //   1. someStateFlow                  — a StateFlow the ViewModel exposes (its live value).
    //   2. .collectAsStateWithLifecycle() — SUBSCRIBES to it and wraps the latest value in a
    //        Compose State, so this composable RECOMPOSES whenever the flow emits a new value.
    //        "WithLifecycle" = collect only while the screen is visible (lifecycle >= STARTED)
    //        and PAUSE off-screen; the Android-safe version of a plain collectAsState().
    //   3. `by`                           — a property delegate that unwraps the State's .value,
    //        so X reads as the plain value directly (no .value). Reading X also registers this
    //        composable as a reader, which is what makes Compose recompose it on the next emit.
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    // Forward the pure state + callbacks to the stateless body.
    PlanetListScreenBody(
        uiState = uiState,
        onOpen = onOpen,
        onRetry = viewModel::retry,        // the Error state's Retry button calls back into the ViewModel
        modifier = modifier,
    )
}

/**
 * Stateless body of the list screen: renders purely from [uiState].
 *
 * Because it takes the state as a parameter (no ViewModel, no Flow), it is
 * trivially previewable and testable — every @Preview at the bottom of this file
 * just passes a different [PlanetsUiState] here.
 *
 * @param uiState the current state to render (Loading / Empty / Error / Success).
 * @param onOpen  invoked with a planet's id when a row is tapped.
 * @param onRetry invoked when the user taps "Retry" in the Error state.
 */
@Composable
fun PlanetListScreenBody(
    uiState: PlanetsUiState,
    onOpen: (Int) -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Log.d("LT", "Entered PlanetListScreenBody")
    Column(modifier = modifier.fillMaxSize()) {
        // The lesson banner is always visible, above whatever state is showing.
        DataLayerBanner()
        HorizontalDivider()

        // *** THE STATE-DRIVEN RENDERING ***
        // A single exhaustive `when` over the sealed PlanetsUiState. The compiler
        // forces us to handle EVERY case — that is the whole benefit of modeling
        // UI state as a sealed type.
        when (uiState) {
            // ── LOADING ── show a centered spinner while data is being fetched.
            is PlanetsUiState.Loading -> CenteredMessage {
                CircularProgressIndicator()
                Spacer(modifier = Modifier.height(12.dp))
                Text("Loading planets…", style = MaterialTheme.typography.bodyMedium)
            }

            // ── EMPTY ── fetch succeeded but returned nothing; show a friendly note.
            is PlanetsUiState.Empty -> CenteredMessage {
                Text("No planets to show.", style = MaterialTheme.typography.titleMedium)
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    "The repository returned an empty list.",
                    style = MaterialTheme.typography.bodyMedium,
                )
            }

            // ── ERROR ── fetch failed; show the message and a Retry button.
            is PlanetsUiState.Error -> CenteredMessage {
                Text("Something went wrong", style = MaterialTheme.typography.titleMedium)
                Spacer(modifier = Modifier.height(4.dp))
                // Smart-cast: inside this branch `uiState` is PlanetsUiState.Error.
                Text(uiState.message, style = MaterialTheme.typography.bodyMedium)
                Spacer(modifier = Modifier.height(16.dp))
                Button(onClick = onRetry) { Text("Retry") }
            }

            // ── SUCCESS ── render the planet list (smart-cast gives us .planets).
            is PlanetsUiState.Success -> LazyColumn(modifier = Modifier.fillMaxSize()) {
                items(uiState.planets) { planet ->          // one row per planet
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            // OS vs COMPOSE vs YOUR CODE — what a tap really is:
                            //   • Android (the OS) only reports a raw touch at a pixel (x, y); it knows
                            //     nothing about rows, items, names, or ids.
                            //   • Compose hit-tests that pixel to find WHICH composable sits there (this
                            //     one) and invokes its click lambda.
                            //   • YOUR code gives the tap its MEANING: the click lambda passes the exact
                            //     value you wired here (e.g. this row's id). "What was selected" is meaning
                            //     your code attaches to a raw touch — the OS never knows about it.
                            .clickable { onOpen(planet.id) }  // whole row tappable -> open detail
                            .padding(16.dp)
                    ) {
                        Text(planet.title, style = MaterialTheme.typography.titleMedium)
                        Text(planet.blurb, style = MaterialTheme.typography.bodyMedium)
                    }
                    HorizontalDivider()
                }
            }
        }
    }
}

/**
 * Small helper that centers its [content] in the remaining space — reused by the
 * Loading, Empty, and Error states so they all look consistent.
 */
@Composable
private fun CenteredMessage(content: @Composable () -> Unit) {
    Log.d("LT", "Entered CenteredMessage")
    Box(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            content()
        }
    }
}

// ===========================================================================
// LEVEL 2 — THE PLANET DETAIL SCREEN
//
// The nav key carries only a planetId. The detail screen RE-FETCHES the planet
// from the repository with the `suspend planet(id)` call, showing its OWN small
// loading state while that runs — again proving the data layer, not the nav key,
// is the source of truth.
// ===========================================================================

/**
 * Detail screen for one planet, loaded by [planetId].
 *
 * It performs a one-shot `suspend` load inside a [LaunchedEffect] keyed on the
 * id, tracking three local states via a nullable holder:
 *   • holder == null & still loading → spinner
 *   • holder resolved to an Item     → show details
 *   • holder resolved to null (miss) → "not found" message
 *
 * For brevity this screen builds its own in-place loader rather than a dedicated
 * ViewModel; the list screen demonstrates the full ViewModel + StateFlow path.
 *
 * @param planetId the id passed in the nav key.
 * @param onBack   invoked when the user taps "Back to list".
 */
@Composable
fun PlanetDetailScreen(
    planetId: Int,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    // Same data boundary as the ViewModel: depend on the interface, default to in-memory.
    repo: PlanetRepository = remember { InMemoryPlanetRepository() },
) {
    Log.d("LT", "Entered PlanetDetailScreen")
    // Local load state. `loading` starts true; `planet` is filled once the
    // suspend call returns (or stays null if the id wasn't found).
    var loading by remember { mutableStateOf(true) }
    var planet by remember { mutableStateOf<Item?>(null) }

    // LaunchedEffect runs the suspend load when the screen appears (and re-runs if
    // planetId changes). This is the detail screen's own little "Loading" state.
    LaunchedEffect(planetId) {
        loading = true
        planet = repo.planet(planetId)     // suspend call into the data layer
        loading = false
    }

    Column(modifier = modifier.fillMaxSize().padding(16.dp)) {
        when {
            // Detail's own loading state — small and self-contained.
            loading -> CenteredMessage {
                CircularProgressIndicator()
                Spacer(modifier = Modifier.height(12.dp))
                Text("Loading planet…", style = MaterialTheme.typography.bodyMedium)
            }

            // The id resolved to a real planet — show its details.
            planet != null -> {
                val p = planet!!                            // safe: guarded by the branch condition
                Text(p.title, style = MaterialTheme.typography.headlineSmall)
                Spacer(modifier = Modifier.height(8.dp))
                Text(p.blurb, style = MaterialTheme.typography.bodyLarge)
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    "Fun fact: ${p.fact}",
                    style = MaterialTheme.typography.bodyMedium,
                )
                Spacer(modifier = Modifier.height(24.dp))
                Button(onClick = onBack) { Text("Back to list") }
            }

            // The id matched no planet — a graceful "not found" state.
            else -> {
                Text("Planet not found", style = MaterialTheme.typography.titleMedium)
                Spacer(modifier = Modifier.height(16.dp))
                Button(onClick = onBack) { Text("Back to list") }
            }
        }
    }
}

// ===========================================================================
// @Preview functions — render the LIST screen in EVERY UI state.
//
// IMPORTANT: previews pass a PlanetsUiState directly to the STATELESS
// PlanetListScreenBody. They do NOT construct PlanetsViewModel, because:
//   • a ViewModel kicks off coroutines / repository work, which the static
//     preview renderer can't (and shouldn't) run, and
//   • driving the stateless body lets us freeze the screen in any state we want
//     — including ones (Empty, Error) the in-memory repo never actually produces.
// All callbacks are no-ops ({}) since previews don't navigate or retry.
// ===========================================================================

// LOADING — the spinner state.
//@Preview(name = "List · Loading", showBackground = true, widthDp = 320, heightDp = 480)
//@Composable
//fun ListLoadingPreview() {
//    NavDataLayerTheme {
//        PlanetListScreenBody(uiState = PlanetsUiState.Loading, onOpen = {}, onRetry = {})
//    }
//}
//
//// EMPTY — fetch succeeded but returned nothing.
//@Preview(name = "List · Empty", showBackground = true, widthDp = 320, heightDp = 480)
//@Composable
//fun ListEmptyPreview() {
//    NavDataLayerTheme {
//        PlanetListScreenBody(uiState = PlanetsUiState.Empty, onOpen = {}, onRetry = {})
//    }
//}
//
//// ERROR — fetch failed; note the Retry button.
//@Preview(name = "List · Error", showBackground = true, widthDp = 320, heightDp = 480)
//@Composable
//fun ListErrorPreview() {
//    NavDataLayerTheme {
//        PlanetListScreenBody(
//            uiState = PlanetsUiState.Error("Could not reach the planet service."),
//            onOpen = {},
//            onRetry = {},
//        )
//    }
//}
//
//// SUCCESS — the populated list (uses the sample planets directly as preview data).
//@Preview(name = "List · Success", showBackground = true, widthDp = 320, heightDp = 480)
//@Composable
//fun ListSuccessPreview() {
//    NavDataLayerTheme {
//        PlanetListScreenBody(
//            uiState = PlanetsUiState.Success(samplePlanets),
//            onOpen = {},
//            onRetry = {},
//        )
//    }
//}
