// =============================================================================
// MainActivity.kt
//
// A four-screen "drill-down" sample whose SOLE TEACHING GOAL is CUSTOM ANIMATED
// SCREEN TRANSITIONS in Navigation 3 (Nav3). The data (planets) and the screen
// chain are deliberately the same as the base sample, so the ONLY new idea here
// is HOW screens animate in and out as you navigate.
//
//   • Jetpack Compose        — the declarative UI toolkit (no XML layouts).
//   • Navigation 3 (Nav3)    — the modern, Compose-first navigation library.
//   • Kotlinx Serialization  — used to mark navigation keys @Serializable.
//
// ─── THE CONCEPT: forward vs. pop transitions ────────────────────────────────
//
// Every time the back stack's TOP key changes, NavDisplay runs an AnimatedContent
// transition between the OLD top screen and the NEW top screen. A transition is
// described by a ContentTransform, which bundles TWO halves:
//
//     ContentTransform(
//         targetContentEnter = <how the INCOMING screen appears>,   // an EnterTransition
//         initialContentExit = <how the OUTGOING screen disappears> // an ExitTransition
//     )
//
// "Enter"/"exit" transitions are themselves built from primitives that you can
// combine with the `+` operator:
//     • slideInHorizontally / slideOutHorizontally — translate along X
//     • fadeIn / fadeOut                            — animate alpha (opacity)
//     • (also scaleIn/scaleOut, expandIn/shrinkOut, ...)
// Each primitive takes an `animationSpec` (here a `tween` with a duration in ms
// and an `easing` curve) that controls the timing.
//
// NavDisplay distinguishes THREE situations and lets us supply a different
// ContentTransform for each:
//
//   1. FORWARD  (push)  — backStack.add(...)        → param `transitionSpec`
//        New screen slides IN from the RIGHT + fades in;
//        old screen slides OUT to the LEFT + fades out.
//        (Visual metaphor: the new screen comes "from ahead", pushing forward.)
//
//   2. POP      (back)  — backStack.removeLastOrNull() → param `popTransitionSpec`
//        The REVERSE of forward: the screen we're returning to slides IN from the
//        LEFT + fades in; the screen we're leaving slides OUT to the RIGHT + fades
//        out. (Visual metaphor: we walk "back the way we came".)
//
//   3. PREDICTIVE POP (Android 14+ back-swipe) → param `predictivePopTransitionSpec`
//        Same intent as a pop, but driven by the finger-drag progress so the user
//        can peek at the previous screen. We provide a gentle scale+fade for it.
//
// HOW THE SPEC MAPS TO NavDisplay (discovered from the navigation3-ui 1.0.1
// sources, androidx.navigation3.ui.NavDisplay):
//   NavDisplay(
//       transitionSpec:               AnimatedContentTransitionScope<Scene<T>>.() -> ContentTransform,
//       popTransitionSpec:            AnimatedContentTransitionScope<Scene<T>>.() -> ContentTransform,
//       predictivePopTransitionSpec:  AnimatedContentTransitionScope<Scene<T>>.(Int) -> ContentTransform,
//       ...
//   )
// Each spec is a lambda WITH RECEIVER `AnimatedContentTransitionScope<Scene<T>>`,
// which is why inside it we can write the bare slide/fade builders directly.
//
// PER-ENTRY OVERRIDES: NavDisplay ALSO reads transition specs off an individual
// entry's `metadata`. The helper builders
//       NavDisplay.transitionSpec { ... }            // forward, for THIS entry
//       NavDisplay.popTransitionSpec { ... }         // pop, for THIS entry
//       NavDisplay.predictivePopTransitionSpec { e-> ... }
// each return a Map<String, Any>; merge them with `+` and pass as the `metadata`
// argument of `entry<KeyType>(metadata = ...) { ... }`. Per-entry metadata WINS
// over the NavDisplay-wide defaults (priority: entry.metadata > scene.metadata >
// NavDisplay defaults). We demonstrate this on the FACT screen (LEVEL 4), which
// uses a vertical slide instead of the app-wide horizontal slide.
//
//   CategoriesScreen --tap--> ItemsScreen --tap--> DetailScreen --button--> FactScreen
//   (Rocky / Gas)            (planets)            (one planet)             (a fun fact)
//
// NOTE: transitions are MOTION over time and therefore do NOT animate inside
// Android Studio's static @Preview pane — run the app on a device/emulator and
// navigate to actually SEE the slide+fade. (See the @Preview note at the bottom.)
// =============================================================================

