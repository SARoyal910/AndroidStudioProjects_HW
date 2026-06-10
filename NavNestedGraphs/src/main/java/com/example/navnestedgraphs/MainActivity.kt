// =============================================================================
// MainActivity.kt
//
// A NESTED-NAVIGATION-GRAPHS / SUB-FLOWS teaching sample built with:
//   • Jetpack Compose        — the declarative UI toolkit (no XML layouts).
//   • Navigation 3 (Nav3)    — the modern, Compose-first navigation library.
//   • Kotlinx Serialization  — used to mark navigation keys @Serializable.
//
// THE LESSON ─ "nested graphs" / "sub-flows":
// ----------------------------------------------------------------------------
// A real app often has a self-contained multi-step sub-flow (onboarding, a
// checkout wizard, a sign-up flow) that runs as ONE cohesive unit and then
// hands off to the main app. The defining behaviours of such a sub-flow are:
//   1. While inside it, Back walks BETWEEN its own steps.
//   2. When it COMPLETES, the ENTIRE sub-flow is popped off as a unit, and you
//      land in the main app — Back from the first main screen must NOT walk
//      back into the (now finished) sub-flow.
//
// In Navigation 2 (the Fragment/XML nav-graph world) you'd express this with a
// first-class <navigation> element: a NESTED NavGraph with its own start
// destination, then `popUpTo(onboardingGraph) { inclusive = true }` to remove
// the whole nested graph when leaving it. (See the Nav2 callouts below.)
//
// Navigation 3 has NO first-class nested-graph type. The back stack is just a
// plain list of keys. So we model a nested graph EXPLICITLY:
//   • We GROUP the keys that belong to a sub-flow (and comment the grouping).
//   • We do the "leave the whole sub-flow" operation as BACK-STACK SURGERY:
//     clear the sub-flow's keys and push the main start key (finishOnboarding).
// Making that modelling visible — instead of hidden inside a graph object — is
// exactly the point of this sample.
//
// TWO GRAPHS, ONE BACK STACK:
//
//   ┌──────────────────────── Graph A: Onboarding (the sub-flow) ───────────┐
//   │  WelcomeKey  ──Next──▶  ChooseFavoriteKey  ──Continue──▶  DoneKey      │
//   │     ▲ Back ◀──────────────── Back ◀───────────────── Back              │
//   └───────────────────────────────────────────────────────────────────────┘
//                                    │
//                  "Get started"  →  finishOnboarding()
//                  (CLEARS all of Graph A, pushes Graph B's start)
//                                    │
//                                    ▼
//   ┌──────────────────────── Graph B: Main app ───────────────────────────┐
//   │  CategoriesKey  ──tap──▶  ItemsKey(catId)  ──tap──▶  DetailKey(itemId) │
//   │  (Rocky / Gas)            (planets)                  (one planet)       │
//   └───────────────────────────────────────────────────────────────────────┘
//
//   Start of app:  back stack = [WelcomeKey]                    (in Graph A)
//   After finish:  back stack = [CategoriesKey]                 (in Graph B)
//                  → Graph A is GONE; Back here exits the app, never returns
//                    into onboarding. That "pop the sub-flow as a unit" is the
//                    behaviour a Nav2 nested graph would give you for free.
//
// Reading order below: package + imports, then DATA, then NAVIGATION KEYS
// (grouped by graph), then the Activity, then AppNavigation (with the grouped
// entryProvider + finishOnboarding surgery), then each screen Composable.
// =============================================================================

// The package declaration. Every class/function below lives in this namespace,
// which also matches the directory structure under src/main/java/.
package com.example.navnestedgraphs

// --- Android framework imports ------------------------------------------------
import android.os.Bundle                                    // savedInstanceState type passed to onCreate
import androidx.activity.ComponentActivity                  // base Activity class with Compose support
import androidx.activity.compose.setContent                 // bridges an Activity to a Compose UI tree
import androidx.activity.enableEdgeToEdge                    // lets the app draw behind the system bars

