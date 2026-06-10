// =============================================================================
// MainActivity.kt
//
// A minimal "list -> detail" sample app built with:
//   • Jetpack Compose        — the declarative UI toolkit (no XML layouts).
//   • Navigation 3 (Nav3)    — the modern, Compose-first navigation library.
//   • Kotlinx Serialization  — used to mark navigation keys @Serializable.
//
// The whole app lives in this one file on purpose: it is small enough to read
// top-to-bottom and is meant as a teaching example of how the pieces fit
// together. The flow is:
//
//   ListScreen (5 planets)  --tap a row-->  DetailScreen (that planet)
//                           <--Back button / system back--
//
// Reading order below: package + imports, then DATA, then NAVIGATION KEYS,
// then the Activity, then each Composable screen.
// =============================================================================

// The package declaration. Every class/function below lives in this namespace,
// which also matches the directory structure under src/main/java/.
package com.example.navlistdetail

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
import com.example.navlistdetail.ui.theme.NavListDetailTheme // our app's Material theme wrapper (see Theme.kt)
import kotlinx.serialization.Serializable                   // makes Nav3 keys serializable (required by Nav3)
import android.util.Log                                     // Logcat logging (Log.d, Log.e, ...)

// ===========================================================================
// DATA
// A tiny in-memory data source. In a real app this would come from a database
// (Room), a network call (Retrofit), or a repository; here a hardcoded list is
// enough to demonstrate the list -> detail navigation pattern.
// ===========================================================================

// A single list entry. `data class` automatically gives us equals()/hashCode()/
// toString()/copy() based on these three properties.
//   • id    — stable unique identifier; this is what travels in the nav key.
//   • title — short name shown as the row/headline.
//   • blurb — one-line description shown under the title.
data class Item(val id: Int, val title: String, val blurb: String)

// Logcat tag string. Every log line from this app can be filtered in Logcat by
// searching for "LT". (Note: defined but `tag` itself isn't referenced below —
// the Log.d calls pass the literal "LT" — so this is here for convenience.)
private val  tag = "LT"

// The hardcoded sample data the whole app renders. The ids (1..5) are what get
// passed around during navigation; the rest is display text.
private val sampleItems = listOf(
    Item(1, "Mercury", "The smallest planet and the closest to the Sun."),
    Item(2, "Venus", "The hottest planet, wrapped in thick clouds of acid."),
    Item(3, "Earth", "The only planet known to support life — so far."),
    Item(4, "Mars", "The red planet, a frequent target for rovers."),
    Item(5, "Jupiter", "The largest planet, a gas giant with a great red spot."),
)

// Look an item up by its id. The Detail screen receives only the id (inside its
// nav key) and resolves the full Item here. Passing just the id — rather than
// the whole object — keeps the navigation key tiny and serializable.
//
// `first { ... }` returns the first matching element and THROWS if none match.
// That's acceptable here because every DetailKey is created from a known id, so
// a match is guaranteed.
private fun itemById(id: Int): Item = sampleItems.first { it.id == id }

// ===========================================================================
// NAVIGATION KEYS
// Each screen is identified by a "key". A key both names the destination AND
// carries that destination's arguments. Nav3 requires keys to implement NavKey
// and (for state saving across process death) be @Serializable.
//   • ListKey   has no arguments — there is only one list screen.
//   • DetailKey carries the id of the tapped item — which detail to show.
// ===========================================================================

// `data object` = a singleton with a generated toString()/equals(). There is
// only ever one list screen, so a single shared object is the right model.
@Serializable
data object ListKey : NavKey                                // the list screen (no arguments)

// `data class` because each detail screen instance differs by which item it
// shows. `itemId` is the argument that distinguishes one DetailKey from another.
@Serializable
data class DetailKey(val itemId: Int) : NavKey             // the detail screen; itemId = which item was tapped

/**
 * MainActivity — the app's single Activity and the entry point Android launches.
 *
 * In a Nav3 app you typically have exactly one Activity; it hosts the Compose UI
 * and the navigation back stack, and Compose (not the Activity system) swaps
 * between the list and detail screens.
 */