// The package declaration. Every class/function below lives in this namespace,
// which also matches the directory structure under src/main/java/.
package com.example.navtransitions

// --- Android framework imports ------------------------------------------------
import android.os.Bundle                                    // savedInstanceState type passed to onCreate
import androidx.activity.ComponentActivity                  // base Activity class with Compose support
import androidx.activity.compose.setContent                 // bridges an Activity to a Compose UI tree
import androidx.activity.enableEdgeToEdge                    // lets the app draw behind the system bars

// --- Compose ANIMATION imports (the stars of THIS sample) --------------------
import androidx.compose.animation.AnimatedContentTransitionScope // receiver scope of every transition spec lambda
import androidx.compose.animation.ContentTransform           // bundles an enter + an exit into one transition
import androidx.compose.animation.fadeIn                      // EnterTransition: animate incoming alpha 0 -> 1
import androidx.compose.animation.fadeOut                     // ExitTransition:  animate outgoing alpha 1 -> 0
import androidx.compose.animation.scaleIn                     // EnterTransition: animate incoming scale (used in predictive pop)
import androidx.compose.animation.scaleOut                    // ExitTransition:  animate outgoing scale (used in predictive pop)
import androidx.compose.animation.slideInHorizontally         // EnterTransition: slide incoming along X
import androidx.compose.animation.slideOutHorizontally        // ExitTransition:  slide outgoing along X
import androidx.compose.animation.slideInVertically           // EnterTransition: slide incoming along Y (Fact screen override)
import androidx.compose.animation.slideOutVertically          // ExitTransition:  slide outgoing along Y (Fact screen override)
import androidx.compose.animation.togetherWith                // infix: combine EnterTransition `togetherWith` ExitTransition -> ContentTransform
import androidx.compose.animation.core.FastOutSlowInEasing    // standard Material easing curve (accelerate then decelerate)
import androidx.compose.animation.core.tween                  // a duration+easing based AnimationSpec

// --- Compose layout / foundation imports -------------------------------------
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
import androidx.compose.material3.Scaffold                  // standard screen frame (handles insets, bars, etc.)
import androidx.compose.material3.Text                      // draws text

// --- Compose runtime / tooling imports ---------------------------------------
import androidx.compose.runtime.Composable                  // marks a function as emitting UI
import androidx.compose.ui.Modifier                         // the "how to lay out / decorate" object
import androidx.compose.ui.tooling.preview.Preview          // enables @Preview rendering in Android Studio
import androidx.compose.ui.tooling.preview.PreviewParameter  // feeds a value into a preview parameter
import androidx.compose.ui.tooling.preview.PreviewParameterProvider // supplies the SET of preview values
import androidx.compose.ui.unit.dp                          // density-independent pixel unit (e.g. 16.dp)

// --- Navigation 3 imports -----------------------------------------------------
// Navigation 3 is the modern, Compose-first navigation approach: a single
// Activity holds a back stack of "keys", and Compose swaps the screen whenever
// the top key changes. No Fragments, no Intents, no XML nav graph.
import androidx.navigation3.runtime.NavKey                  // marker interface every navigation key implements
import androidx.navigation3.runtime.entryProvider           // DSL that maps each key type to a screen
import androidx.navigation3.runtime.rememberNavBackStack    // creates + remembers the back stack across recomposition
import androidx.navigation3.ui.NavDisplay                   // renders the current top key AND owns the transition specs
import androidx.navigation3.scene.Scene                     // the unit NavDisplay animates between; specs are AnimatedContentTransitionScope<Scene<*>>