// --- Compose layout / foundation imports -------------------------------------
import androidx.compose.foundation.background               // modifier: paint a solid color behind content (selection state)
import androidx.compose.foundation.clickable                // makes a row tappable
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
import androidx.compose.material3.HorizontalDivider         // thin horizontal separator line
import androidx.compose.material3.MaterialTheme             // access to the current theme's colors/typography
import androidx.compose.material3.OutlinedButton            // outlined (secondary) tappable button
import androidx.compose.material3.Scaffold                  // standard screen frame (handles insets, bars, etc.)
import androidx.compose.material3.Text                      // draws text

// --- Compose runtime / tooling imports ---------------------------------------
import androidx.compose.runtime.Composable                  // marks a function as emitting UI
import androidx.compose.runtime.getValue                    // property-delegate read for remembered state
import androidx.compose.runtime.mutableStateOf              // creates observable state (the favorite selection)
import androidx.compose.runtime.remember                    // keeps state across recompositions
import androidx.compose.runtime.setValue                    // property-delegate write for remembered state
import androidx.compose.ui.Modifier                         // the "how to lay out / decorate" object
import androidx.compose.ui.graphics.Color                   // explicit color value (transparent default for selection)
import androidx.compose.ui.tooling.preview.Preview          // enables @Preview rendering in Android Studio
import androidx.compose.ui.tooling.preview.PreviewParameter  // feeds a value into a preview parameter
import androidx.compose.ui.tooling.preview.PreviewParameterProvider // supplies the SET of preview values
import androidx.compose.ui.unit.dp                          // density-independent pixel unit (e.g. 16.dp)

// --- Navigation 3 imports -----------------------------------------------------
// Navigation 3 is the modern, Compose-first navigation approach: a single
// Activity holds a back stack of "keys", and Compose swaps the screen whenever
// the top key changes. No Fragments, no Intents, no XML nav graph — and,
// crucially for THIS lesson, no first-class nested-graph type either.
import androidx.navigation3.runtime.NavKey                  // marker interface every navigation key implements
import androidx.navigation3.runtime.entryProvider           // DSL that maps each key type to a screen
import androidx.navigation3.runtime.rememberNavBackStack    // creates + remembers the back stack across recomposition
import androidx.navigation3.ui.NavDisplay                   // the composable that renders the current top key

// --- App + misc imports -------------------------------------------------------
import com.example.navnestedgraphs.ui.theme.NavNestedGraphsTheme // our app's Material theme wrapper (see Theme.kt)
import kotlinx.serialization.Serializable                   // makes Nav3 keys serializable (required by Nav3)
import android.util.Log                                     // Logcat logging (Log.d, Log.e, ...)

// ===========================================================================
// DATA
// A tiny in-memory data source. In a real app this would come from a database
// (Room), a network call (Retrofit), or a repository; here hardcoded lists are
// enough to drive both the onboarding sub-flow (which planet is your favorite?)
// and the main drill-down (categories → items → detail).
//
// The model is two levels deep:
//   Category 1─┐
//              ├── many Items   (each Item belongs to exactly one Category)
//   Category 2─┘
// ===========================================================================

// A top-level grouping shown on the main app's FIRST screen (Graph B).
//   • id   — stable unique identifier; this is what travels in the nav key.
//   • name — short label shown as the category row.
//   • description — one-line summary shown under the name.
data class Category(val id: Int, val name: String, val description: String)

// A single planet shown in the onboarding picker AND on the main list/detail.
//   • id         — stable unique identifier; travels in the detail nav key.
//   • categoryId — which Category this item belongs to (the "foreign key").
//   • title      — short name shown as the row/headline.
//   • blurb      — one-line description shown under the title.
data class Item(
    val id: Int,
    val categoryId: Int,
    val title: String,
    val blurb: String,
)

// Logcat tag string. Every log line from this app can be filtered in Logcat by
// searching for "NEST" (for the nested-graphs demo).
private const val TAG = "NEST"

