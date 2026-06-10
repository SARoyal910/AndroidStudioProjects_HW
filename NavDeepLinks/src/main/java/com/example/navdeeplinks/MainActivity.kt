// =============================================================================
// MainActivity.kt  —  DEEP LINKING demo
//
// Built with:
//   • Jetpack Compose        — the declarative UI toolkit (no XML layouts).
//   • Navigation 3 (Nav3)    — the modern, Compose-first navigation library.
//   • Kotlinx Serialization  — used to mark navigation keys @Serializable.
//
// ---------------------------------------------------------------------------
// THE CONCEPT THIS SAMPLE TEACHES: DEEP LINKING
// ---------------------------------------------------------------------------
// Normally a user reaches a planet's detail screen by TAPPING down through the
// app, one screen at a time:
//
//   CategoriesScreen  --tap-->  ItemsScreen  --tap-->  DetailScreen
//   (Rocky / Gas)               (planets)              (one planet)
//
// A DEEP LINK lets an OUTSIDE source (a browser, an email, another app, an adb
// command, a notification) jump the user STRAIGHT to a specific DetailScreen by
// firing a URI such as:
//
//        navdemo://planet/3        ->  opens Earth's detail screen directly
//
// ...with NO taps through Categories and Items first.
//
// THE HARD PART — AND THE WHOLE POINT OF THIS SAMPLE — is the BACK STACK.
// If we naively showed ONLY the DetailScreen, the back stack would be just
// [DetailKey], and pressing Back would immediately EXIT the app. That feels
// broken: the user landed deep inside the app and has nowhere "up" to go.
//
// So instead, when we handle a deep link we SEED (pre-build) a sensible
// multi-entry back stack as if the user had navigated there by hand:
//
//        [ CategoriesKey, ItemsKey(categoryOf(id)), DetailKey(id) ]
//          └ bottom (root) ─────────────────────────────── top ┘
//
// Now Back walks naturally Detail -> Items -> Categories -> exit, exactly as if
// the user had tapped their way in. This is the recommended "synthetic back
// stack" pattern, done by hand so it's crystal clear.
//
// ---------------------------------------------------------------------------
// IMPORTANT DESIGN CONSTRAINT (per the assignment):
//   We do NOT use any Nav3 alpha-only deep-link helper APIs. We handle the raw
//   Android Intent ourselves (intent.data + onNewIntent), parse the URI by
//   hand, and push the right STABLE Nav3 keys. Everything below uses only the
//   shipped, stable Nav3 1.0.x surface (NavDisplay / entryProvider /
//   rememberNavBackStack / NavKey).
//
// ---------------------------------------------------------------------------
// HOW TO TEST (deep link from outside the app, via adb):
//
//   1. Build & install the app on a device/emulator.
//   2. Fire a VIEW intent at our custom scheme from a terminal:
//
//        adb shell am start -W -a android.intent.action.VIEW \
//            -d "navdemo://planet/4" com.example.navdeeplinks
//
//      (planet/4 = Mars). The app opens DIRECTLY on Mars's detail screen, and
//      pressing Back walks Mars -> Mars's category list -> Categories.
//
//   Try other ids:  navdemo://planet/1 (Mercury) ... navdemo://planet/6 (Saturn)
//   Try a bad id:   navdemo://planet/99  -> falls back to the Categories screen.
//
//   (You can also test a WARM start: open the app normally, send it to the
//    background, then fire the adb command again — onNewIntent handles it.)
// =============================================================================

// The package declaration. Every class/function below lives in this namespace,
// which also matches the directory structure under src/main/java/.
package com.example.navdeeplinks

// --- Android framework imports ------------------------------------------------
import android.content.Intent                                // the Intent we receive (warm starts via onNewIntent)
import android.net.Uri                                       // parsed deep-link URI (navdemo://planet/3)
import android.os.Bundle                                     // savedInstanceState type passed to onCreate
import android.util.Log                                      // Logcat logging (Log.d, Log.e, ...)
import androidx.activity.ComponentActivity                   // base Activity class with Compose support
import androidx.activity.compose.setContent                  // bridges an Activity to a Compose UI tree
import androidx.activity.enableEdgeToEdge                     // lets the app draw behind the system bars