// --- App + misc imports -------------------------------------------------------
import com.example.navtransitions.ui.theme.NavTransitionsTheme // our app's Material theme wrapper (see Theme.kt)
import kotlinx.serialization.Serializable                   // makes Nav3 keys serializable (required by Nav3)
import android.util.Log                                     // Logcat logging (Log.d, Log.e, ...)

// ===========================================================================
// TRANSITION TUNING CONSTANTS
// Centralising the numbers makes the teaching point obvious: a transition is
// just "how far to slide" + "how long it takes" + "what easing curve". Tweak
// these and re-run to FEEL the difference.
// ===========================================================================

// How long every slide+fade lasts, in milliseconds. ~400ms reads as snappy but
// still clearly visible. (Compare: NavDisplay's built-in default is 700ms.)
private const val TRANSITION_MS = 400

// The easing curve shared by all our slides/fades. FastOutSlowInEasing is the
// canonical Material "standard" curve: accelerate quickly, then ease to a stop —
// motion that feels physical rather than robotically linear.
private val TRANSITION_EASING = FastOutSlowInEasing

// ===========================================================================
// THE TRANSITION SPECS  (the heart of THIS sample)
//
// These three functions return the lambdas we hand to NavDisplay. Each lambda
// has receiver `AnimatedContentTransitionScope<Scene<NavKey>>`, so inside it the
// bare slide/fade builders resolve against that scope.
//
// We factor them out (instead of inlining) purely so the NavDisplay call site
// stays readable and so the forward/pop symmetry is easy to compare side by side.
// ===========================================================================

/**
 * FORWARD transition — used when we PUSH a new key (backStack.add).
 *
 * The new (target) screen ENTERS from the right edge and fades in; simultaneously
 * the old (initial) screen EXITS toward the left and fades out. This "content
 * moves leftward" motion reads as "going deeper / forward".
 *
 * `togetherWith` is the infix builder that glues an EnterTransition (left side)
 * to an ExitTransition (right side) into one ContentTransform.
 */
private fun forwardSpec(): AnimatedContentTransitionScope<Scene<NavKey>>.() -> ContentTransform = {
    // INCOMING screen: start fully off-screen to the right (+full width) and slide
    // to its resting position (offset 0), while fading from transparent to opaque.
    (slideInHorizontally(
        animationSpec = tween(TRANSITION_MS, easing = TRANSITION_EASING),
        initialOffsetX = { fullWidth -> fullWidth }          // begin one screen-width to the RIGHT
    ) + fadeIn(animationSpec = tween(TRANSITION_MS, easing = TRANSITION_EASING)))
        .togetherWith(                                       // ENTER `togetherWith` EXIT -> ContentTransform
            // OUTGOING screen: slide a third of the way OFF to the LEFT and fade out.
            // (Only a partial slide so the departing screen feels "left behind",
            // not flung off; tweak the divisor to taste.)
            slideOutHorizontally(
                animationSpec = tween(TRANSITION_MS, easing = TRANSITION_EASING),
                targetOffsetX = { fullWidth -> -fullWidth / 3 } // end one-third-width to the LEFT
            ) + fadeOut(animationSpec = tween(TRANSITION_MS, easing = TRANSITION_EASING))
        )
}

/**
 * POP transition — used when we POP a key (backStack.removeLastOrNull) via the
 * on-screen back button or the system Back button.
 *
 * This is the MIRROR IMAGE of [forwardSpec]: every direction is reversed so the
 * motion reads as "retreating / going back the way we came". The screen we're
 * returning to enters from the LEFT; the screen we're leaving exits to the RIGHT.
 */