// The two categories rendered on the main app's first screen.
private val sampleCategories = listOf(
    Category(1, "Rocky Planets", "Small, dense worlds with solid surfaces."),
    Category(2, "Gas Giants", "Massive planets made mostly of gas."),
)

// The planets. Each one's `categoryId` ties it back to a Category above
// (1 = Rocky, 2 = Gas Giant). The onboarding picker shows ALL of them so the
// user can choose a favorite before entering the main app.
private val sampleItems = listOf(
    Item(1, 1, "Mercury", "The smallest planet and the closest to the Sun."),
    Item(2, 1, "Venus", "The hottest planet, wrapped in thick clouds of acid."),
    Item(3, 1, "Earth", "The only planet known to support life — so far."),
    Item(4, 1, "Mars", "The red planet, a frequent target for rovers."),
    Item(5, 2, "Jupiter", "The largest planet, a gas giant with a great red spot."),
    Item(6, 2, "Saturn", "The ringed gas giant, second largest in the system."),
)

// --- Lookups ----------------------------------------------------------------
// The screens receive only an id (inside their nav key) and resolve the full
// object here. Passing just the id — rather than the whole object — keeps each
// navigation key tiny and serializable.

// Resolve a Category by its id. `first { }` throws if none match, which is fine
// here because every CategoriesKey/ItemsKey is built from a known category id.
private fun categoryById(id: Int): Category = sampleCategories.first { it.id == id }

// Resolve a single Item by its id (used by the detail screen).
private fun itemById(id: Int): Item = sampleItems.first { it.id == id }

// All items belonging to one category (used by the main list screen). `filter`
// returns every match — possibly an empty list, which is also fine to render.
private fun itemsInCategory(categoryId: Int): List<Item> =
    sampleItems.filter { it.categoryId == categoryId }

// ===========================================================================
// NAVIGATION KEYS — GROUPED BY GRAPH
//
// Each screen is identified by a "key". A key both names the destination AND
// carries that destination's arguments. Nav3 requires keys to implement NavKey
// and (for state saving across process death) be @Serializable.
//
// THE GROUPING IS THE NESTED-GRAPH MODEL. Nav3's back stack is one flat list,
// so to "have" two graphs we keep two clearly-labelled SETS of keys:
//   • Graph A keys = the onboarding sub-flow.
//   • Graph B keys = the main app.
// Code only ever needs to know "is this key part of Graph A?" — see
// onboardingKeys / finishOnboarding below — and that grouping is what stands in
// for a Nav2 <navigation> nested-graph element.
// ===========================================================================

// ---------------------------------------------------------------------------
// Graph A: Onboarding  (the self-contained sub-flow)
// A 3-step wizard. `data object` = a singleton key with no arguments — there is
// exactly one of each onboarding step, so a shared object is the right model.
// In Nav2 these three would be destinations INSIDE a nested <navigation
// android:id="@+id/onboarding"> graph whose startDestination is welcome.
// ---------------------------------------------------------------------------
@Serializable
data object WelcomeKey : NavKey                             // A-step 1: greeting + "Next"

@Serializable
data object ChooseFavoriteKey : NavKey                      // A-step 2: tap a favorite planet

@Serializable
data object DoneKey : NavKey                                // A-step 3: confirmation + "Get started"

// ---------------------------------------------------------------------------
// Graph B: Main app  (the destination flow, a classic 3-level drill-down)
// CategoriesKey has no arguments (one categories screen); the others carry an
// id naming which category/item to show. In Nav2 these would be the top-level
// destinations of the MAIN graph, reached only after popUpTo() removed the
// onboarding nested graph.
// ---------------------------------------------------------------------------
@Serializable
data object CategoriesKey : NavKey                          // B-step 1 (Graph B's START): list of categories

@Serializable
data class ItemsKey(val categoryId: Int) : NavKey          // B-step 2: which category's items to list

@Serializable
data class DetailKey(val itemId: Int) : NavKey             // B-step 3: which single item to show