// --- Compose layout / foundation imports -------------------------------------
import androidx.compose.foundation.clickable                 // makes a row tappable
import androidx.compose.foundation.layout.Column             // stacks children vertically
import androidx.compose.foundation.layout.Spacer             // empty box used to add fixed gaps
import androidx.compose.foundation.layout.fillMaxSize        // modifier: take all available width AND height
import androidx.compose.foundation.layout.fillMaxWidth       // modifier: take all available width
import androidx.compose.foundation.layout.height             // modifier: force a specific height
import androidx.compose.foundation.layout.padding            // modifier: add space around content
import androidx.compose.foundation.lazy.LazyColumn           // scrolling list (only renders visible rows)
import androidx.compose.foundation.lazy.items                // iterate a List inside a LazyColumn

// --- Material 3 component imports ---------------------------------------------
import androidx.compose.material3.Button                     // filled, tappable button
import androidx.compose.material3.HorizontalDivider          // thin horizontal separator line
import androidx.compose.material3.MaterialTheme              // access to the current theme's colors/typography
import androidx.compose.material3.Scaffold                   // standard screen frame (handles insets, bars, etc.)
import androidx.compose.material3.Text                       // draws text

// --- Compose runtime / tooling imports ---------------------------------------
import androidx.compose.runtime.Composable                   // marks a function as emitting UI
import androidx.compose.runtime.getValue                     // property-delegate read for mutableStateOf (by)
import androidx.compose.runtime.mutableStateOf               // holds the current deep-link URI as observable state
import androidx.compose.runtime.remember                     // remembers a value across recomposition
import androidx.compose.runtime.setValue                     // property-delegate write for mutableStateOf (by)
import androidx.compose.ui.Modifier                          // the "how to lay out / decorate" object
import androidx.compose.ui.tooling.preview.Preview           // enables @Preview rendering in Android Studio
import androidx.compose.ui.tooling.preview.PreviewParameter  // feeds a value into a preview parameter
import androidx.compose.ui.tooling.preview.PreviewParameterProvider // supplies the SET of preview values
import androidx.compose.ui.unit.dp                           // density-independent pixel unit (e.g. 16.dp)

// --- Navigation 3 imports -----------------------------------------------------
// Navigation 3 is the modern, Compose-first navigation approach: a single
// Activity holds a back stack of "keys", and Compose swaps the screen whenever
// the top key changes. No Fragments, no Intents (for in-app nav), no XML graph.
import androidx.navigation3.runtime.NavBackStack             // the MutableList<NavKey> we seed by hand from a deep link
import androidx.navigation3.runtime.NavKey                   // marker interface every navigation key implements
import androidx.navigation3.runtime.entryProvider            // DSL that maps each key type to a screen
import androidx.navigation3.ui.NavDisplay                    // the composable that renders the current top key

// --- App + misc imports -------------------------------------------------------
import com.example.navdeeplinks.ui.theme.NavDeepLinksTheme   // our app's Material theme wrapper (see Theme.kt)
import kotlinx.serialization.Serializable                    // makes Nav3 keys serializable (required by Nav3)

// ===========================================================================
// DATA
// A tiny in-memory data source. In a real app this would come from a database
// (Room), a network call (Retrofit), or a repository; here hardcoded lists are
// enough to demonstrate a three-level drill-down + deep linking.
//
// The model is two levels deep:
//   Category 1─┐
//              ├── many Items   (each Item belongs to exactly one Category)
//   Category 2─┘
// ===========================================================================

// A top-level grouping shown on the FIRST screen.
//   • id   — stable unique identifier; this is what travels in the nav key.
//   • name — short label shown as the category row.
//   • description — one-line summary shown under the name.
data class Category(val id: Int, val name: String, val description: String)