private fun popSpec(): AnimatedContentTransitionScope<Scene<NavKey>>.() -> ContentTransform = {
    // INCOMING (the previous screen we're returning to): slide in from the LEFT
    // (note the partial -fullWidth/3 start, mirroring the forward exit) and fade in.
    (slideInHorizontally(
        animationSpec = tween(TRANSITION_MS, easing = TRANSITION_EASING),
        initialOffsetX = { fullWidth -> -fullWidth / 3 }     // begin one-third-width to the LEFT
    ) + fadeIn(animationSpec = tween(TRANSITION_MS, easing = TRANSITION_EASING)))
        .togetherWith(
            // OUTGOING (the screen we're leaving): slide fully OFF to the RIGHT and
            // fade out — the exact reverse of the forward enter.
            slideOutHorizontally(
                animationSpec = tween(TRANSITION_MS, easing = TRANSITION_EASING),
                targetOffsetX = { fullWidth -> fullWidth }   // end one screen-width to the RIGHT
            ) + fadeOut(animationSpec = tween(TRANSITION_MS, easing = TRANSITION_EASING))
        )
}

/**
 * PREDICTIVE-POP transition — used during an Android 14+ predictive back gesture
 * (the edge-swipe that lets the user "peek" at the previous screen before
 * committing). NavDisplay drives this one by the drag PROGRESS, not a fixed clock.
 *
 * The lambda receives the swipe-edge Int (left vs. right edge); we ignore it here
 * and use a soft scale+fade — the incoming screen scales up from 90% while the
 * outgoing screen scales down to 90% and fades, which feels good under a drag.
 */
private fun predictivePopSpec(): AnimatedContentTransitionScope<Scene<NavKey>>.(Int) -> ContentTransform = { _ ->
    (scaleIn(initialScale = 0.9f) + fadeIn())                // returning screen grows from 90% + fades in
        .togetherWith(
            scaleOut(targetScale = 0.9f) + fadeOut()         // leaving screen shrinks to 90% + fades out
        )
}

// ===========================================================================
// DATA
// A tiny in-memory data source. In a real app this would come from a database
// (Room), a network call (Retrofit), or a repository; here hardcoded lists are
// enough to demonstrate a four-level drill-down with transitions.
// ===========================================================================

// A top-level grouping shown on the FIRST screen.
//   • id   — stable unique identifier; this is what travels in the nav key.
//   • name — short label shown as the category row.
//   • description — one-line summary shown under the name.
data class Category(val id: Int, val name: String, val description: String)

// A single planet shown on the SECOND (list), THIRD (detail), and FOURTH (fact)
// screens.
//   • id         — stable unique identifier; travels in the detail/fact nav keys.
//   • categoryId — which Category this item belongs to (the "foreign key").
//   • title      — short name shown as the row/headline.
//   • blurb      — one-line description shown under the title.
//   • fact       — a longer "fun fact" shown only on the fourth screen.
data class Item(
    val id: Int,
    val categoryId: Int,
    val title: String,
    val blurb: String,
    val fact: String,
)

// Logcat tag string. Every log line from this app can be filtered in Logcat by
// searching for "NavT" (for "Nav Transitions demo").
private const val TAG = "NavT"

// The two categories rendered on the first screen.
private val sampleCategories = listOf(
    Category(1, "Rocky Planets", "Small, dense worlds with solid surfaces."),
    Category(2, "Gas Giants", "Massive planets made mostly of gas."),
)

// The planets rendered on the second screen. Each one's `categoryId` ties it
// back to a Category above (1 = Rocky, 2 = Gas Giant); `fact` powers screen 4.
private val sampleItems = listOf(
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
)

// --- Lookups ----------------------------------------------------------------
// The screens receive only an id (inside their nav key) and resolve the full
// object here. Passing just the id — rather than the whole object — keeps each
// navigation key tiny and serializable.

// Resolve a Category by its id. `first { }` throws if none match, which is fine
// here because every CategoryKey/ItemsKey is built from a known category id.
private fun categoryById(id: Int): Category = sampleCategories.first { it.id == id }

// Resolve a single Item by its id (used by the detail and fact screens).
private fun itemById(id: Int): Item = sampleItems.first { it.id == id }

