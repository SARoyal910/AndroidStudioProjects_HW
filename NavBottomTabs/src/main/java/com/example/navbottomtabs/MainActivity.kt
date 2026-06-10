// =============================================================================
// MainActivity.kt
//
// A BOTTOM-NAVIGATION sample app that teaches the classic "MULTIPLE BACK STACKS"
// problem, built with:
//   • Jetpack Compose        — the declarative UI toolkit (no XML layouts).
//   • Material 3             — Scaffold + NavigationBar / NavigationBarItem.
//   • Navigation 3 (Nav3)    — the modern, Compose-first navigation library.
//   • Kotlinx Serialization  — used to mark navigation keys @Serializable.
//
// ─────────────────────────────────────────────────────────────────────────────
// THE LESSON: "MULTIPLE BACK STACKS"
// ─────────────────────────────────────────────────────────────────────────────
// A bottom navigation bar shows several TOP-LEVEL tabs. The subtle, important
// requirement is that EACH TAB OWNS ITS OWN BACK STACK, and switching tabs must
// PRESERVE every tab's stack:
//
//   • Drill three levels deep inside the "Planets" tab.
//   • Tap over to "Search", drill into a planet there.
//   • Tap back to "Planets" — you must land EXACTLY where you left it (three
//     deep), NOT reset to the root, and NOT see Search's screen.
//
// A SINGLE GLOBAL back stack cannot do this: pushing Search's screens onto the
// same list that holds Planets' screens would interleave them, and "Back" from
// Search would walk DOWN INTO Planets' history instead of into Search's own.
//
// Navigation 3 has NO built-in multi-back-stack container, so we MODEL IT
// EXPLICITLY: one rememberNavBackStack PER TAB, all kept alive simultaneously,
// and we render a NavDisplay for ONLY the currently-selected tab's stack. The
// non-selected tabs' stacks sit idle in memory, fully intact, waiting to be
// shown again. THAT is the whole trick — and the comments below call it out.
//
//   Tabs (each an independent flow + back stack):
//     [Planets]  Categories ──► Items ──► Detail   (the base drill-down)
//     [Search]   PlanetSearch ──► Detail           (its OWN back stack)
//     [About]    a single static info screen
//
//   bottomBar = NavigationBar { NavigationBarItem per tab }
//   selectedTab : Int   (rememberSaveable — survives rotation/process death)
//   planetsBackStack / searchBackStack / aboutBackStack : ALL remembered at once
//   NavDisplay renders backStackFor(selectedTab) only.
//   System Back = pop the SELECTED tab's stack (never another tab's).
//
// Reading order below: package + imports, then DATA, then NAVIGATION KEYS (now
// grouped per-tab), then the Activity, then the tab scaffold, then each screen.
// =============================================================================

// The package declaration. Every class/function below lives in this namespace,
// which also matches the directory structure under src/main/java/.
package com.example.navbottomtabs

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
import androidx.compose.material3.NavigationBar             // the bottom bar container (holds the tab items)
import androidx.compose.material3.NavigationBarItem         // a single tab button inside the NavigationBar
import androidx.compose.material3.Scaffold                  // standard screen frame (handles insets, bars, etc.)
import androidx.compose.material3.Text                      // draws text

// --- Compose runtime / tooling imports ---------------------------------------
import androidx.compose.runtime.Composable                  // marks a function as emitting UI
import androidx.compose.runtime.getValue                    // property-delegate read for State<T> (the `by` getter)
import androidx.compose.runtime.mutableIntStateOf           // creates an observable Int state (selected tab index)
import androidx.compose.runtime.saveable.rememberSaveable   // remembers state ACROSS rotation / process death
import androidx.compose.runtime.setValue                    // property-delegate write for MutableState<T> (the `by` setter)
import androidx.compose.ui.Modifier                         // the "how to lay out / decorate" object
import androidx.compose.ui.text.style.TextAlign             // horizontal text alignment (centering the About copy)
import androidx.compose.ui.tooling.preview.Preview          // enables @Preview rendering in Android Studio
import androidx.compose.ui.unit.dp                          // density-independent pixel unit (e.g. 16.dp)
import androidx.compose.ui.unit.sp                          // scalable-pixel unit for the emoji "icon" font size