// The SET of keys that belong to Graph A (onboarding). This list IS our
// lightweight "which destinations are in the nested graph?" definition — the
// thing Nav2 stores inside a <navigation> element. finishOnboarding() uses it
// to pop the whole sub-flow as a unit.
private val onboardingKeys: Set<NavKey> = setOf(WelcomeKey, ChooseFavoriteKey, DoneKey)

/**
 * MainActivity — the app's single Activity and the entry point Android launches.
 *
 * In a Nav3 app you typically have exactly one Activity; it hosts the Compose UI
 * and the navigation back stack, and Compose (not the Activity system) swaps
 * between the onboarding sub-flow and the main app.
 */
class MainActivity : ComponentActivity() {
    // onCreate runs once when the Activity is first created. This is where we
    // install the Compose UI tree as the Activity's content.
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)                 // always call through to the framework first
        enableEdgeToEdge()                                 // draw under the status/navigation bars for a modern look
        setContent {                                       // everything inside is the Compose UI
            // Apply our app theme (colors, typography, dark/light handling).
            NavNestedGraphsTheme {
                // Scaffold provides the standard screen structure and, crucially,
                // hands us `innerPadding` — the space taken by system bars — so
                // our content isn't drawn underneath them.
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    // Hand the inset padding down to the navigation host so each
                    // screen lays out inside the safe area.
                    AppNavigation(modifier = Modifier.padding(innerPadding))
                }
            }
        }
    }
}

/**
 * AppNavigation — owns the single back stack and maps each key to its screen.
 *
 * This is the heart of the Nav3 setup AND of the nested-graph lesson. It:
 *   1. Creates/remembers the back stack, STARTING IN GRAPH A at [WelcomeKey].
 *   2. Renders the top of the stack via NavDisplay.
 *   3. Defines [finishOnboarding] — the back-stack surgery that pops the WHOLE
 *      onboarding sub-flow and drops the user into Graph B.
 *   4. Splits the entryProvider into two clearly-commented sections, one per
 *      graph, so the "two nested graphs sharing one flat stack" idea is visible.
 */