// A single planet shown on the SECOND (list) and THIRD (detail) screens.
//   • id         — stable unique identifier; THIS is the number a deep link
//                  carries (navdemo://planet/<id>) and what the detail key holds.
//   • categoryId — which Category this item belongs to (the "foreign key").
//                  Used when seeding the back stack: a deep link gives us only an
//                  item id, and we must look up its category to build ItemsKey.
//   • title      — short name shown as the row/headline.
//   • blurb      — one-line description shown under the title.
data class Item(
    val id: Int,
    val categoryId: Int,
    val title: String,
    val blurb: String,
)

// Logcat tag string. Every log line from this app can be filtered in Logcat by
// searching for "DeepLink".
private const val TAG = "DeepLink"

// The two categories rendered on the first screen.
private val sampleCategories = listOf(
    Category(1, "Rocky Planets", "Small, dense worlds with solid surfaces."),
    Category(2, "Gas Giants", "Massive planets made mostly of gas."),
)

// The planets rendered on the second screen. Each one's `categoryId` ties it
// back to a Category above (1 = Rocky, 2 = Gas Giant). The `id` is the value a
// deep link targets: navdemo://planet/1 == Mercury, .../6 == Saturn.
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
// here because every CategoryKey/ItemsKey is built from a known category id.
private fun categoryById(id: Int): Category = sampleCategories.first { it.id == id }

// Resolve a single Item by its id (used by the detail screen).
private fun itemById(id: Int): Item = sampleItems.first { it.id == id }

// All items belonging to one category (used by the middle/list screen). `filter`
// returns every match — possibly an empty list, which is also fine to render.
private fun itemsInCategory(categoryId: Int): List<Item> =
    sampleItems.filter { it.categoryId == categoryId }

// --- Deep-link helpers ------------------------------------------------------
// Look up which CATEGORY an item belongs to, returning null when the id is
// unknown. A deep link hands us only an item id, so to seed an ItemsKey for the
// middle of the back stack we must first discover that item's category.
// `firstOrNull` (not `first`) is deliberate: a deep link is UNTRUSTED external
// input and may carry a bogus id, so we must tolerate "no such item".
private fun categoryIdForItem(itemId: Int): Int? =
    sampleItems.firstOrNull { it.id == itemId }?.categoryId

// ===========================================================================
// NAVIGATION KEYS
// Each screen is identified by a "key". A key both names the destination AND
// carries that destination's arguments. Nav3 requires keys to implement NavKey
// and (for state saving across process death) be @Serializable.
//   • CategoriesKey has no arguments — there is only one categories screen.
//   • ItemsKey carries a categoryId — which category's items to list.
//   • DetailKey carries an itemId   — which single item to show (deep-link target).
// ===========================================================================

// `data object` = a singleton with a generated toString()/equals(). There is
// only ever one categories screen, so a single shared object is the right model.
@Serializable
data object CategoriesKey : NavKey                           // first screen (no arguments) — the back-stack ROOT

// `data class` because each items screen differs by which category it lists.
@Serializable
data class ItemsKey(val categoryId: Int) : NavKey           // second screen; which category was tapped/seeded

// `data class` because each detail screen differs by which item it shows. This
// is the key a deep link ultimately lands on (navdemo://planet/<itemId>).
@Serializable
data class DetailKey(val itemId: Int) : NavKey              // third screen; which item to show (deep-link target)

// ===========================================================================
// DEEP LINK PARSING
// Pure, side-effect-free functions that turn the raw Android launch URI into
// either a seeded multi-entry back stack OR the plain single-entry default.
// Keeping this logic OUT of the Activity/Composables makes it trivial to reason
// about (and unit-test) the "URI -> back stack" translation in isolation.
// ===========================================================================