// --- Navigation 3 imports -----------------------------------------------------
// Navigation 3 is the modern, Compose-first navigation approach: a back stack of
// "keys", and Compose swaps the screen whenever the top key changes. Here we
// keep SEVERAL back stacks (one per tab) and display ONE at a time.
import androidx.navigation3.runtime.NavBackStack            // the type returned by rememberNavBackStack (one per tab)
import androidx.navigation3.runtime.NavKey                  // marker interface every navigation key implements
import androidx.navigation3.runtime.entryProvider           // DSL that maps each key type to a screen
import androidx.navigation3.runtime.rememberNavBackStack    // creates + remembers a back stack across recomposition
import androidx.navigation3.ui.NavDisplay                   // the composable that renders the current top key

// --- App + misc imports -------------------------------------------------------
import com.example.navbottomtabs.ui.theme.NavBottomTabsTheme // our app's Material theme wrapper (see Theme.kt)
import kotlinx.serialization.Serializable                   // makes Nav3 keys serializable (required by Nav3)
import android.util.Log                                     // Logcat logging (Log.d, Log.e, ...)

// ===========================================================================
// DATA
// A tiny in-memory data source (same domain as the sibling samples). In a real
// app this would come from Room / Retrofit / a repository; hardcoded lists are
// enough to demonstrate per-tab drill-downs.
//
// The model is two levels deep:
//   Category 1─┐
//              ├── many Items   (each Item belongs to exactly one Category)
//   Category 2─┘
// ===========================================================================

// A top-level grouping shown on the Planets tab's FIRST screen.
//   • id   — stable unique identifier; this is what travels in the nav key.
//   • name — short label shown as the category row.
//   • description — one-line summary shown under the name.
data class Category(val id: Int, val name: String, val description: String)

// A single planet, shown across the Planets drill-down, the Search list, and the
// shared Detail screen.
//   • id         — stable unique identifier; travels in the detail nav keys.
//   • categoryId — which Category this item belongs to (the "foreign key").
//   • title      — short name shown as the row/headline.
//   • blurb      — one-line description shown under the title.
//   • fact       — a longer "fun fact" shown on the Detail screen.
data class Item(
    val id: Int,
    val categoryId: Int,
    val title: String,
    val blurb: String,
    val fact: String,
)

// Logcat tag string. Every log line from this app can be filtered in Logcat by
// searching for "Tabs".
private const val TAG = "Tabs"

// The two categories rendered on the Planets tab's first screen.
private val sampleCategories = listOf(
    Category(1, "Rocky Planets", "Small, dense worlds with solid surfaces."),
    Category(2, "Gas Giants", "Massive planets made mostly of gas."),
)

// The planets. Each one's `categoryId` ties it back to a Category above
// (1 = Rocky, 2 = Gas Giant); `fact` powers the Detail screen.
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
// here because every CategoriesKey/ItemsKey is built from a known category id.
private fun categoryById(id: Int): Category = sampleCategories.first { it.id == id }

// Resolve a single Item by its id (used by the shared Detail screen).
private fun itemById(id: Int): Item = sampleItems.first { it.id == id }

// All items belonging to one category (used by the Planets tab's list screen).
private fun itemsInCategory(categoryId: Int): List<Item> =
    sampleItems.filter { it.categoryId == categoryId }

// ===========================================================================
// NAVIGATION KEYS  — grouped BY TAB
//
// Each screen is identified by a "key". A key both names the destination AND
// carries that destination's arguments. Nav3 requires keys to implement NavKey
// and (for state saving across process death) be @Serializable.
//
// IMPORTANT: keys are just *identifiers*. The same DetailKey is reused by BOTH
// the Planets tab and the Search tab — what makes them independent is not the
// key TYPE but WHICH BACK STACK the key is pushed onto. Two different stacks can
// each hold their own DetailKey at the same time, on different planets.
// ===========================================================================

// --- Planets tab keys -------------------------------------------------------
// `data object` = a singleton; there is only one categories screen.
@Serializable
data object CategoriesKey : NavKey                          // Planets root: the list of categories