@Composable
fun AppNavigation(modifier: Modifier = Modifier) {
    // The back stack is the list of keys currently "stacked" on screen, bottom
    // to top. We SEED IT WITH WelcomeKey, so the app opens INSIDE Graph A (the
    // onboarding sub-flow). rememberNavBackStack preserves it across
    // recompositions and configuration changes. Because NavBackStack is a
    // MutableList<NavKey>, we get add()/removeLastOrNull()/clear()/removeAll{}
    // for free — those list operations are how we "navigate".
    val backStack = rememberNavBackStack(WelcomeKey)

    // A debug breadcrumb visible in Logcat (filter by "NEST") confirming this
    // composable was entered.
    Log.d(TAG, "Entered AppNavigation; starting in Graph A (onboarding)")

    // -----------------------------------------------------------------------
    // finishOnboarding() — THE NESTED-GRAPH "POP THE WHOLE SUB-FLOW" OPERATION.
    //
    // This is the single most important function in the lesson. Completing the
    // onboarding sub-flow must:
    //   (a) remove EVERY onboarding key from the back stack (Welcome, Choose,
    //       Done) — the sub-flow leaves as ONE unit, not one screen at a time;
    //   (b) push Graph B's start key (CategoriesKey) so we land in the main app.
    // After this runs the stack is exactly [CategoriesKey]; Back from there
    // exits the app and can NEVER return into onboarding — onboarding is gone.
    //
    // We implement it as `removeAll { it in onboardingKeys }` followed by
    // `add(CategoriesKey)`. Because onboardingKeys is our explicit definition of
    // "the nested graph", this one call cleanly pops the entire graph regardless
    // of how many of its steps are on the stack.
    //
    // ── Nav2 equivalent ──────────────────────────────────────────────────────
    // In Navigation 2 you would NOT manipulate a list. You'd navigate to the
    // main graph's start and pop the onboarding nested graph inclusively:
    //
    //     findNavController().navigate(R.id.categoriesFragment,
    //         null,
    //         navOptions {
    //             popUpTo(R.id.onboarding_graph) { inclusive = true }
    //         })
    //
    // `popUpTo(onboarding_graph) { inclusive = true }` is Nav2's built-in way of
    // saying exactly what removeAll { it in onboardingKeys } says here: "remove
    // the entire onboarding nested graph from the back stack." Nav3 has no such
    // graph object, so we spell the operation out — and seeing it spelled out is
    // the whole point.
    // -----------------------------------------------------------------------
    val finishOnboarding: () -> Unit = {
        Log.d(TAG, "finishOnboarding(): popping Graph A as a unit, entering Graph B")
        backStack.removeAll { it in onboardingKeys }       // (a) pop the ENTIRE onboarding sub-flow
        backStack.add(CategoriesKey)                       // (b) enter Graph B at its start destination
    }

    // NavDisplay renders whatever key is on top of the back stack, animating the
    // transition when the top changes.
    NavDisplay(
        backStack = backStack,
        modifier = modifier,
        // Called for system back gestures / the hardware back button. Popping the
        // top key returns to the previous screen. WITHIN onboarding this walks
        // Done → Choose → Welcome (Graph A's internal Back). Within the main app
        // it walks Detail → Items → Categories (Graph B's internal Back). Because
        // finishOnboarding already removed Graph A, Back can never cross from
        // Graph B back into Graph A. removeLastOrNull is a safe no-op if empty.
        onBack = { backStack.removeLastOrNull() },          // back = pop the top key
        // entryProvider is a DSL: one `entry<KeyType> { ... }` block per screen.
        // Nav3 picks the block whose key type matches the current top key. We
        // organize the blocks into TWO labelled sections — one per nested graph —
        // which is how the grouping models "two graphs sharing one flat stack".
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

            // ===============================================================
            // GRAPH A — ONBOARDING ENTRIES (the sub-flow)
            // Back here moves BETWEEN these three steps. The flow only LEAVES
            // via finishOnboarding(), never by popping into Graph B one screen
            // at a time. (These three entry<> blocks are the bodies of the
            // destinations a Nav2 nested <navigation> element would contain.)
            // ===============================================================

            // A-step 1 — Welcome: greet the user and offer "Next".
            entry<WelcomeKey> {
                WelcomeScreen(
                    // "Next" pushes the second onboarding step (still in Graph A).
                    onNext = { backStack.add(ChooseFavoriteKey) }
                )
            }
            // A-step 2 — Choose favorite: pick a planet, then "Continue".
            entry<ChooseFavoriteKey> {
                ChooseFavoriteScreen(
                    items = sampleItems,
                    // "Continue" pushes the third onboarding step (still in Graph A).
                    onContinue = { backStack.add(DoneKey) },
                    // In-flow Back to the welcome step.
                    onBack = { backStack.removeLastOrNull() }
                )
            }
            // A-step 3 — Done: confirm, then leave the WHOLE sub-flow.
            entry<DoneKey> {
                DoneScreen(
                    // "Get started" is the hand-off: pop Graph A as a unit and
                    // enter Graph B. THIS is the nested-graph completion moment.
                    onGetStarted = finishOnboarding,
                    // In-flow Back to the choose-favorite step.
                    onBack = { backStack.removeLastOrNull() }
                )
            }

            // ===============================================================
            // GRAPH B — MAIN APP ENTRIES (the destination flow)
            // A classic 3-level drill-down. Reached ONLY after onboarding was
            // popped as a unit, so the very first Back here exits the app rather
            // than walking back into onboarding. (In Nav2 these are the
            // destinations of the MAIN graph, entered via the popUpTo() above.)
            // ===============================================================

            // B-step 1 (Graph B's START) — Categories: list of categories.
            entry<CategoriesKey> {
                CategoriesScreen(
                    categories = sampleCategories,
                    // Tapping a category pushes an ItemsKey carrying THAT category's
                    // id, navigating forward to its list of planets.
                    onOpen = { categoryId -> backStack.add(ItemsKey(categoryId)) }
                )
            }
            // B-step 2 — Items: that category's planets.
            entry<ItemsKey> { key ->
                ItemsScreen(
                    // Resolve the category (for the header) and its items (the rows).
                    category = categoryById(key.categoryId),
                    items = itemsInCategory(key.categoryId),
                    // Tapping a planet pushes a DetailKey carrying THAT item's id.
                    onOpen = { itemId -> backStack.add(DetailKey(itemId)) },
                    // The on-screen back button pops one level (back to categories).
                    onBack = { backStack.removeLastOrNull() }
                )
            }
            // B-step 3 — Detail: one planet's detail.
            entry<DetailKey> { key ->
                DetailScreen(
                    item = itemById(key.itemId),
                    // The on-screen back button pops one level (back to the items list).
                    onBack = { backStack.removeLastOrNull() }
                )
            }
        }
    )
}