// All items belonging to one category (used by the middle/list screen). `filter`
// returns every match — possibly an empty list, which is also fine to render.
private fun itemsInCategory(categoryId: Int): List<Item> =
    sampleItems.filter { it.categoryId == categoryId }

// ===========================================================================
// NAVIGATION KEYS
// Each screen is identified by a "key". A key both names the destination AND
// carries that destination's arguments. Nav3 requires keys to implement NavKey
// and (for state saving across process death) be @Serializable.
// ===========================================================================

// `data object` = a singleton with a generated toString()/equals(). There is
// only ever one categories screen, so a single shared object is the right model.
@Serializable
data object CategoriesKey : NavKey                          // first screen (no arguments)

// `data class` because each items screen differs by which category it lists.
@Serializable
data class ItemsKey(val categoryId: Int) : NavKey          // second screen; which category was tapped

// `data class` because each detail screen differs by which item it shows.
@Serializable
data class DetailKey(val itemId: Int) : NavKey             // third screen; which item was tapped

// `data class` because each fact screen differs by which item's fact it shows.
@Serializable
data class FactKey(val itemId: Int) : NavKey               // fourth screen; which item's fun fact to show

/**
 * MainActivity — the app's single Activity and the entry point Android launches.
 *
 * In a Nav3 app you typically have exactly one Activity; it hosts the Compose UI
 * and the navigation back stack, and Compose (not the Activity system) swaps —
 * and ANIMATES — between the four screens.
 */