// `data class` because each items screen differs by which category it lists.
@Serializable
data class ItemsKey(val categoryId: Int) : NavKey          // Planets level 2: a category's planets

// --- Search tab keys --------------------------------------------------------
// `data object` = a singleton; there is only one search screen.
@Serializable
data object SearchKey : NavKey                              // Search root: a flat list of ALL planets

// --- About tab keys ---------------------------------------------------------
// `data object` = a singleton; the About tab is a single static screen.
@Serializable
data object AboutKey : NavKey                               // About root: static info, no drill-down

// --- Shared leaf key (used by BOTH Planets and Search) ----------------------
// `data class` because each detail screen differs by which item it shows. This
// SAME type is pushed onto whichever tab's stack the user drilled from.
@Serializable
data class DetailKey(val itemId: Int) : NavKey             // a single planet's detail (shared leaf)

// ===========================================================================
// TABS — the model of the bottom navigation bar itself.
//
// A tiny enum-like list pairing each tab with its emoji "icon" and label. We
// deliberately use an EMOJI rendered via Text() instead of Icons.Default.* :
// the material-icons artifact that backs Icons.Default isn't on this project's
// classpath (only its POM metadata is cached, not the AAR), so pulling it in
// could drag a BOM-mismatched version and risk a red build. An emoji label is a
// zero-dependency fallback that keeps the build GREEN while still giving each
// tab a distinct glyph. (Swap to Icons.Default.* later if you add the dep.)
// ===========================================================================

// One entry per bottom-bar tab. `index` is the value stored in `selectedTab`.
private data class TabSpec(val index: Int, val emoji: String, val label: String)

// The three top-level tabs, in bar order. Index 0 is the start tab (Planets).
private val TABS = listOf(
    TabSpec(0, "🪐", "Planets"),                  // 🪐 ringed planet
    TabSpec(1, "🔍", "Search"),                   // 🔍 magnifying glass
    TabSpec(2, "ℹ️", "About"),                    // ℹ️ information source
)

/**
 * MainActivity — the app's single Activity and the entry point Android launches.
 *
 * In a Nav3 app you typically have exactly one Activity; it hosts the Compose UI
 * and (here) the THREE per-tab navigation back stacks. Compose swaps screens.
 */
class MainActivity : ComponentActivity() {
    // onCreate runs once when the Activity is first created. This is where we
    // install the Compose UI tree as the Activity's content.
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)                 // always call through to the framework first
        enableEdgeToEdge()                                 // draw under the status/navigation bars for a modern look
        setContent {                                       // everything inside is the Compose UI
            // Apply our app theme (colors, typography, dark/light handling).
            NavBottomTabsTheme {
                // The whole app is the bottom-tab scaffold (see below). It owns
                // the NavigationBar AND the per-tab back stacks.
                BottomTabsApp()
            }
        }
    }
}

/**
 * BottomTabsApp — the heart of the MULTIPLE-BACK-STACKS lesson.
 *
 * Responsibilities:
 *   1. Hold ONE back stack PER TAB, all remembered SIMULTANEOUSLY, so the tabs
 *      the user isn't looking at keep their drill-down state intact.
 *   2. Track which tab is selected (rememberSaveable, so it survives rotation).
 *   3. Render a Material3 Scaffold whose bottomBar is a NavigationBar of tabs.
 *   4. Render a NavDisplay for ONLY the selected tab's back stack, with System
 *      Back wired to pop THAT tab's stack (and no other).
 *
 * @param modifier optional layout modifier supplied by the caller.
 */