/**
 * Pull the target item id out of a deep-link [uri], or null if there isn't one.
 *
 * We accept URIs shaped like `navdemo://planet/<id>` (see the AndroidManifest
 * intent-filter). The id is the LAST path segment, parsed as an Int:
 *
 *   navdemo://planet/3   -> lastPathSegment "3"   -> 3
 *   navdemo://planet     -> lastPathSegment null  -> null
 *   navdemo://planet/abc -> "abc".toIntOrNull()   -> null  (gracefully ignored)
 *
 * `toIntOrNull()` (not `toInt()`) is essential: the URI is untrusted external
 * input, so a non-numeric segment must NOT crash the app — it just means "no
 * valid deep link", and we fall back to the normal Categories screen.
 */
private fun parseItemId(uri: Uri?): Int? {
    // No URI at all (the app was opened from the launcher, not a deep link).
    if (uri == null) return null
    // Grab the final path segment ("3" from navdemo://planet/3). May be null.
    val lastSegment = uri.lastPathSegment
    // Convert to Int, tolerating null/garbage by yielding null (never throwing).
    val itemId = lastSegment?.toIntOrNull()
    // Breadcrumb so you can watch the parse happen in Logcat (filter "DeepLink").
    Log.d(TAG, "parseItemId: uri=$uri lastSegment=$lastSegment -> itemId=$itemId")
    return itemId
}

/**
 * Translate a (possibly null) deep-link [uri] into the INITIAL back stack the
 * app should launch with. THIS is the core of the whole sample.
 *
 *   • Valid deep link (e.g. navdemo://planet/3 where item 3 exists):
 *       returns a SEEDED 3-entry stack so the user can navigate "up":
 *         [ CategoriesKey, ItemsKey(categoryOfItem), DetailKey(itemId) ]
 *       Back then walks Detail -> Items -> Categories -> exit, exactly as if the
 *       user had tapped their way in by hand.
 *
 *   • No / invalid deep link (launcher tap, bad id, non-numeric segment):
 *       returns the plain default:  [ CategoriesKey ].
 *
 * Returning a List<NavKey> (rather than mutating a stack here) keeps this a pure
 * function: same input -> same output, no Compose/Activity state involved.
 */
private fun buildInitialBackStack(uri: Uri?): List<NavKey> {
    // Step 1: try to extract a target item id from the URI.
    val itemId = parseItemId(uri)
    // Step 2: if we got an id, find which category it lives in. A non-null
    // result here means the id is BOTH numeric AND a real, known item.
    val categoryId = itemId?.let { categoryIdForItem(it) }

    // Step 3a: VALID deep link -> SEED a multi-entry stack. We list the keys
    // bottom (root) to top, mirroring a hand-navigated journey:
    //   index 0: CategoriesKey      <- root, so Back never dead-ends into "exit"
    //   index 1: ItemsKey(category) <- the list the target item belongs to
    //   index 2: DetailKey(itemId)  <- the screen the deep link actually wants
    if (itemId != null && categoryId != null) {
        Log.d(TAG, "buildInitialBackStack: SEEDING for itemId=$itemId (category=$categoryId)")
        return listOf(
            CategoriesKey,                 // bottom of stack: the home/root screen
            ItemsKey(categoryId),          // middle: the item's category list
            DetailKey(itemId),             // TOP: the deep-linked detail screen (shown first)
        )
    }

    // Step 3b: no usable deep link -> the ordinary single-screen launch.
    Log.d(TAG, "buildInitialBackStack: no valid deep link -> default [CategoriesKey]")
    return listOf(CategoriesKey)
}

/**
 * MainActivity — the app's single Activity and the entry point Android launches.
 *
 * In a Nav3 app you typically have exactly one Activity; it hosts the Compose UI
 * and the navigation back stack, and Compose (not the Activity system) swaps
 * between the screens. Here the Activity ALSO owns the deep-link plumbing: it
 * reads the launch [Intent] (cold start) and any later intents ([onNewIntent],
 * warm start), exposing the current deep-link URI to the Compose layer.
 */
class MainActivity : ComponentActivity() {

    // The deep-link URI that should drive the initial back stack. It's Compose
    // state (mutableStateOf) so that a WARM-start deep link delivered via
    // onNewIntent can update it AFTER the UI is already on screen, causing the
    // navigation host to recompose and re-seed. Starts as the cold-start URI.
    private var deepLinkUri by mutableStateOf<Uri?>(null)