// ===========================================================================
// GRAPH A SCREENS — the onboarding sub-flow
// Each is a "dumb" composable: it knows nothing about navigation or about the
// back stack surgery; it only renders UI and reports taps through callbacks.
// That keeps them reusable and previewable.
// ===========================================================================

/**
 * Welcome screen (Graph A, step 1): greets the user and offers a single "Next"
 * button that advances to the favorite-picker step.
 *
 * @param onNext   invoked when the user taps "Next" (advances within onboarding).
 * @param modifier optional layout modifier supplied by the caller.
 */
@Composable
fun WelcomeScreen(
    onNext: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // A single vertical column: title, intro copy, then the advance button.
    Column(modifier = modifier.fillMaxSize().padding(16.dp)) {
        Text(text = "Welcome to Planets", style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Let's get you set up. This quick onboarding runs as its own " +
                "sub-flow — three steps — and then drops you into the app.",
            style = MaterialTheme.typography.bodyLarge,
        )
        Spacer(modifier = Modifier.height(24.dp))
        // Advance to onboarding step 2 (still inside Graph A).
        Button(onClick = onNext) {
            Text("Next")
        }
    }
}

/**
 * Choose-favorite screen (Graph A, step 2): lets the user tap one planet to mark
 * it as their favorite, then continue. The selection is LOCAL UI state — it is
 * not navigation, just a tappable highlight to make the step feel real.
 *
 * @param items      the planets the user can choose from.
 * @param onContinue invoked when the user taps "Continue" (advances onboarding).
 * @param onBack     invoked when the user taps "Back" (back to Welcome).
 * @param modifier   optional layout modifier supplied by the caller.
 */
@Composable
fun ChooseFavoriteScreen(
    items: List<Item>,
    onContinue: () -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // Remember which item id is currently selected (null = none yet). This is
    // plain Compose state local to the screen; it survives recomposition but is
    // intentionally NOT part of the nav key — picking a favorite is a UI choice,
    // not a navigation event.
    var selectedId by remember { mutableStateOf<Int?>(null) }

    Column(modifier = modifier.fillMaxSize()) {
        // --- Header block (does not scroll) ---
        Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
            Text(text = "Pick a favorite planet", style = MaterialTheme.typography.headlineSmall)
            Spacer(modifier = Modifier.height(8.dp))
            // "Continue" advances to the Done step (still inside Graph A). It is
            // enabled only once a favorite has been chosen.
            Button(onClick = onContinue, enabled = selectedId != null) {
                Text("Continue")
            }
            Spacer(modifier = Modifier.height(8.dp))
            // In-flow Back to the Welcome step.
            OutlinedButton(onClick = onBack) {
                Text("Back")
            }
        }
        HorizontalDivider()

        // --- The list of planets the user can tap to select ---
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            items(items) { item ->                          // draw one selectable row per planet
                // Highlight the row if it is the current selection.
                val isSelected = item.id == selectedId
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { selectedId = item.id } // tap = choose this favorite (UI state, not nav)
                        .background(
                            if (isSelected) MaterialTheme.colorScheme.primaryContainer
                            else Color.Transparent
                        )
                        .padding(16.dp)
                ) {
                    Text(text = item.title, style = MaterialTheme.typography.titleMedium)
                    Text(text = item.blurb, style = MaterialTheme.typography.bodyMedium)
                }
                HorizontalDivider()
            }
        }
    }
}