@Composable
fun BottomTabsApp(modifier: Modifier = Modifier) {

    // ───────────────────────────────────────────────────────────────────────
    // (1) ONE BACK STACK PER TAB — the crux of the whole sample.
    //
    // We call rememberNavBackStack THREE times, once per tab. Because all three
    // are remembered in the SAME composition (and never torn down), ALL THREE
    // survive every tab switch. When the user is on Search, the Planets stack is
    // still sitting here in memory — possibly three keys deep — completely
    // untouched. Returning to Planets simply starts displaying that same stack
    // again, exactly where they left it.
    //
    // Contrast with a SINGLE GLOBAL stack: you'd have only one list, so Search's
    // screens would pile on top of Planets' screens. Switching tabs couldn't
    // "preserve" anything because there'd be nothing separate to preserve, and
    // Back would cross tab boundaries. Separate stacks = separate histories.
    // ───────────────────────────────────────────────────────────────────────
    val planetsBackStack = rememberNavBackStack(CategoriesKey) // Planets tab's OWN stack, root = categories
    val searchBackStack  = rememberNavBackStack(SearchKey)     // Search tab's OWN stack, root = search list
    val aboutBackStack   = rememberNavBackStack(AboutKey)      // About tab's OWN stack, root = info screen

    // ───────────────────────────────────────────────────────────────────────
    // (2) WHICH TAB IS SELECTED.
    //
    // rememberSaveable (not plain remember) so the chosen tab survives rotation
    // and process death. This Int is the ONLY thing that decides which of the
    // three back stacks above gets displayed — flipping it "swaps" the visible
    // stack WITHOUT disturbing any of them.
    // ───────────────────────────────────────────────────────────────────────
    var selectedTab by rememberSaveable { mutableIntStateOf(0) } // 0 = Planets (the start tab)

    // Helper: map the selected-tab index to THAT tab's back stack. This single
    // lookup is what "swaps which back stack is displayed" when a tab is tapped.
    // The two NON-selected stacks are simply not referenced this frame — they
    // remain alive and unchanged in memory.
    val activeBackStack: NavBackStack<NavKey> = when (selectedTab) {
        0 -> planetsBackStack                              // show Planets' history
        1 -> searchBackStack                               // show Search's history
        else -> aboutBackStack                             // show About's (trivial) history
    }

    // A debug breadcrumb (filter Logcat by "Tabs") showing the swap each frame:
    // which tab is active and how deep EACH stack currently is. Watch these
    // depths stay put as you switch tabs — that's the preservation in action.
    Log.d(
        TAG,
        "tab=$selectedTab  depths → planets=${planetsBackStack.size} " +
            "search=${searchBackStack.size} about=${aboutBackStack.size}"
    )

    // ───────────────────────────────────────────────────────────────────────
    // (3) THE SCAFFOLD + BOTTOM NAVIGATION BAR.
    // ───────────────────────────────────────────────────────────────────────
    Scaffold(
        modifier = modifier.fillMaxSize(),
        bottomBar = {
            // NavigationBar is the Material3 bottom bar container. Inside it we
            // emit one NavigationBarItem per tab.
            NavigationBar {
                TABS.forEach { tab ->
                    NavigationBarItem(
                        // Highlight the item matching the current selection.
                        selected = selectedTab == tab.index,
                        // TAPPING A TAB = the "tab switch". We ONLY change the
                        // selected index. We do NOT reset, clear, or rebuild any
                        // back stack — that's precisely why each tab's history is
                        // preserved. The displayed NavDisplay below will simply
                        // re-point at this tab's (still-intact) stack.
                        onClick = { selectedTab = tab.index },
                        // Emoji-as-icon fallback (see TABS comment): a Text glyph
                        // instead of Icons.Default.* to keep the build dependency-
                        // free and green.
                        icon = { Text(text = tab.emoji, fontSize = 20.sp) },
                        // The tab's text label beneath the glyph.
                        label = { Text(text = tab.label) },
                    )
                }
            }
        }
    ) { innerPadding ->
        // ───────────────────────────────────────────────────────────────────
        // (4) DISPLAY ONLY THE SELECTED TAB'S BACK STACK.
        //
        // A SINGLE NavDisplay renders `activeBackStack` (the one chosen by
        // selectedTab). When the user taps a different tab, `activeBackStack`
        // re-resolves to that tab's stack and NavDisplay swaps to it — instantly
        // showing wherever that tab was last left. The entryProvider below lists
        // EVERY key type any tab might show; Nav3 picks the matching screen for
        // whatever key is on top of the currently-displayed stack.
        //
        // onBack pops the SELECTED tab's stack only, so System Back walks back
        // THROUGH THE CURRENT TAB'S history and never leaks into another tab.
        // ───────────────────────────────────────────────────────────────────
        NavDisplay(
            backStack = activeBackStack,                   // <-- the per-tab stack, swapped by selectedTab
            modifier = Modifier.padding(innerPadding),     // keep content clear of the bottom bar + system bars
            onBack = { activeBackStack.removeLastOrNull() }, // back = pop THIS tab's top key (never another tab's)
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

                // ===== PLANETS TAB ENTRIES =====
                // Root: the categories list. Pushes ItemsKey onto the PLANETS
                // stack (we're displaying it, so `add` targets it explicitly).
                entry<CategoriesKey> {
                    CategoriesScreen(
                        categories = sampleCategories,
                        // Drill forward within the Planets stack.
                        onOpen = { categoryId -> planetsBackStack.add(ItemsKey(categoryId)) }
                    )
                }
                // Level 2: a category's planets. Drilling pushes DetailKey onto
                // the PLANETS stack specifically.
                entry<ItemsKey> { key ->
                    ItemsScreen(
                        category = categoryById(key.categoryId),
                        items = itemsInCategory(key.categoryId),
                        // Push the shared Detail leaf onto the PLANETS stack.
                        onOpen = { itemId -> planetsBackStack.add(DetailKey(itemId)) },
                        // On-screen back pops the PLANETS stack one level.
                        onBack = { planetsBackStack.removeLastOrNull() }
                    )
                }

                // ===== SEARCH TAB ENTRIES =====
                // Root: a flat list of EVERY planet. Note the DetailKey here is
                // pushed onto the SEARCH stack — the same key TYPE as Planets
                // uses, but a DIFFERENT stack, so the two histories never mix.
                entry<SearchKey> {
                    PlanetSearchScreen(
                        items = sampleItems,
                        // Push the shared Detail leaf onto the SEARCH stack.
                        onOpen = { itemId -> searchBackStack.add(DetailKey(itemId)) }
                    )
                }

                // ===== ABOUT TAB ENTRY =====
                // A single static screen — its stack never grows past the root.
                entry<AboutKey> {
                    AboutScreen()
                }

                // ===== SHARED LEAF (Planets AND Search both reach it) =====
                // ONE entry<DetailKey> serves both tabs. Which stack it belongs
                // to is decided at PUSH time (above), not here. Back is wired to
                // whichever stack is currently displayed (`activeBackStack`), so
                // it always pops the correct tab's history.
                entry<DetailKey> { key ->
                    DetailScreen(
                        item = itemById(key.itemId),
                        // Pop the CURRENTLY-DISPLAYED tab's stack one level.
                        onBack = { activeBackStack.removeLastOrNull() }
                    )
                }
            }
        )
    }
}

