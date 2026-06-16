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

// A1 — the new key. Like every other key it implements NavKey and is @Serializable
// (so the whole back stack survives process death). It carries the SAME itemId the
// Fact screen had, so the new screen knows which planet — and thus which category —
// we came from. `data class` (not `data object`) because each instance differs by id.
@Serializable
data class CategoryInfoKey(val itemId: Int) : NavKey       // A1 — fifth screen; which planet's category to show

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
                    // THE JUMP — how a tap reaches the next screen: this line does NOT name a
                    // screen, it just ADDS A KEY to the back stack. NavDisplay then matches that
                    // key by its TYPE to the matching entry<...> { } block above and runs it; the
                    // id inside the key only chooses WHICH data that screen shows, not WHICH screen
                    // — so every key of this type lands on the same entry block.
                    onOpen = { categoryId ->
                        Log.d("LT", "In entry<CategoriesKey>, categoryId = ${categoryId}")
//                        Log.d("LT", "tapped category = ${categoryById(categoryId).name}")
                        backStack.add(ItemsKey(categoryId))
                    },
                    // A2(b) — hand-seed the stack so Back behaves as if the user drilled by hand:
                    // push the WHOLE path [Items, Detail, Fact], not just the end.
                    onJumpToFact = {                                       // A2 — the "Surprise me" jump
                        val item = sampleItems.random()                   // A2 — pick any planet at random
                        backStack.add(ItemsKey(item.categoryId))          // A2 — level 2: its category's planet list
                        backStack.add(DetailKey(item.id))                 // A2 — level 3: its detail
                        backStack.add(FactKey(item.id))                   // A2 — level 4: the fact (top = what's shown)
                        // WHERE DOES BACK LAND, AND WHY?  Now the stack is
                        // [Categories, Items, Detail, Fact]. Back pops Fact -> Detail -> Items ->
                        // Categories, exactly as if the user had tapped through manually. The NAIVE
                        // version (pushing ONLY [Categories, Fact]) would land Back straight on
                        // Categories — it skipped Items and Detail, so there is nothing in between
                        // to walk back through. Pushing the whole path is what makes Back sensible.
                    }
                )
            }
            // LEVEL 2 — when an ItemsKey is on top, show that category's planets.
            entry<ItemsKey> { key ->
//                Log.d("LT", "category = ${categoryById(key.categoryId).name}")
                Log.d("LT", "categoryId = ${key.categoryId}")
                ItemsScreen(
                    // Resolve the category (for the header) and its items (the rows).
                    category = categoryById(key.categoryId),
                    items = itemsInCategory(key.categoryId),
                    // Tapping a planet pushes a DetailKey carrying THAT item's id.
                    onOpen = { itemId ->
                        Log.d("LT", "In entry<ItemsKey>, categoryId = ${key.categoryId}")
                        backStack.add(DetailKey(itemId)) },
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
                    onStartOver = { while (backStack.size > 1) backStack.removeLastOrNull() },
                    // A1 — inside entry<FactKey> { key -> FactScreen( ... ) }, the new callback.
                    // It pushes a CategoryInfoKey for the SAME planet, navigating forward to level 5.
                    onOpenCategoryInfo = { itemId ->                   // A1 — itemId handed up from the Fact screen's button
                        backStack.add(CategoryInfoKey(itemId))        // A1 — push the 5th key -> NavDisplay shows CategoryInfoScreen
                    },
                    // A3 — pop EXACTLY TWO keys: FactKey (current) and DetailKey (below it), landing on Items.
                    onBackToList = {                                   // A3 — new event: pop exactly two
                        repeat(2) { backStack.removeLastOrNull() }    // A3 — pop Fact + Detail -> land on Items
                        // WHY removeLastOrNull() INSIDE repeat(2), not removeLast()?
                        //   removeLast() THROWS NoSuchElementException if the list is already empty;
                        //   removeLastOrNull() simply returns null and leaves the stack alone. Inside a
                        //   blind repeat(2) we are popping twice WITHOUT first checking the size, so if
                        //   the stack were ever shorter than two, removeLast() would crash on the second
                        //   pop — removeLastOrNull() makes the extra pop a safe no-op instead. (It is the
                        //   same safety the system-back onBack uses: backStack.removeLastOrNull().)
                        //
                        // WHAT WOULD THIS BUTTON HAVE DONE UNDER THE A2(a) ONE-JUMP STACK?
                        //   After A2(a) the stack was only [Categories, Fact]. repeat(2) would pop Fact
                        //   (back to Categories) and then try to pop again — and because we used
                        //   removeLastOrNull(), that second pop is a HARMLESS no-op (with removeLast()
                        //   it would have CRASHED). Either way the user lands on Categories, NOT on an
                        //   "Items" screen, because no ItemsKey was ever pushed — the button can't pop
                        //   back to a screen that isn't in the stack.
                        //
                        // WHY FINISHING A2(b) PROTECTS IT:
                        //   A2(b) pushes the whole path [Items, Detail, Fact], so popping two now removes
                        //   Fact + Detail and correctly leaves the user on the planet's ITEMS list — the
                        //   button finally does what its label promises, for both hand-drilled and
                        //   "Surprise me" arrivals.
                    }
                )
            }
            // A1 — LEVEL 5: when a CategoryInfoKey is on top, show that planet's category.
            entry<CategoryInfoKey> { key ->
                val item = itemById(key.itemId)                       // A1 — resolve the planet from the id in the key
                CategoryInfoScreen(
                    item = item,
                    category = categoryById(item.categoryId),         // A1 — follow the "foreign key" to its Category
                    onBack = { backStack.removeLastOrNull() },        // A1 — pop ONE level, back to the Fact screen
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
    onJumpToFact: () -> Unit,                              // A2 — new event: the "Surprise me" jump
    onOpen: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    // LazyColumn is the Compose equivalent of a RecyclerView: it only composes
    // and lays out the rows currently visible on screen, so long lists stay fast.
    LazyColumn(modifier = modifier.fillMaxSize()) {
        // A2 — CategoriesScreen is a bare LazyColumn, so the button gets its OWN slot
        // above the category rows via the SINGULAR item { } builder (one child, not a list).
        item {
            Button(
                onClick = onJumpToFact,
                modifier = Modifier.fillMaxWidth().padding(16.dp),
            ) {
                Text("Surprise me")
            }
            HorizontalDivider()
        }
        // `items(categories) { ... }` emits one block of UI per element.
        items(categories) { category ->                    // draw one row per category
            Column(
                modifier = Modifier
                    .fillMaxWidth()                         // row spans the full width...
                    // OS vs COMPOSE vs YOUR CODE — what a tap really is:
                    //   • Android (the OS) only reports a raw touch at a pixel (x, y); it knows
                    //     nothing about rows, items, names, or ids.
                    //   • Compose hit-tests that pixel to find WHICH composable sits there (this
                    //     one) and invokes its click lambda.
                    //   • YOUR code gives the tap its MEANING: the click lambda passes the exact
                    //     value you wired here (e.g. this row's id). "What was selected" is meaning
                    //     your code attaches to a raw touch — the OS never knows about it.
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
    onOpenCategoryInfo: (Int) -> Unit,                    // A1 — new event: open the 5th screen
    onBackToList: () -> Unit,                             // A3 — new event: pop exactly two
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
        // A1 — the new button that drills FORWARD to the fifth screen. We pass the
        // planet's id up; the entry<FactKey> block turns it into a CategoryInfoKey.
        Button(onClick = { onOpenCategoryInfo(item.id) }) {
            Text("About its category")
        }
        Spacer(modifier = Modifier.height(8.dp))
        // The Button the user asked for: pops one level back to the detail screen.
        Button(onClick = onBack) {
            Text("Back")
        }
        Spacer(modifier = Modifier.height(8.dp))
        // A3 — the new button BETWEEN "Back" and "Start over": pop exactly TWO keys
        // (Fact + Detail) -> land on the planet's Items list.
        Button(onClick = onBackToList) {
            Text("Back to planet list")
        }
        Spacer(modifier = Modifier.height(8.dp))
        // A second Button that clears the whole stack back to the first screen.
        Button(onClick = onStartOver) {
            Text("Start over")
        }
    }
}

/**
 * Category info screen (LEVEL 5 — A1's new fifth screen): shows the category the
 * [item] (planet) belongs to — its [Category.name] as a headline and its
 * [Category.description] underneath — plus a single Back button.
 *
 * STATELESS by design: it receives the already-resolved [item] and [category] plus
 * a no-arg [onBack] callback, so it knows nothing about navigation and previews
 * without the running app. Modeled directly on [FactScreen].
 *
 * @param item     the planet we came from (used only in the headline line).
 * @param category the category that planet belongs to (the real content shown).
 * @param onBack   invoked when the user taps "Back" (pops one level back to Fact).
 * @param modifier optional layout modifier supplied by the caller.
 */
@Composable
fun CategoryInfoScreen(
    item: Item,                                            // A1 — the planet we came from (used in the headline)
    category: Category,                                    // A1 — the category that planet belongs to (the real content)
    onBack: () -> Unit,                                    // A1 — event UP: "Back" pops one level (wired in the entry)
    modifier: Modifier = Modifier,                         // A1 — convention: hoisted modifier, first optional param
) {
    Column(modifier = modifier.fillMaxSize().padding(16.dp)) {
        // A small line tying the screen back to the planet the user drilled through.
        Text(
            text = "${item.title} belongs to:",
            style = MaterialTheme.typography.bodyMedium,
        )
        Spacer(modifier = Modifier.height(8.dp))
        // The category NAME as the headline — the primary thing this screen shows.
        Text(text = category.name, style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(8.dp))
        // The category DESCRIPTION underneath, just like the assignment asks.
        Text(text = category.description, style = MaterialTheme.typography.bodyLarge)
        Spacer(modifier = Modifier.height(24.dp))
        // Back pops exactly ONE key, returning to the Fact screen below it.
        Button(onClick = onBack) {
            Text("Back")
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
        CategoriesScreen(
            categories = sampleCategories,
            onJumpToFact = {},                              // A2 — no-op for the preview
            onOpen = {},
        )
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
        // A1 / A3 — the preview is LIVE code that calls FactScreen, so it now needs the
        // two new parameters too. Previews don't navigate, so pass no-op lambdas, exactly
        // like the existing onBack = {} / onStartOver = {}.
        FactScreen(
            item = item,
            onBack = {},
            onStartOver = {},
            onOpenCategoryInfo = {},                        // A1 — no-op for the preview
            onBackToList = {},                              // A3 — no-op for the preview
        )
    }
}

// A4 — LEVEL 5 preview: one compact card per planet (six in all), reusing the SAME
// ItemPreviewProvider that drives the Detail and Fact previews. The provider yields
// every Item, so Android Studio renders this @Composable once per planet — no app run.
@Preview(name = "CategoryInfo", showBackground = true, widthDp = 320, heightDp = 480)
@Composable
fun CategoryInfoScreenPreview(
    @PreviewParameter(ItemPreviewProvider::class) item: Item   // A4 — one Item per preview render
) {
    NavFourScreenTheme {
        CategoryInfoScreen(
            item = item,
            // A4 — Resolve the category EXACTLY as entry<CategoryInfoKey> does: follow the
            // item's categoryId through categoryById(). The preview thus shows the real
            // category each planet belongs to, with no ViewModel and no navigation.
            category = categoryById(item.categoryId),
            onBack = {},                                       // A4 — previews don't navigate
        )
    }
}