class MainActivity : ComponentActivity() {
    // onCreate runs once when the Activity is first created. This is where we
    // install the Compose UI tree as the Activity's content.
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)                 // always call through to the framework first
        enableEdgeToEdge()                                 // draw under the status/navigation bars for a modern look
        setContent {                                       // everything inside is the Compose UI
            // Apply our app theme (colors, typography, dark/light handling).
            NavTransitionsTheme {
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
 * AppNavigation — owns the navigation back stack, WIRES UP THE CUSTOM TRANSITIONS,
 * and maps each key to its screen.
 *
 * This is where the sample's whole point lives: we pass our [forwardSpec],
 * [popSpec], and [predictivePopSpec] into NavDisplay so navigation animates the
 * way WE want instead of NavDisplay's plain default cross-fade.
 */
@Composable
fun AppNavigation(modifier: Modifier = Modifier) {
    // The back stack is the list of keys currently "stacked" on screen, bottom
    // to top. rememberNavBackStack seeds it with CategoriesKey and preserves it
    // across recompositions (and configuration changes). Pushing a key navigates
    // FORWARD (→ forwardSpec runs); popping a key navigates BACK (→ popSpec runs).
    // The stack can reach four deep: [CategoriesKey, ItemsKey, DetailKey, FactKey].
    val backStack = rememberNavBackStack(CategoriesKey)

    // A debug breadcrumb visible in Logcat (filter by "NavT") confirming this
    // composable was entered.
    Log.d(TAG, "Entered AppNavigation")

    // NavDisplay renders whatever key is on top of the back stack AND animates the
    // change. The three *Spec params below are THE feature of this sample:
    //   • transitionSpec               → played on FORWARD (push) navigation
    //   • popTransitionSpec            → played on POP (back) navigation
    //   • predictivePopTransitionSpec  → played during a predictive back-gesture
    // NavDisplay internally decides forward-vs-pop by diffing the back stack and
    // then invokes the matching spec to build the AnimatedContent ContentTransform.
    NavDisplay(
        backStack = backStack,
        modifier = modifier,
        // Called for system back gestures / the hardware back button. Popping the
        // top key returns to the previous screen; removeLastOrNull is a no-op (and
        // safe) if the stack is somehow already empty.
        onBack = { backStack.removeLastOrNull() },          // back = pop the top key
        // ── CUSTOM TRANSITIONS: app-wide defaults ──
        transitionSpec = forwardSpec(),                     // FORWARD: slide-in-from-right + fade
        popTransitionSpec = popSpec(),                      // POP:     mirror — slide-in-from-left + fade
        predictivePopTransitionSpec = predictivePopSpec(),  // PREDICTIVE BACK: gentle scale + fade
        // entryProvider is a DSL: one `entry<KeyType> { ... }` block per screen.
        // Nav3 picks the block whose key type matches the current top key.
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
            // LEVEL 1 — when CategoriesKey is on top, show the list of categories.
            entry<CategoriesKey> {
                CategoriesScreen(
                    categories = sampleCategories,
                    // Tapping a category pushes an ItemsKey carrying THAT category's
                    // id, navigating forward to its list of planets.
                    onOpen = { categoryId -> backStack.add(ItemsKey(categoryId)) }
                )
            }
            // LEVEL 2 — when an ItemsKey is on top, show that category's planets.
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
            // LEVEL 3 — when a DetailKey is on top, show that one planet's detail.
            entry<DetailKey> { key ->
                DetailScreen(
                    item = itemById(key.itemId),
                    // The "View fun fact" button pushes a FactKey for the SAME item,
                    // navigating forward to the fourth screen.
                    onOpenFact = { itemId -> backStack.add(FactKey(itemId)) },
                    // The on-screen back button pops one level (back to the items list).
                    onBack = { backStack.removeLastOrNull() }
                )
            }
            // LEVEL 4 — when a FactKey is on top, show that planet's fun fact.
            //
            // ── PER-ENTRY TRANSITION OVERRIDE (the second teaching point) ──
            // Instead of inheriting the app-wide horizontal slide, THIS entry
            // attaches its OWN transition specs via `metadata`. We build that map
            // by merging the NavDisplay.* helper builders with `+`. NavDisplay
            // prefers an entry's metadata over the NavDisplay-wide defaults, so the
            // Fact screen slides VERTICALLY: up-from-bottom on push, down-on-pop —
            // visibly different from every other screen, proving the override works.
            //
            // NOTE: the metadata helper lambdas use receiver scope
            // `AnimatedContentTransitionScope<Scene<*>>` (star-projected), which is
            // why the `fullHeight ->` builders below need no explicit Scene<NavKey>.
            entry<FactKey>(
                metadata =
                    NavDisplay.transitionSpec {              // FORWARD onto the Fact screen: rise up from the bottom
                        (slideInVertically(
                            animationSpec = tween(TRANSITION_MS, easing = TRANSITION_EASING),
                            initialOffsetY = { fullHeight -> fullHeight } // start one screen-height BELOW
                        ) + fadeIn(animationSpec = tween(TRANSITION_MS, easing = TRANSITION_EASING)))
                            .togetherWith(
                                fadeOut(animationSpec = tween(TRANSITION_MS, easing = TRANSITION_EASING)) // detail just fades under it
                            )
                    } + NavDisplay.popTransitionSpec {       // POP off the Fact screen: drop back down
                        fadeIn(animationSpec = tween(TRANSITION_MS, easing = TRANSITION_EASING)) // detail fades back in
                            .togetherWith(
                                slideOutVertically(
                                    animationSpec = tween(TRANSITION_MS, easing = TRANSITION_EASING),
                                    targetOffsetY = { fullHeight -> fullHeight } // exit one screen-height DOWNWARD
                                ) + fadeOut(animationSpec = tween(TRANSITION_MS, easing = TRANSITION_EASING))
                            )
                    }
            ) { key ->
                FactScreen(
                    item = itemById(key.itemId),
                    // "Back" pops one level (back to the detail screen).
                    onBack = { backStack.removeLastOrNull() },
                    // "Start over" pops EVERY key except the first, returning to the
                    // categories screen at the root of the stack.
                    onStartOver = { while (backStack.size > 1) backStack.removeLastOrNull() }
                )
            }
        }
    )
}

/**
 * Categories screen (LEVEL 1): a scrolling list of categories; tapping one calls
 * [onOpen] with its id (which the host turns into a FORWARD, slide-in navigation).
 *
 * This composable is intentionally "dumb" — it knows nothing about navigation or
 * transitions. It only renders the categories it's given and reports taps via
 * [onOpen]. That keeps it reusable and easy to preview/test.
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
 * Items screen (LEVEL 2): a header naming the chosen [category] followed by a
 * scrolling list of its [items]. Tapping an item calls [onOpen] (a FORWARD
 * transition); the header button calls [onBack] (a POP transition).
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
            Button(onClick = onBack) {                      // pop back to categories (POP transition)
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
                        .clickable { onOpen(item.id) }      // whole row tappable -> open detail (FORWARD)
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
 * Detail screen (LEVEL 3): shows the single [item] resolved from the id in the
 * nav key, with TWO buttons — one that drills FORWARD to the fourth screen (which
 * uses the per-entry VERTICAL slide) and one that POPS back.
 *
 * @param item       the fully-resolved item to display.
 * @param onOpenFact invoked with the item's id when "View fun fact" is tapped.
 * @param onBack     invoked when the user taps "Back to list".
 * @param modifier   optional layout modifier supplied by the caller.
 */
@Composable
fun DetailScreen(
    item: Item,
    onOpenFact: (Int) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // A single vertical column holding the title, body, and two buttons, with
    // 16dp of padding around the whole screen.
    Column(modifier = modifier.fillMaxSize().padding(16.dp)) {
        // Large headline showing the item's title.
        Text(text = item.title, style = MaterialTheme.typography.headlineSmall)
        // Fixed 8dp gap between the headline and the body text.
        Spacer(modifier = Modifier.height(8.dp))
        // The item's longer description.
        Text(text = item.blurb, style = MaterialTheme.typography.bodyLarge)
        // Larger 24dp gap before the action buttons.
        Spacer(modifier = Modifier.height(24.dp))
        // Primary action: drill forward to the fourth (fun fact) screen. Because
        // the FactKey entry overrides its transition, watch this one slide UP.
        Button(onClick = { onOpenFact(item.id) }) {
            Text("View fun fact")
        }
        // Small gap between the two buttons.
        Spacer(modifier = Modifier.height(8.dp))
        // Secondary action: pop back to the items list. (System back does the
        // same thing — see AppNavigation's onBack.)
        Button(onClick = onBack) {                          // pop back to the list (POP transition)
            Text("Back to list")
        }
    }
}

/**
 * Fact screen (LEVEL 4): shows a "fun fact" about the [item]. This is the screen
 * whose ENTRY METADATA overrides the app-wide horizontal slide with a VERTICAL
 * one, so it rises up from the bottom on push and drops back down on pop.
 *
 * @param item        the fully-resolved item whose fact is shown.
 * @param onBack      invoked when the user taps "Back" (pops one level).
 * @param onStartOver invoked when the user taps "Start over" (returns to the root).
 * @param modifier    optional layout modifier supplied by the caller.
 */
@Composable
fun FactScreen(
    item: Item,
    onBack: () -> Unit,
    onStartOver: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier.fillMaxSize().padding(16.dp)) {
        // Headline naming which planet this fun fact is about.
        Text(
            text = "Fun fact about ${item.title}",
            style = MaterialTheme.typography.headlineSmall,
        )
        Spacer(modifier = Modifier.height(16.dp))
        // The fun fact itself, pulled from the item's `fact` field.
        Text(text = item.fact, style = MaterialTheme.typography.bodyLarge)
        Spacer(modifier = Modifier.height(24.dp))
        // Pops one level back to the detail screen (the per-entry pop slides DOWN).
        Button(onClick = onBack) {
            Text("Back")
        }
        Spacer(modifier = Modifier.height(8.dp))
        // A second Button that clears the whole stack back to the first screen.
        Button(onClick = onStartOver) {
            Text("Start over")
        }
    }
}