    // onCreate runs once when the Activity is first created (a COLD start). This
    // is where we read the LAUNCH intent's URI and install the Compose UI tree.
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)                 // always call through to the framework first
        enableEdgeToEdge()                                 // draw under the status/navigation bars for a modern look

        // COLD-START DEEP LINK: when the app is launched by a VIEW intent (our
        // navdemo:// scheme), Android puts the URI in `intent.data`. For a plain
        // launcher tap this is simply null, and we fall back to Categories.
        deepLinkUri = intent?.data
        Log.d(TAG, "onCreate: launch intent.data = $deepLinkUri")

        setContent {                                       // everything inside is the Compose UI
            // Apply our app theme (colors, typography, dark/light handling).
            NavDeepLinksTheme {
                // Scaffold provides the standard screen structure and, crucially,
                // hands us `innerPadding` — the space taken by system bars — so
                // our content isn't drawn underneath them.
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    // Translate the current deep-link URI into the seeded (or
                    // default) initial keys, and hand them to the nav host. We
                    // read `deepLinkUri` (the state field) here so that an
                    // onNewIntent update re-runs this and re-seeds the stack.
                    AppNavigation(
                        initialKeys = buildInitialBackStack(deepLinkUri),
                        modifier = Modifier.padding(innerPadding),
                    )
                }
            }
        }
    }

    // onNewIntent runs for a WARM start: the Activity is ALREADY alive (e.g. in
    // the background) when a new VIEW intent arrives. onCreate will NOT run
    // again, so without this override a warm-start deep link would be ignored.
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)                          // let the framework process it first
        // Replace the Activity's stored intent so getIntent()/intent reflects the
        // NEW deep link (the framework otherwise keeps returning the original).
        setIntent(intent)
        // Push the new URI into our Compose state. Because AppNavigation keys its
        // remembered back stack on these keys, changing the URI rebuilds the
        // stack and navigates to the freshly deep-linked screen.
        deepLinkUri = intent.data
        Log.d(TAG, "onNewIntent: new intent.data = $deepLinkUri")
    }
}

/**
 * AppNavigation — owns the navigation back stack and maps each key to its screen.
 *
 * This is the heart of the Nav3 setup. Unlike a plain sample, the INITIAL stack
 * is supplied by the caller ([initialKeys]) so a deep link can seed it with
 * multiple entries. It:
 *   1. Creates/remembers the back stack from [initialKeys] (1 entry normally,
 *      3 entries when deep-linked).
 *   2. Renders the top of the stack via NavDisplay.
 *   3. Defines what "back" does and which composable each key shows.
 *
 * @param initialKeys the keys to seed the back stack with, bottom-to-top. For a
 *        normal launch this is just [CategoriesKey]; for a deep link it is
 *        [CategoriesKey, ItemsKey(...), DetailKey(...)].
 * @param modifier    optional layout modifier supplied by the caller.
 */
