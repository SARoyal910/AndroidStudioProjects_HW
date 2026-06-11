// =============================================================================
// MainActivity.kt
//
// A minimal THREE-screen "drill-down" sample app built with:
//   • Jetpack Compose        — the declarative UI toolkit (no XML layouts).
//   • Navigation 3 (Nav3)    — the modern, Compose-first navigation library.
//   • Kotlinx Serialization  — used to mark navigation keys @Serializable.
//
// This is the bigger sibling of the two-screen list -> detail sample. Here we
// add one more level so the navigation back stack can be three deep:
//
//   CategoriesScreen        --tap a category-->   ItemsScreen
//   (Rocky / Gas Giants)                          (planets in that category)
//                                                       |
//                                                  tap a planet
//                                                       v
//                                                  DetailScreen
//                                                  (one planet)
//
//   Back stack grows:  [CategoriesKey] -> [..., ItemsKey] -> [..., DetailKey]
//   System/Back button pops one key at a time, walking back up the chain.
//
// Reading order below: package + imports, then DATA, then NAVIGATION KEYS,
// then the Activity, then each of the three screen Composables.
// =============================================================================

// The package declaration. Every class/function below lives in this namespace,
// which also matches the directory structure under src/main/java/.
package com.example.navthreescreen

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
import com.example.navthreescreen.ui.theme.NavThreeScreenTheme // our app's Material theme wrapper (see Theme.kt)
import kotlinx.serialization.Serializable                   // makes Nav3 keys serializable (required by Nav3)
import android.util.Log                                     // Logcat logging (Log.d, Log.e, ...)

// ===========================================================================
// NAVIGATION KEYS
// Each screen is identified by a "key". A key both names the destination AND
// carries that destination's arguments. Nav3 requires keys to implement NavKey
// and (for state saving across process death) be @Serializable.
//   • CategoriesKey has no arguments — there is only one categories screen.
//   • ItemsKey carries a categoryId — which category's items to list.
//   • DetailKey carries an itemId   — which single item to show.
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

// Logcat tag string. Every log line from this app can be filtered in Logcat by
// searching for "L3" (for "Level 3 nav demo").
private const val TAG = "L3"

/**
 * MainActivity — the app's single Activity and the entry point Android launches.
 *
 * In a Nav3 app you typically have exactly one Activity; it hosts the Compose UI
 * and the navigation back stack, and Compose (not the Activity system) swaps
 * between the three screens.
 */
class MainActivity : ComponentActivity() {
    // onCreate runs once when the Activity is first created. This is where we
    // install the Compose UI tree as the Activity's content.
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)                 // always call through to the framework first
        enableEdgeToEdge()                                 // draw under the status/navigation bars for a modern look
        setContent {                                       // everything inside is the Compose UI
            // Apply our app theme (colors, typography, dark/light handling).
            NavThreeScreenTheme {
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
 *   3. Defines what "back" does and which composable each of the three keys shows.
 */
@Composable
fun AppNavigation(modifier: Modifier = Modifier) {
    // The back stack is the list of keys currently "stacked" on screen, bottom
    // to top. rememberNavBackStack seeds it with CategoriesKey and preserves it
    // across recompositions (and configuration changes). Pushing a key navigates
    // forward; popping a key navigates back. In this app the stack can reach
    // three deep: [CategoriesKey, ItemsKey, DetailKey].
    val backStack = rememberNavBackStack(CategoriesKey)

    // A debug breadcrumb visible in Logcat (filter by "L3") confirming this
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
        // entryProvider is a DSL: one `entry<KeyType> { ... }` block per screen.
        // NavDisplay picks the block whose key type matches the current top key.
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
                    // THE JUMP — how a tap reaches the next screen: this line does NOT name a
                    // screen, it just ADDS A KEY to the back stack. NavDisplay then matches that
                    // key by its TYPE to the matching entry<...> { } block above and runs it; the
                    // id inside the key only chooses WHICH data that screen shows, not WHICH screen
                    // — so every key of this type lands on the same entry block.
                    onOpen = { categoryId -> backStack.add(ItemsKey(categoryId)) }
                )
            }
            // LEVEL 2 — when an ItemsKey is on top, show that category's planets.
            // The lambda receives the actual key instance, so we can read its arg.
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
                // key.itemId is the argument carried by the key; resolve it to the
                // full Item object to display.
                DetailScreen(
                    item = itemById(key.itemId),
                    // The on-screen back button pops one level (back to the items list).
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
    Log.d("LT", "Entered CategoriesScreen")
    // LazyColumn is the Compose equivalent of a RecyclerView: it only composes
    // and lays out the rows currently visible on screen, so long lists stay fast.
    LazyColumn(modifier = modifier.fillMaxSize()) {
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
    Log.d("LT", "Entered ItemsScreen")
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
 * nav key, plus a Back button.
 *
 * Like the other screens, this is navigation-agnostic: it just displays the item
 * and calls [onBack] when the button is pressed.
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
    Log.d("LT", "Entered DetailScreen")
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
        // Tapping this pops the back stack, returning to the items list. (System
        // back does the same thing — see AppNavigation's onBack.)
        Button(onClick = onBack) {                          // pop back to the list
            Text("Back to list")
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
// To cover every combination without hand-writing one function per planet, the
// Items and Detail previews use @PreviewParameter: a PreviewParameterProvider
// supplies a SEQUENCE of values, and Android Studio renders the screen ONCE PER
// value. Because the providers read the same sampleCategories / sampleItems the
// app uses, the preview set updates automatically if you add data.
//
// Total renderings produced:
//   • Categories : 1  (there is only one possible list)
//   • Items      : 2  (one per Category — Rocky Planets, Gas Giants)
//   • Detail     : 6  (one per Item — every planet)
//   ───────────────────────────────────────────────────────────────
//   = 9 previews, i.e. every reachable screen state.
// ===========================================================================

// LEVEL 1 — there is only ONE categories-screen state (the full list), so a
// single preview covers it completely.
// widthDp/heightDp give each preview a small, fixed phone-shaped frame so the
// full-screen (fillMaxSize) layouts render as compact cards instead of each
// taking a whole device-height of space — letting several fit on screen at once.
//@Preview(name = "Categories", showBackground = true, widthDp = 320, heightDp = 480)
//@Composable
//fun CategoriesScreenPreview() {
//    NavThreeScreenTheme {
//        CategoriesScreen(categories = sampleCategories, onOpen = {})
//    }
//}
//
//// LEVEL 2 — one rendering per category, so BOTH item lists are previewed. The
//// `category` argument is injected by Android Studio from the provider.
//// One compact card per category (Rocky Planets, Gas Giants).
//@Preview(name = "Items", showBackground = true, widthDp = 320, heightDp = 480)
//@Composable
//fun ItemsScreenPreview(
//    @PreviewParameter(CategoryPreviewProvider::class) category: Category
//) {
//    NavThreeScreenTheme {
//        ItemsScreen(
//            category = category,
//            items = itemsInCategory(category.id),           // resolve this category's planets
//            onOpen = {},
//            onBack = {},
//        )
//    }
//}
//
//// LEVEL 3 — one rendering per item, so ALL six planet details are previewed.
//// One compact card per planet — all six details fit in a single row of cards.
//@Preview(name = "Detail", showBackground = true, widthDp = 320, heightDp = 480)
//@Composable
//fun DetailScreenPreview(
//    @PreviewParameter(ItemPreviewProvider::class) item: Item
//) {
//    NavThreeScreenTheme {
//        DetailScreen(item = item, onBack = {})
//    }
//}