/**
 * Categories screen (PLANETS tab, root): a scrolling list of categories; tapping
 * one calls [onOpen] with its id.
 *
 * This composable is intentionally "dumb" — it knows nothing about navigation or
 * tabs. It only renders the categories it's given and reports taps via [onOpen].
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
 * Items screen (PLANETS tab, level 2): a header naming the chosen [category]
 * followed by a scrolling list of its [items]. Tapping an item calls [onOpen];
 * the button at the top calls [onBack].
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
 * Planet search screen (SEARCH tab, root): a single flat, scrolling list of ALL
 * planets (no categories). Tapping one calls [onOpen], which — crucially — pushes
 * onto the SEARCH back stack, giving this tab its OWN Detail history independent
 * of the Planets tab's.
 *
 * @param items   every planet, shown flat (un-grouped) for quick scanning.
 * @param onOpen  invoked with an item's id when its row is tapped.
 * @param modifier optional layout modifier supplied by the caller.
 */
@Composable
fun PlanetSearchScreen(
    items: List<Item>,
    onOpen: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier.fillMaxSize()) {
        // --- Header block (does not scroll) ---
        Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
            // A simple title; a real search tab would host a text field here.
            Text(text = "Search planets", style = MaterialTheme.typography.headlineSmall)
            Spacer(modifier = Modifier.height(4.dp))
            // A hint reminding the reader this tab keeps its OWN back stack.
            Text(
                text = "All ${items.size} planets — tap one to view details. " +
                    "This tab remembers your place independently of Planets.",
                style = MaterialTheme.typography.bodyMedium,
            )
        }
        HorizontalDivider()                                 // separates header from the list

        // --- The flat list of every planet (scrolls) ---
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            items(items) { item ->                          // draw one row per planet
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onOpen(item.id) }      // whole row tappable -> open detail (on SEARCH stack)
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
 * Detail screen (SHARED leaf, reached from BOTH Planets and Search): shows the
 * single [item] resolved from the id in the nav key, plus a back button.
 *
 * The same composable serves both tabs; it has no idea which stack it sits on.
 * [onBack] is wired by the caller to pop whichever tab's stack is displayed.
 *
 * @param item     the fully-resolved item to display.
 * @param onBack   invoked when the user taps "Back" (pops the current tab's stack).
 * @param modifier optional layout modifier supplied by the caller.
 */
@Composable
fun DetailScreen(
    item: Item,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // A single vertical column holding the title, body, fun fact, and a button,
    // with 16dp of padding around the whole screen.
    Column(modifier = modifier.fillMaxSize().padding(16.dp)) {
        // Large headline showing the item's title.
        Text(text = item.title, style = MaterialTheme.typography.headlineSmall)
        // Fixed 8dp gap between the headline and the body text.
        Spacer(modifier = Modifier.height(8.dp))
        // The item's longer description.
        Text(text = item.blurb, style = MaterialTheme.typography.bodyLarge)
        // A gap before the fun fact.
        Spacer(modifier = Modifier.height(16.dp))
        // The fun fact for this planet (shown inline on the detail screen).
        Text(text = item.fact, style = MaterialTheme.typography.bodyMedium)
        // Larger 24dp gap before the action button.
        Spacer(modifier = Modifier.height(24.dp))
        // Pop back to the previous screen IN THE CURRENT TAB. (System back does
        // the same thing — see BottomTabsApp's onBack.)
        Button(onClick = onBack) {                          // pop the current tab's stack
            Text("Back")
        }
    }
}

/**
 * About screen (ABOUT tab, the single static screen): a centered blurb that
 * doubles as the lesson summary. This tab never drills anywhere, so its back
 * stack stays one key deep for the whole app lifetime.
 *
 * @param modifier optional layout modifier supplied by the caller.
 */
@Composable
fun AboutScreen(modifier: Modifier = Modifier) {
    // A centered column of explanatory text — no list, no navigation.
    Column(
        modifier = modifier.fillMaxSize().padding(24.dp),
    ) {
        Text(
            text = "About this sample",
            style = MaterialTheme.typography.headlineSmall,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "Three bottom tabs, three independent back stacks. Drill into " +
                "Planets, switch to Search and drill there too, then come back — " +
                "each tab remembers exactly where you left it. That is the " +
                "\"multiple back stacks\" pattern, modeled explicitly in Nav3.",
            style = MaterialTheme.typography.bodyLarge,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

// ===========================================================================
// @Preview functions — render representative screens in the design pane.
//
// These let you see screens directly in Android Studio's design pane WITHOUT
// running the app. Each preview wraps the screen in the app theme and passes
// no-op callbacks ({}), since previews don't navigate.
//
// widthDp/heightDp give each preview a small, fixed phone-shaped frame so the
// full-screen (fillMaxSize) layouts render as compact cards.
//
// We preview:
//   • the ABOUT screen (a simple static destination), and
//   • the full SCAFFOLD WITH THE BOTTOM BAR (so the NavigationBar renders).
// ===========================================================================

// The static About destination.
@Preview(name = "About", showBackground = true, widthDp = 320, heightDp = 480)
@Composable
fun AboutScreenPreview() {
    NavBottomTabsTheme {
        AboutScreen()
    }
}

// The whole app frame: Scaffold + NavigationBar + the start tab's content. This
// confirms the bottom bar (with its three emoji tabs) renders correctly.
@Preview(name = "Scaffold + Bottom Bar", showBackground = true, widthDp = 320, heightDp = 480)
@Composable
fun BottomTabsAppPreview() {
    NavBottomTabsTheme {
        BottomTabsApp()
    }
}