/**
 * Done screen (Graph A, step 3): confirms onboarding is complete and offers
 * "Get started", which is the HAND-OFF that pops the whole onboarding sub-flow
 * and enters the main app (see finishOnboarding in AppNavigation).
 *
 * @param onGetStarted invoked when the user taps "Get started" (LEAVES Graph A
 *                     as a unit and enters Graph B).
 * @param onBack       invoked when the user taps "Back" (back to Choose favorite).
 * @param modifier     optional layout modifier supplied by the caller.
 */
@Composable
fun DoneScreen(
    onGetStarted: () -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier.fillMaxSize().padding(16.dp)) {
        Text(text = "You're all set!", style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Tapping \"Get started\" finishes onboarding. The whole sub-flow " +
                "is popped off the back stack at once, so Back from the next screen " +
                "won't bring you back here.",
            style = MaterialTheme.typography.bodyLarge,
        )
        Spacer(modifier = Modifier.height(24.dp))
        // THE completion action: pop Graph A as a unit and enter Graph B.
        Button(onClick = onGetStarted) {
            Text("Get started")
        }
        Spacer(modifier = Modifier.height(8.dp))
        // In-flow Back to the Choose-favorite step.
        OutlinedButton(onClick = onBack) {
            Text("Back")
        }
    }
}

// ===========================================================================
// GRAPH B SCREENS — the main app (reused/adapted from the base drill-down)
// ===========================================================================

/**
 * Categories screen (Graph B, step 1): a scrolling list of categories; tapping
 * one calls [onOpen] with its id.
 *
 * This composable is intentionally "dumb" — it knows nothing about navigation.
 * It only renders the categories it's given and reports taps via [onOpen].
 *
 * @param categories the rows to render.
 * @param onOpen     invoked with a category's id when its row is tapped.
 * @param modifier   optional layout modifier supplied by the caller.
 */
@Composable
fun CategoriesScreen(
    categories: List<Category>,
    onOpen: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    // LazyColumn is the Compose equivalent of a RecyclerView: it only composes
    // and lays out the rows currently visible on screen, so long lists stay fast.
    LazyColumn(modifier = modifier.fillMaxSize()) {
        // `items(categories) { ... }` emits one block of UI per element.
        items(categories) { category ->                    // draw one row per category
            Column(
                modifier = Modifier
                    .fillMaxWidth()                         // row spans the full width...
                    .clickable { onOpen(category.id) }      // ...and the WHOLE row is tappable -> navigate
                    .padding(16.dp)                         // breathing room inside the row
            ) {
                // Name: emphasized text style from the theme's type scale.
                Text(text = category.name, style = MaterialTheme.typography.titleMedium)
                // Description: smaller body text beneath the name.
                Text(text = category.description, style = MaterialTheme.typography.bodyMedium)
            }
            // A thin line visually separating one row from the next.
            HorizontalDivider()                             // thin line between rows
        }
    }
}

/**
 * Items screen (Graph B, step 2): a header naming the chosen [category] followed
 * by a scrolling list of its [items]. Tapping an item calls [onOpen]; the button
 * at the top calls [onBack].
 *
 * @param category the category whose items are being shown (used for the header).
 * @param items    the items belonging to [category].
 * @param onOpen   invoked with an item's id when its row is tapped.
 * @param onBack   invoked when the user taps "Back to categories".
 * @param modifier optional layout modifier supplied by the caller.
 */
