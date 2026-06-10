// =============================================================================
// MainActivity.kt
//
// A minimal FOUR-screen "drill-down" sample app built with:
//   • Jetpack Compose        — the declarative UI toolkit (no XML layouts).
//   • Navigation 3 (Nav3)    — the modern, Compose-first navigation library.
//   • Kotlinx Serialization  — used to mark navigation keys @Serializable.
//
// This is the bigger sibling of the three-screen sample. It adds a FOURTH
// screen — a "Fun Fact" screen — reached by a Button on the Detail screen, so
// the navigation back stack can now be four deep:
//
//   CategoriesScreen   --tap-->   ItemsScreen   --tap-->   DetailScreen
//   (Rocky / Gas)                 (planets)                (one planet)
//                                                               |
//                                                   Button: "View fun fact"
//                                                               v
//                                                          FactScreen
//                                                          (a fun fact + Button)
//
//   Back stack grows:  [Categories] -> [..Items] -> [..Detail] -> [..Fact]
//   System/Back button pops one key at a time, walking back up the chain.
//
// Reading order below: package + imports, then DATA, then NAVIGATION KEYS,
// then the Activity, then each of the four screen Composables.
// =============================================================================

// The package declaration. Every class/function below lives in this namespace,
// which also matches the directory structure under src/main/java/.
package com.example.navfourscreen

// --- Android framework imports ------------------------------------------------
import android.os.Bundle                                    // savedInstanceState type passed to onCreate
import androidx.activity.ComponentActivity                  // base Activity class with Compose support
import androidx.activity.compose.setContent                 // bridges an Activity to a Compose UI tree
import androidx.activity.enableEdgeToEdge                    // lets the app draw behind the system bars

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
import androidx.navigation3.ui.NavDisplay                   // the composable that renders the current top key

// --- App + misc imports -------------------------------------------------------
import com.example.navfourscreen.ui.theme.NavFourScreenTheme // our app's Material theme wrapper (see Theme.kt)
import kotlinx.serialization.Serializable                   // makes Nav3 keys serializable (required by Nav3)
import android.util.Log                                     // Logcat logging (Log.d, Log.e, ...)

// ===========================================================================
// DATA
// A tiny in-memory data source. In a real app this would come from a database
// (Room), a network call (Retrofit), or a repository; here hardcoded lists are
// enough to demonstrate a four-level drill-down.
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
// searching for "L4" (for "Level 4 nav demo").
private const val TAG = "L4"

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
//   • CategoriesKey has no arguments — there is only one categories screen.
//   • ItemsKey carries a categoryId — which category's items to list.
//   • DetailKey carries an itemId   — which single item to show.
//   • FactKey carries an itemId     — which item's fun fact to show (screen 4).
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
 * and the navigation back stack, and Compose (not the Activity system) swaps
 * between the four screens.
 */