class MainActivity : ComponentActivity() {
    // onCreate runs once when the Activity is first created. This is where we
    // install the Compose UI tree as the Activity's content.
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)                 // always call through to the framework first
        enableEdgeToEdge()                                 // draw under the status/navigation bars for a modern look
        setContent {                                       // everything inside is the Compose UI
            // Apply our app theme (colors, typography, dark/light handling).
            NavListDetailTheme {
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
 *   1. Creates/remembers the back stack (starting at the list screen).
 *   2. Renders the top of the stack via NavDisplay.
 *   3. Defines what "back" does and which composable each key shows.
 */
@Composable
fun AppNavigation(modifier: Modifier = Modifier) {
    // The back stack is the list of keys currently "stacked" on screen, bottom
    // to top. rememberNavBackStack seeds it with ListKey and preserves it across
    // recompositions (and configuration changes). Pushing a key navigates
    // forward; popping a key navigates back.
    val backStack = rememberNavBackStack(ListKey)

    // A debug breadcrumb visible in Logcat (filter by "LT") confirming this
    // composable was entered.
    Log.d("LT","Entered AppNavigation")

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
            // When ListKey is on top, show the list of all items.
            entry<ListKey> {
                ListScreen(
                    items = sampleItems,
                    // Tapping a row pushes a DetailKey carrying THAT item's id,
                    // which navigates forward to its detail screen.
                    onOpen = { id -> backStack.add(DetailKey(id)) }
                )
            }
            // When a DetailKey is on top, show that one item's detail screen.
            // The lambda receives the actual key instance, so we can read its arg.
            entry<DetailKey> { key ->
                // key.itemId is the argument carried by the key; resolve it to the
                // full Item object to display.
                DetailScreen(
                    item = itemById(key.itemId),
                    // The on-screen "Back to list" button also just pops the stack.
                    onBack = { backStack.removeLastOrNull() }
                )
            }
        }
    )
}

/**
 * List screen: a scrolling list of items; tapping one calls [onOpen] with its id.
 *
 * This composable is intentionally "dumb" — it knows nothing about navigation.
 * It only renders the items it's given and reports taps via the [onOpen]
 * callback. That keeps it reusable and easy to preview/test.
 *
 * @param items    the rows to render.
 * @param onOpen   invoked with an item's id when its row is tapped.
 * @param modifier optional layout modifier supplied by the caller.
 */
@Composable
fun ListScreen(
    items: List<Item>,
    onOpen: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    // LazyColumn is the Compose equivalent of a RecyclerView: it only composes
    // and lays out the rows currently visible on screen, so long lists stay fast.
    LazyColumn(modifier = modifier.fillMaxSize()) {
        // `items(items) { ... }` emits one block of UI per element in the list.
        items(items) { item ->                              // draw one row per item
            // Each row stacks its title and blurb vertically.
            Column(
                modifier = Modifier
                    .fillMaxWidth()                         // row spans the full width...
                    .clickable { onOpen(item.id) }          // ...and the WHOLE row is tappable -> navigate
                    .padding(16.dp)                         // breathing room inside the row
            ) {
                // Title: emphasized text style from the theme's type scale.
                Text(text = item.title, style = MaterialTheme.typography.titleMedium)
                // Blurb: smaller body text style beneath the title.
                Text(text = item.blurb, style = MaterialTheme.typography.bodyMedium)
            }
            // A thin line visually separating one row from the next.
            HorizontalDivider()                             // thin line between rows
        }
    }
}

/**
 * Detail screen: shows the single [item] resolved from the id in the nav key,
 * plus a Back button.
 *
 * Like ListScreen, this is navigation-agnostic: it just displays the item and
 * calls [onBack] when the button is pressed.
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
        // Tapping this pops the back stack, returning to the list. (System back
        // does the same thing — see AppNavigation's onBack.)
        Button(onClick = onBack) {                          // pop back to the list
            Text("Back to list")
        }
    }
}

// ---------------------------------------------------------------------------
// @Preview functions (currently disabled).
//
// Uncomment these to render ListScreen / DetailScreen directly in Android
// Studio's design pane WITHOUT running the app on a device or emulator. Each
// preview wraps the screen in the app theme and passes dummy data plus no-op
// callbacks ({}), since previews don't actually navigate.
// ---------------------------------------------------------------------------
//@Preview(showBackground = true)
//@Composable
//fun ListScreenPreview() {
//    NavListDetailTheme {
//        ListScreen(items = sampleItems, onOpen = {})
//    }
//}
//
//@Preview(showBackground = true)
//@Composable
//fun DetailScreenPreview() {
//    NavListDetailTheme {
//        DetailScreen(item = sampleItems.first(), onBack = {})
//    }
//}