@Composable
fun ItemsScreen(
    category: Category,
    items: List<Item>,
    onOpen: (Int) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // Outer Column: a fixed header on top, then the scrolling list below it.
    Column(modifier = modifier.fillMaxSize()) {
        // --- Header block (does not scroll) ---
        Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
            // The name of the category the user drilled into.
            Text(text = category.name, style = MaterialTheme.typography.headlineSmall)
            Spacer(modifier = Modifier.height(8.dp))
            // A back button that pops one level, returning to the categories list.
            Button(onClick = onBack) {                      // pop back to categories
                Text("Back to categories")
            }
        }
        HorizontalDivider()                                 // separates header from the list

        // --- The list of planets in this category (scrolls) ---
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            items(items) { item ->                          // draw one row per item
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onOpen(item.id) }      // whole row tappable -> open detail
                        .padding(16.dp)
                ) {
                    Text(text = item.title, style = MaterialTheme.typography.titleMedium)
                    Text(text = item.blurb, style = MaterialTheme.typography.bodyMedium)
                }
                HorizontalDivider()
            }
        }
    }
}

/**
 * Detail screen (Graph B, step 3): shows the single [item] resolved from the id
 * in the nav key, with a single button that goes back.
 *
 * @param item     the fully-resolved item to display.
 * @param onBack   invoked when the user taps "Back to list".
 * @param modifier optional layout modifier supplied by the caller.
 */
@Composable
fun DetailScreen(
    item: Item,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // A single vertical column holding the title, body, and one button, with
    // 16dp of padding around the whole screen.
    Column(modifier = modifier.fillMaxSize().padding(16.dp)) {
        // Large headline showing the item's title.
        Text(text = item.title, style = MaterialTheme.typography.headlineSmall)
        // Fixed 8dp gap between the headline and the body text.
        Spacer(modifier = Modifier.height(8.dp))
        // The item's longer description.
        Text(text = item.blurb, style = MaterialTheme.typography.bodyLarge)
        // Larger 24dp gap before the action button.
        Spacer(modifier = Modifier.height(24.dp))
        // Pop back to the items list. (System back does the same thing — see
        // AppNavigation's onBack.)
        Button(onClick = onBack) {                          // pop back to the list
            Text("Back to list")
        }
    }
}

// ===========================================================================
// @Preview functions — render representative states in the design pane.
//
// These let you see each screen directly in Android Studio's design pane WITHOUT
// running the app on a device or emulator. Each preview wraps the screen in the
// app theme and passes no-op callbacks ({}), since previews don't navigate.
//
// We preview all three Graph A (onboarding) screens plus the Graph B (main)
// Categories screen. widthDp/heightDp give each preview a small, fixed
// phone-shaped frame so the full-screen (fillMaxSize) layouts render as compact
// cards instead of each taking a whole device-height of space.
// ===========================================================================

// GRAPH A, step 1 — the Welcome screen.
@Preview(name = "Welcome", showBackground = true, widthDp = 320, heightDp = 480)
@Composable
fun WelcomeScreenPreview() {
    NavNestedGraphsTheme {
        WelcomeScreen(onNext = {})
    }
}

// GRAPH A, step 2 — the Choose-favorite screen (all planets selectable).
@Preview(name = "ChooseFavorite", showBackground = true, widthDp = 320, heightDp = 480)
@Composable
fun ChooseFavoriteScreenPreview() {
    NavNestedGraphsTheme {
        ChooseFavoriteScreen(items = sampleItems, onContinue = {}, onBack = {})
    }
}

// GRAPH A, step 3 — the Done / hand-off screen.
@Preview(name = "Done", showBackground = true, widthDp = 320, heightDp = 480)
@Composable
fun DoneScreenPreview() {
    NavNestedGraphsTheme {
        DoneScreen(onGetStarted = {}, onBack = {})
    }
}

// GRAPH B, step 1 — the main app's Categories screen.
@Preview(name = "Categories", showBackground = true, widthDp = 320, heightDp = 480)
@Composable
fun CategoriesScreenPreview() {
    NavNestedGraphsTheme {
        CategoriesScreen(categories = sampleCategories, onOpen = {})
    }
}