// ===========================================================================
// STRETCH GOAL — SHARED-ELEMENT TRANSITION (documented only, NOT enabled)
//
// The brief's stretch goal was to make a planet's title appear to MORPH from the
// list row into the detail headline using Compose's SharedTransitionLayout. It is
// intentionally NOT compiled here, because a shared-element morph that survives a
// Nav3 destination change requires plumbing the SharedTransitionScope AND each
// destination's AnimatedVisibilityScope through to BOTH screens, and getting that
// wrong (or hitting an API mismatch across BOM versions) would risk the build.
// Keeping the build green is the priority, so here is exactly how it WOULD be done:
//
//   1. Opt in to the experimental APIs at the call sites:
//        @file:OptIn(ExperimentalSharedTransitionApi::class)   // or on each fn
//      and import:
//        androidx.compose.animation.ExperimentalSharedTransitionApi
//        androidx.compose.animation.SharedTransitionLayout
//        androidx.compose.animation.SharedTransitionScope
//
//   2. Wrap NavDisplay in a SharedTransitionLayout so a SharedTransitionScope is
//      in scope for every destination:
//        SharedTransitionLayout {                       // provides `this: SharedTransitionScope`
//            NavDisplay( ... )
//        }
//
//   3. Nav3 exposes each entry's AnimatedVisibilityScope via the composition local
//      LocalNavAnimatedContentScope (androidx.navigation3.ui). Inside an entry:
//        val animatedScope = LocalNavAnimatedContentScope.current
//
//   4. Tag the SAME logical element on BOTH screens with a matching key so Compose
//      can interpolate bounds between them:
//        Text(
//            planet.title,
//            modifier = Modifier.sharedElement(
//                sharedTransitionScope.rememberSharedContentState(key = "title-${planet.id}"),
//                animatedVisibilityScope = animatedScope,
//            )
//        )
//      Use the identical key string ("title-<id>") on the ItemsScreen row AND on
//      the DetailScreen headline; Compose then animates the title's position/size
//      from one to the other during the NavDisplay transition.
//
// Why it's omitted: SharedTransitionScope.sharedElement is @ExperimentalSharedTransitionApi
// and its exact signature (sharedElement vs sharedBounds, the boundsTransform
// parameter, how rememberSharedContentState is reached) shifts between Compose
// versions, so wiring it blind against this BOM is build-risk with no upside to
// the core forward/pop transition lesson. The horizontal + vertical slide/fade
// transitions above already fully demonstrate custom Nav3 transitions.
// ===========================================================================