@Composable
fun AppNavigation(
    initialKeys: List<NavKey>,
    modifier: Modifier = Modifier,
) {
    // Seed the back stack from the caller-supplied keys. NavBackStack's vararg
    // constructor takes NavKey elements, so we spread (*) the list into it. The
    // result is a MutableList<NavKey> backed by snapshot state, so it survives
    // recomposition (and, because its keys are @Serializable, process death).
    //
    // KEY DETAIL: we pass `initialKeys` as the `key` of the remember block. When
    // a WARM-start deep link changes the URI (onNewIntent), `initialKeys` changes
    // too, so this remembered stack is THROWN AWAY and REBUILT from the new seed
    // — re-seeding the navigation to the newly deep-linked screen.
    val backStack = remember(initialKeys) {
        NavBackStack(*initialKeys.toTypedArray())          // hand-seeded multi-entry stack (the whole point)
    }

    // A debug breadcrumb visible in Logcat (filter by "DeepLink") showing exactly
    // what the back stack was seeded with — 1 key normally, 3 when deep-linked.
    Log.d(TAG, "AppNavigation: seeded backStack = $backStack")

    // NavDisplay renders whatever key is on top of the back stack, animating the
    // transition when the top changes. Because a deep link seeds the TOP as a
    // DetailKey, the user lands on the detail screen immediately.
    NavDisplay(
        backStack = backStack,
        modifier = modifier,
        // Called for system back gestures / the hardware back button. Popping the
        // top key returns to the previous screen. Thanks to the SEEDED stack, a
        // deep-linked user can press Back to walk Detail -> Items -> Categories
        // instead of being kicked straight out of the app.
        onBack = { backStack.removeLastOrNull() },          // back = pop the top key
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
            // This is the screen a deep link (navdemo://planet/<id>) lands on.
            entry<DetailKey> { key ->
                DetailScreen(
                    item = itemById(key.itemId),
                    // The on-screen back button pops one level. For a deep-linked
                    // user this goes "up" to the seeded ItemsKey, NOT out of the app.
                    onBack = { backStack.removeLastOrNull() }
                )
            }
        }
    )
}

/**
 * Categories screen (LEVEL 1): a scrolling list of categories; tapping one calls
 * [onOpen] with its id.
 *
 * This composable is intentionally "dumb" — it knows nothing about navigation or
 * deep links. It only renders the categories it's given and reports taps via
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
 * scrolling list of its [items]. Tapping an item calls [onOpen]; the button at
 * the top calls [onBack].
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
 * Detail screen (LEVEL 3): shows the single [item] resolved from the id in the
 * nav key, with a single Button to go back.
 *
 * This is the DEEP-LINK TARGET: navdemo://planet/<id> seeds the back stack so
 * this screen is what the user sees first. Because the stack underneath was
 * pre-seeded with [CategoriesKey, ItemsKey], the [onBack] here navigates the
 * user "up" into the app rather than straight out of it.
 *
 * @param item     the fully-resolved item to display.
 * @param onBack   invoked when the user taps "Back" (pops one level).
 * @param modifier optional layout modifier supplied by the caller.
 */
@Composable
fun DetailScreen(
    item: Item,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // A single vertical column holding the title, body, and back button, with
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
        // Pop back one level. For a hand-navigated user this returns to the items
        // list; for a DEEP-LINKED user it returns to the SEEDED items list — the
        // whole reason we pre-built a multi-entry stack. (System back does the
        // same thing — see AppNavigation's onBack.)
        Button(onClick = onBack) {                          // pop back one level
            Text("Back")
        }
    }
}

// ===========================================================================
// @Preview functions — render screen states in the design pane.
//
// These let you see each screen directly in Android Studio's design pane WITHOUT
// running the app on a device or emulator. Each preview wraps the screen in the
// app theme and passes no-op callbacks ({}), since previews don't navigate (and
// certainly can't receive deep-link intents).
//
// widthDp/heightDp give each preview a small, fixed phone-shaped frame so the
// full-screen (fillMaxSize) layouts render as compact cards.
// ===========================================================================

// LEVEL 1 — the single categories-screen state (the full list).
@Preview(name = "Categories", showBackground = true, widthDp = 320, heightDp = 480)
@Composable
fun CategoriesScreenPreview() {
    NavDeepLinksTheme {
        CategoriesScreen(categories = sampleCategories, onOpen = {})
    }
}

// Supplies every Item to the detail-screen preview — one per planet. This mirrors
// the data a deep link can target (ids 1..6).
class ItemPreviewProvider : PreviewParameterProvider<Item> {
    override val values: Sequence<Item> = sampleItems.asSequence()
}

// LEVEL 3 — one compact card per item, so ALL six deep-link targets are previewed.
@Preview(name = "Detail (deep-link target)", showBackground = true, widthDp = 320, heightDp = 480)
@Composable
fun DetailScreenPreview(
    @PreviewParameter(ItemPreviewProvider::class) item: Item
) {
    NavDeepLinksTheme {
        DetailScreen(item = item, onBack = {})
    }
}