class MainActivity : ComponentActivity() {
    // onCreate runs once when the Activity is first created. This is where we
    // install the Compose UI tree as the Activity's content.
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)                 // always call through to the framework first
        enableEdgeToEdge()                                 // draw under the status/navigation bars for a modern look
        setContent {                                       // everything inside is the Compose UI
            // Apply our app theme (colors, typography, dark/light handling).
            NavFourScreenTheme {
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
 * AppNavigation — owns the navigation back stack and maps each key to its screen.
 *
 * This is the heart of the Nav3 setup. It:
 *   1. Creates/remembers the back stack (starting at the categories screen).
 *   2. Renders the top of the stack via NavDisplay.
 *   3. Defines what "back" does and which composable each of the four keys shows.
 */
@Composable
fun AppNavigation(modifier: Modifier = Modifier) {
    // The back stack is the list of keys currently "stacked" on screen, bottom
    // to top. rememberNavBackStack seeds it with CategoriesKey and preserves it
    // across recompositions (and configuration changes). Pushing a key navigates
    // forward; popping a key navigates back. In this app the stack can reach four
    // deep: [CategoriesKey, ItemsKey, DetailKey, FactKey].
    val backStack = rememberNavBackStack(CategoriesKey)

    // A debug breadcrumb visible in Logcat (filter by "L4") confirming this
    // composable was entered.
    Log.d(TAG, "Entered AppNavigation")

    // NavDisplay renders whatever key is on top of the back stack, animating the
    // transition when the top changes.
    NavDisplay(
        backStack = backStack,
        modifier = modifier,
        // Called for system back gestures / the hardware back button. Popping the
        // top key returns to the previous screen; removeLastOrNull is a no-op (and
        // safe) if the stack is somehow already empty.
        onBack = { backStack.removeLastOrNull() },          // back = pop the top key
        // entryProvider is a DSL (a small "language" for one job): it builds the
        // map of "which key type -> which screen". You call entry<...> once per
        // screen inside the { } block, and Nav3 runs the block whose key type
        // matches the key currently on top of the back stack.
        //
        // How to read ONE line, e.g.  entry<ItemsKey> { key -> ItemsScreen(...) } :
        //   • entry           — a Nav3 builder function (from
        //                       androidx.navigation3.runtime) that registers ONE
        //                       screen for ONE key type.
        //   • <ItemsKey>      — a GENERIC TYPE ARGUMENT, in angle brackets (a TYPE
        //                       slot, not a value in parentheses): the key type this
        //                       block handles. Nav3 matches it against the top key.
        //   • { key -> ... }  — the @Composable CONTENT shown while that key is on
        //                       top. The lambda is handed the key instance, so a
        //                       data-class key can read its arguments (key.categoryId).
        //                       CategoriesKey is a data OBJECT (it carries no data),
        //                       so its block below omits the `key ->` parameter.
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
            entry<FactKey> { key ->
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
 * [onOpen] with its id.
 *
 * This composable is intentionally "dumb" — it knows nothing about navigation.
 * It only renders the categories it's given and reports taps via [onOpen]. That
 * keeps it reusable and easy to preview/test.
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
 * nav key, with TWO buttons — one that drills forward to the fourth screen and
 * one that goes back.
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
        // Primary action: drill forward to the fourth (fun fact) screen.
        Button(onClick = { onOpenFact(item.id) }) {
            Text("View fun fact")
        }
        // Small gap between the two buttons.
        Spacer(modifier = Modifier.height(8.dp))
        // Secondary action: pop back to the items list. (System back does the
        // same thing — see AppNavigation's onBack.)
        Button(onClick = onBack) {                          // pop back to the list
            Text("Back to list")
        }
    }
}

/**
 * Fact screen (LEVEL 4 — the new fourth screen): shows a "fun fact" about the
 * [item] and contains a Button (in fact two) to navigate back.
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
        // The Button the user asked for: pops one level back to the detail screen.
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
// @Preview functions — render EVERY possible screen state in the design pane.
//
// These let you see each screen directly in Android Studio's design pane WITHOUT
// running the app on a device or emulator. Each preview wraps the screen in the
// app theme and passes no-op callbacks ({}), since previews don't navigate.
//
// The Items, Detail, and Fact previews use @PreviewParameter: a
// PreviewParameterProvider supplies a SEQUENCE of values, and Android Studio
// renders the screen ONCE PER value. Because the providers read the same
// sampleCategories / sampleItems the app uses, the preview set updates
// automatically if you add data.
//
// widthDp/heightDp give each preview a small, fixed phone-shaped frame so the
// full-screen (fillMaxSize) layouts render as compact cards instead of each
// taking a whole device-height of space — letting several fit on screen at once.
//
// Total renderings produced:
//   • Categories : 1  (there is only one possible list)
//   • Items      : 2  (one per Category — Rocky Planets, Gas Giants)
//   • Detail     : 6  (one per Item — every planet)
//   • Fact       : 6  (one per Item — every planet's fun fact)
//   ───────────────────────────────────────────────────────────────
//   = 15 previews, i.e. every reachable screen state.
// ===========================================================================

// LEVEL 1 — there is only ONE categories-screen state (the full list).
@Preview(name = "Categories", showBackground = true, widthDp = 320, heightDp = 480)
@Composable
fun CategoriesScreenPreview() {
    NavFourScreenTheme {
        CategoriesScreen(categories = sampleCategories, onOpen = {})
    }
}

// Supplies every Category to the items-screen preview (Rocky Planets, Gas Giants).
class CategoryPreviewProvider : PreviewParameterProvider<Category> {
    override val values: Sequence<Category> = sampleCategories.asSequence()
}

// LEVEL 2 — one compact card per category, so BOTH item lists are previewed.
@Preview(name = "Items", showBackground = true, widthDp = 320, heightDp = 480)
@Composable
fun ItemsScreenPreview(
    @PreviewParameter(CategoryPreviewProvider::class) category: Category
) {
    NavFourScreenTheme {
        ItemsScreen(
            category = category,
            items = itemsInCategory(category.id),           // resolve this category's planets
            onOpen = {},
            onBack = {},
        )
    }
}

// Supplies every Item to the detail- and fact-screen previews — one per planet.
class ItemPreviewProvider : PreviewParameterProvider<Item> {
    override val values: Sequence<Item> = sampleItems.asSequence()
}

// LEVEL 3 — one compact card per item, so ALL six planet details are previewed.
@Preview(name = "Detail", showBackground = true, widthDp = 320, heightDp = 480)
@Composable
fun DetailScreenPreview(
    @PreviewParameter(ItemPreviewProvider::class) item: Item
) {
    NavFourScreenTheme {
        DetailScreen(item = item, onOpenFact = {}, onBack = {})
    }
}

// LEVEL 4 — one compact card per item, so ALL six fun-fact screens are previewed.
@Preview(name = "Fact", showBackground = true, widthDp = 320, heightDp = 480)
@Composable
fun FactScreenPreview(
    @PreviewParameter(ItemPreviewProvider::class) item: Item
) {
    NavFourScreenTheme {
        FactScreen(item = item, onBack = {}, onStartOver = {})
    }
}