// ===========================================================================
// @Preview functions — render screen states in the design pane.
//
// IMPORTANT FOR THIS SAMPLE: @Preview renders ONE STATIC frame. Transitions are
// motion over TIME, so the slide+fade you wired into NavDisplay does NOT play in
// these previews — they only show what each screen looks like at rest. To SEE the
// forward/pop/predictive transitions, run the app on a device or emulator and
// navigate between screens. The previews below exist just to sanity-check layout.
//
// widthDp/heightDp give each preview a small, fixed phone-shaped frame so the
// full-screen (fillMaxSize) layouts render as compact cards.
// ===========================================================================

// LEVEL 1 — the single categories-screen state (the full list).
@Preview(name = "Categories", showBackground = true, widthDp = 320, heightDp = 480)
@Composable
fun CategoriesScreenPreview() {
    NavTransitionsTheme {
        CategoriesScreen(categories = sampleCategories, onOpen = {})
    }
}

// Supplies every Item to the detail-screen preview — one render per planet.
class ItemPreviewProvider : PreviewParameterProvider<Item> {
    override val values: Sequence<Item> = sampleItems.asSequence()
}

// LEVEL 3 — one compact card per item, so ALL six planet details are previewed.
// (Static only — the forward slide that reveals this screen at runtime is not
// shown here; see the note above.)
@Preview(name = "Detail", showBackground = true, widthDp = 320, heightDp = 480)
@Composable
fun DetailScreenPreview(
    @PreviewParameter(ItemPreviewProvider::class) item: Item
) {
    NavTransitionsTheme {
        DetailScreen(item = item, onOpenFact = {}, onBack = {})
    }
}
