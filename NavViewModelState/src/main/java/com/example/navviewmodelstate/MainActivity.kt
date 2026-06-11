// =============================================================================
// MainActivity.kt
//
// A THREE-screen "drill-down" sample whose real lesson is STATE OWNERSHIP. It is
// built with:
//   • Jetpack Compose        — the declarative UI toolkit (no XML layouts).
//   • Navigation 3 (Nav3)    — the modern, Compose-first navigation library.
//   • Kotlinx Serialization  — used to mark navigation keys @Serializable.
//   • AndroidX Lifecycle     — ViewModel + collectAsStateWithLifecycle (the star).
//
// THE CONCEPT THIS PROJECT TEACHES
// -----------------------------------------------------------------------------
// Move screen STATE and LOGIC OUT of composables and into a ViewModel. The UI
// merely OBSERVES that state and SENDS EVENTS to the ViewModel. Because the
// ViewModel is scoped to the Activity (a ViewModelStoreOwner) rather than to the
// composition, the state it holds SURVIVES configuration changes (ROTATION) and
// survives navigating away from and back to a screen — something a plain
// `remember {}` cannot do. (See FavoritesViewModel.kt for the deep WHY.)
//
// We demonstrate this with a "favorite a planet" feature:
//
//   CategoriesScreen   --tap-->   ItemsScreen   --tap-->   DetailScreen
//   (Rocky / Gas)                 (planets,                (one planet +
//                                  ★ marks favorites)       ★/☆ favorite toggle)
//
// The Detail screen's ★/☆ button calls FavoritesViewModel.toggleFavorite(id).
// Favorite that planet, rotate the device, or navigate back to the list and
// return — the ★ persists, because the favorites set lives in the ViewModel, not
// in any composable. The Items list also shows a ★ next to favorited planets,
// proving every screen reads the SAME single source of truth.
//
// CONTRAST: the Detail screen also has a tiny `rememberSaveable` counter, with a
// comment spelling out remember vs. rememberSaveable vs. ViewModel.
//
// Reading order below: package + imports, then DATA, then NAV KEYS, then the
// Activity, then the navigation host, then each screen Composable, then previews.
// =============================================================================

// The package declaration. Every class/function below lives in this namespace,
// which also matches the directory structure under src/main/java/.
package com.example.navviewmodelstate

// --- Android framework imports ------------------------------------------------
import android.os.Bundle                                    // savedInstanceState type passed to onCreate
import androidx.activity.ComponentActivity                  // base Activity class with Compose support
import androidx.activity.compose.setContent                 // bridges an Activity to a Compose UI tree
import androidx.activity.enableEdgeToEdge                    // lets the app draw behind the system bars

// --- Compose layout / foundation imports -------------------------------------
import androidx.compose.foundation.clickable                // makes a row tappable
import androidx.compose.foundation.layout.Column            // stacks children vertically
import androidx.compose.foundation.layout.Row               // lays children out horizontally (title + ★)
import androidx.compose.foundation.layout.Spacer            // empty box used to add fixed gaps
import androidx.compose.foundation.layout.fillMaxSize       // modifier: take all available width AND height
import androidx.compose.foundation.layout.fillMaxWidth      // modifier: take all available width
import androidx.compose.foundation.layout.height            // modifier: force a specific height
import androidx.compose.foundation.layout.padding           // modifier: add space around content
import androidx.compose.foundation.layout.width             // modifier: force a specific width (gap in a Row)
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
import androidx.compose.runtime.getValue                    // enables `by` delegation when reading State
import androidx.compose.runtime.mutableStateOf              // creates an observable State holder
import androidx.compose.runtime.saveable.rememberSaveable   // remember that ALSO survives rotation/process death
import androidx.compose.runtime.setValue                    // enables `by` delegation when WRITING State
import androidx.compose.ui.Modifier                         // the "how to lay out / decorate" object
import androidx.compose.ui.tooling.preview.Preview          // enables @Preview rendering in Android Studio
import androidx.compose.ui.tooling.preview.PreviewParameter  // feeds a value into a preview parameter
import androidx.compose.ui.tooling.preview.PreviewParameterProvider // supplies the SET of preview values
import androidx.compose.ui.unit.dp                          // density-independent pixel unit (e.g. 16.dp)

// --- AndroidX Lifecycle (ViewModel) imports — THE CONCEPT --------------------
import androidx.lifecycle.compose.collectAsStateWithLifecycle // collects a StateFlow into Compose State, lifecycle-aware
import androidx.lifecycle.viewmodel.compose.viewModel        // obtains (or reuses) a ViewModel scoped to the owner

// --- Navigation 3 imports -----------------------------------------------------
// Navigation 3 is the modern, Compose-first navigation approach: a single
// Activity holds a back stack of "keys", and Compose swaps the screen whenever
// the top key changes. No Fragments, no Intents, no XML nav graph.
import androidx.navigation3.runtime.NavKey                  // marker interface every navigation key implements
import androidx.navigation3.runtime.entryProvider           // DSL that maps each key type to a screen
import androidx.navigation3.runtime.rememberNavBackStack    // creates + remembers the back stack across recomposition
import androidx.navigation3.ui.NavDisplay                   // the composable that renders the current top key

// --- App + misc imports -------------------------------------------------------
import com.example.navviewmodelstate.ui.theme.NavViewModelStateTheme // our app's Material theme wrapper (see Theme.kt)
import kotlinx.serialization.Serializable                   // makes Nav3 keys serializable (required by Nav3)
import android.util.Log                                     // Logcat logging (Log.d, Log.e, ...)
import android.util.Log.d

// ===========================================================================
// DATA
// A tiny in-memory data source. In a real app this would come from a database
// (Room), a network call (Retrofit), or a repository; here hardcoded lists are
// enough to demonstrate a drill-down plus ViewModel-owned favorite state.
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
//   • id         — stable unique identifier; also the favorite key in the ViewModel.
//   • categoryId — which Category this item belongs to (the "foreign key").
//   • title      — short name shown as the row/headline.
//   • blurb      — one-line description shown under the title.
data class Item(
    val id: Int,
    val categoryId: Int,
    val title: String,
    val blurb: String,
)

// Logcat tag string. Filter Logcat by "VMState" to see this app's breadcrumbs.
private const val TAG = "VMState"

// The two categories rendered on the first screen.
private val sampleCategories = listOf(
    Category(1, "Rocky Planets", "Small, dense worlds with solid surfaces."),
    Category(2, "Gas Giants", "Massive planets made mostly of gas."),
)

// The planets rendered on the second screen. Each one's `categoryId` ties it
// back to a Category above (1 = Rocky, 2 = Gas Giant). Each `id` doubles as the
// key the FavoritesViewModel uses to remember which planets are favorited.
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

/**
 * MainActivity — the app's single Activity and the entry point Android launches.
 *
 * In a Nav3 app you typically have exactly one Activity; it hosts the Compose UI
 * and the navigation back stack, and Compose (not the Activity system) swaps
 * between the screens. This Activity is ALSO the ViewModelStoreOwner that scopes
 * our FavoritesViewModel — which is exactly why the ViewModel (and the favorites
 * it holds) survives the Activity being recreated on rotation.
 */
class MainActivity : ComponentActivity() {
    // onCreate runs once when the Activity is first created. This is where we
    // install the Compose UI tree as the Activity's content.
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)                 // always call through to the framework first
        enableEdgeToEdge()                                 // draw under the status/navigation bars for a modern look
        setContent {                                       // everything inside is the Compose UI
            // Apply our app theme (colors, typography, dark/light handling).
            NavViewModelStateTheme {
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
 * AppNavigation — owns the navigation back stack, obtains the shared
 * [FavoritesViewModel], and maps each key to its screen.
 *
 * This is the heart of the Nav3 setup. It:
 *   1. Creates/remembers the back stack (starting at the categories screen).
 *   2. Obtains ONE FavoritesViewModel scoped to the Activity, so every screen
 *      shares the same favorites state.
 *   3. Renders the top of the stack via NavDisplay.
 *   4. Defines what "back" does and which composable each of the three keys shows.
 */
@Composable
fun AppNavigation(modifier: Modifier = Modifier) {
    // The back stack is the list of keys currently "stacked" on screen, bottom
    // to top. rememberNavBackStack seeds it with CategoriesKey and preserves it
    // across recompositions (and configuration changes). Pushing a key navigates
    // forward; popping a key navigates back.
    val backStack = rememberNavBackStack(CategoriesKey)

    // *** THE KEY LINE ***
    // viewModel() returns the FavoritesViewModel scoped to the nearest
    // ViewModelStoreOwner (here the Activity). Call it once and you get a NEW
    // instance the first time; call it again — even after a ROTATION recreates
    // the Activity — and the framework returns the SAME instance, with its
    // favorites set intact. That is why ViewModel state survives rotation while a
    // `remember {}` value would reset. Because we obtain it HERE (above the nav
    // entries) and pass it down, all three screens share one source of truth.
    val favoritesViewModel: FavoritesViewModel = viewModel()



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
            entry<ItemsKey> { key ->
                ItemsRoute(
                    category = categoryById(key.categoryId),
                    items = itemsInCategory(key.categoryId),
                    // Pass the SHARED ViewModel so the list can show a ★ next to
                    // any planet the user favorited on the detail screen.
                    favoritesViewModel = favoritesViewModel,
                    // Tapping a planet pushes a DetailKey carrying THAT item's id.
                    onOpen = { itemId -> backStack.add(DetailKey(itemId)) },
                    // The on-screen back button pops one level (back to categories).
                    onBack = { backStack.removeLastOrNull() }
                )
            }
            // LEVEL 3 — when a DetailKey is on top, show that one planet's detail.
            entry<DetailKey> { key ->
                DetailRoute(
                    item = itemById(key.itemId),
                    // The SAME shared ViewModel powers the ★/☆ favorite toggle.
                    favoritesViewModel = favoritesViewModel,
                    // The on-screen back button pops one level (back to the items list).
                    onBack = { backStack.removeLastOrNull() }
                )
            }
        }
    )
}

// ===========================================================================
// "ROUTE" composables (STATEFUL) vs. "SCREEN" composables (STATELESS)
//
// A common Compose pattern: a thin STATEFUL wrapper ("Route") talks to the
// ViewModel — collecting state and forwarding events — then delegates rendering
// to a STATELESS "Screen" that takes plain values + lambdas. The stateless screen
// knows nothing about ViewModels, which makes it trivial to @Preview and unit
// test. This is also why @Preview functions call the *Screen overloads, never the
// *Route ones (previews must not construct ViewModels — see the preview section).
// ===========================================================================

/**
 * ItemsRoute (LEVEL 2, STATEFUL) — bridges the [favoritesViewModel] to the
 * stateless [ItemsScreen]. It OBSERVES the favorites set and passes a plain
 * `Set<Int>` down so the list can mark favorited rows with a ★.
 */
@Composable
fun ItemsRoute(
    category: Category,
    items: List<Item>,
    favoritesViewModel: FavoritesViewModel,
    onOpen: (Int) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Log.d("LT", "Entered ItemsRoute")
    // collectAsStateWithLifecycle subscribes to the ViewModel's StateFlow and
    // turns its latest value into Compose State, so this composable recomposes
    // whenever favorites change. Unlike a plain collectAsState(), it PAUSES
    // collection when the UI drops below STARTED (e.g. app backgrounded) and
    // resumes on return — avoiding wasted work and updates to off-screen UI.
    // THREE ideas in one line —  val X by someStateFlow.collectAsStateWithLifecycle():
    //   1. someStateFlow                  — a StateFlow the ViewModel exposes (its live value).
    //   2. .collectAsStateWithLifecycle() — SUBSCRIBES to it and wraps the latest value in a
    //        Compose State, so this composable RECOMPOSES whenever the flow emits a new value.
    //        "WithLifecycle" = collect only while the screen is visible (lifecycle >= STARTED)
    //        and PAUSE off-screen; the Android-safe version of a plain collectAsState().
    //   3. `by`                           — a property delegate that unwraps the State's .value,
    //        so X reads as the plain value directly (no .value). Reading X also registers this
    //        composable as a reader, which is what makes Compose recompose it on the next emit.
    val favorites by favoritesViewModel.favorites.collectAsStateWithLifecycle()

    // Hand the stateless screen plain data + callbacks only.
    ItemsScreen(
        category = category,
        items = items,
        favoriteIds = favorites,
        onOpen = onOpen,
        onBack = onBack,
        modifier = modifier,
    )
}

/**
 * DetailRoute (LEVEL 3, STATEFUL) — bridges the [favoritesViewModel] to the
 * stateless [DetailScreen]. It OBSERVES whether THIS planet is favorited and
 * forwards the toggle EVENT up to the ViewModel (unidirectional data flow).
 */
@Composable
fun DetailRoute(
    item: Item,
    favoritesViewModel: FavoritesViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Log.d("LT", "Entered DetailRoute")
    // Observe the whole favorites set (lifecycle-aware), then derive the single
    // boolean this screen cares about: is THIS item's id in the set?
    val favorites by favoritesViewModel.favorites.collectAsStateWithLifecycle()
    val isFavorite = item.id in favorites

    DetailScreen(
        item = item,
        isFavorite = isFavorite,
        // EVENT flows UP: the button tap asks the ViewModel to flip the state.
        // The ViewModel updates its StateFlow, which re-emits, which recomposes
        // this Route (new `favorites`) — closing the unidirectional loop.
        onToggleFavorite = { favoritesViewModel.toggleFavorite(item.id) },
        onBack = onBack,
        modifier = modifier,
    )
}

/**
 * Categories screen (LEVEL 1, STATELESS): a scrolling list of categories; tapping
 * one calls [onOpen] with its id.
 *
 * This composable is intentionally "dumb" — it knows nothing about navigation or
 * ViewModels. It only renders the categories it's given and reports taps via
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
 * Items screen (LEVEL 2, STATELESS): a header naming the chosen [category] then a
 * scrolling list of its [items]. Each row whose id is in [favoriteIds] shows a ★,
 * proving the list reads the SAME ViewModel state the detail screen writes.
 *
 * This screen is stateless: it receives [favoriteIds] as a plain Set and never
 * touches a ViewModel, so it previews and tests without one.
 *
 * @param category    the category whose items are being shown (used for the header).
 * @param items       the items belonging to [category].
 * @param favoriteIds the ids currently favorited (drives the ★ indicator).
 * @param onOpen      invoked with an item's id when its row is tapped.
 * @param onBack      invoked when the user taps "Back to categories".
 * @param modifier    optional layout modifier supplied by the caller.
 */
@Composable
fun ItemsScreen(
    category: Category,
    items: List<Item>,
    favoriteIds: Set<Int>,
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
                // A Row so the title/blurb sit on the left and a ★ can sit at the
                // far right when this planet is favorited.
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onOpen(item.id) }      // whole row tappable -> open detail
                        .padding(16.dp)
                ) {
                    Column {
                        Text(text = item.title, style = MaterialTheme.typography.titleMedium)
                        Text(text = item.blurb, style = MaterialTheme.typography.bodyMedium)
                    }
                    // Favorite indicator: show a ★ only when the ViewModel-owned
                    // favorites set contains this item's id. Recomposes the instant
                    // the set changes, because favoriteIds is observed upstream.
                    if (item.id in favoriteIds) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = "★", style = MaterialTheme.typography.titleMedium)
                    }
                }
                HorizontalDivider()
            }
        }
    }
}

/**
 * Detail screen (LEVEL 3, STATELESS): shows the single [item] plus a ★/☆ toggle
 * button wired (by the caller) to the ViewModel, and a small contrast counter.
 *
 * Stateless by design: it receives [isFavorite] as a plain Boolean and reports
 * the toggle via [onToggleFavorite]. It never constructs a ViewModel, so it can
 * be previewed and tested with hand-supplied values.
 *
 * @param item             the fully-resolved item to display.
 * @param isFavorite       whether THIS item is currently favorited (from the VM).
 * @param onToggleFavorite invoked when the ★/☆ button is tapped (event flows UP).
 * @param onBack           invoked when the user taps "Back to list".
 * @param modifier         optional layout modifier supplied by the caller.
 */
@Composable
fun DetailScreen(
    item: Item,
    isFavorite: Boolean,
    onToggleFavorite: () -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // ----------------------------------------------------------------------
    // CONTRAST STATE: a local tap counter to compare against the ViewModel.
    //
    //   • If this were `remember { mutableStateOf(0) }` the count would reset on
    //     ROTATION (the composition is discarded when the Activity is recreated).
    //   • `rememberSaveable` (used here) writes the Int into the saved-instance
    //     Bundle, so it ALSO survives rotation AND process death — but it is
    //     confined to a single composable and only handles Bundle-able values.
    //   • The FAVORITE state, by contrast, lives in FavoritesViewModel and is
    //     SHARED across screens and survives rotation/navigation; for process
    //     death it would need a SavedStateHandle (noted in the ViewModel).
    //
    // So: remember = recomposition only; rememberSaveable = + rotation + process
    // death (but local & small); ViewModel = + rotation + navigation + shared &
    // holds logic (and + process death once backed by SavedStateHandle).
    // ----------------------------------------------------------------------
    Log.d("LT", "Entered DetailScreen")
    var count by rememberSaveable { mutableStateOf(0) }     // survives rotation; resets on a fresh launch

    // A single vertical column holding the title, body, the favorite toggle, the
    // contrast counter, and a back button, with 16dp padding around the screen.
    Column(modifier = modifier.fillMaxSize().padding(16.dp)) {
        // Large headline showing the item's title.
        Text(text = item.title, style = MaterialTheme.typography.headlineSmall)
        // Fixed 8dp gap between the headline and the body text.
        Spacer(modifier = Modifier.height(8.dp))
        // The item's longer description.
        Text(text = item.blurb, style = MaterialTheme.typography.bodyLarge)
        // Larger 24dp gap before the action buttons.
        Spacer(modifier = Modifier.height(24.dp))

        // THE FAVORITE TOGGLE — the concept made tappable. The label reflects the
        // observed [isFavorite] state; the tap sends an EVENT up via
        // [onToggleFavorite], which the Route forwards to the ViewModel. Favorite,
        // then rotate or navigate away and back: the ★ persists.
        Button(onClick = onToggleFavorite) {
            Text(if (isFavorite) "★ Unfavorite" else "☆ Favorite")
        }
        Spacer(modifier = Modifier.height(24.dp))

        // CONTRAST COUNTER — a rememberSaveable Int, to compare survival rules.
        Text(
            text = "Local taps (rememberSaveable): $count",
            style = MaterialTheme.typography.bodyMedium,
        )
        Spacer(modifier = Modifier.height(8.dp))
        Button(onClick = { count++ }) {                     // increments local-only state
            Text("Tap me (+1)")
        }
        Spacer(modifier = Modifier.height(24.dp))

        // Pop back to the items list. (System back does the same thing — see
        // AppNavigation's onBack.)
        Button(onClick = onBack) {                          // pop back to the list
            Text("Back to list")
        }
    }
}

// ===========================================================================
// @Preview functions — render screen states in the design pane.
//
// These let you see each screen directly in Android Studio's design pane WITHOUT
// running the app on a device or emulator. Each preview wraps the screen in the
// app theme and passes no-op callbacks ({}), since previews don't navigate.
//
// IMPORTANT: previews call the STATELESS *Screen composables and NEVER the
// *Route composables, and they NEVER call viewModel(). Why? viewModel() needs a
// real ViewModelStoreOwner from the running app; the preview environment has none,
// so constructing a ViewModel there would fail or behave oddly. Instead we feed
// the stateless screens plain values (e.g. isFavorite = true, a favoriteIds set)
// and no-op lambdas — which is exactly what the Route/Screen split is designed
// to enable.
//
// widthDp/heightDp give each preview a small, fixed phone-shaped frame so the
// full-screen (fillMaxSize) layouts render as compact cards.
// ===========================================================================

// LEVEL 1 — there is only ONE categories-screen state (the full list).
//@Preview(name = "Categories", showBackground = true, widthDp = 320, heightDp = 480)
//@Composable
//fun CategoriesScreenPreview() {
//    NavViewModelStateTheme {
//        CategoriesScreen(categories = sampleCategories, onOpen = {})
//    }
//}
//
//// Supplies every Category to the items-screen preview (Rocky Planets, Gas Giants).
//class CategoryPreviewProvider : PreviewParameterProvider<Category> {
//    override val values: Sequence<Category> = sampleCategories.asSequence()
//}
//
//// LEVEL 2 — one compact card per category. We hand a FIXED favoriteIds set (here
//// {1, 5}) so the preview shows the ★ indicator WITHOUT any ViewModel.
//@Preview(name = "Items", showBackground = true, widthDp = 320, heightDp = 480)
//@Composable
//fun ItemsScreenPreview(
//    @PreviewParameter(CategoryPreviewProvider::class) category: Category
//) {
//    NavViewModelStateTheme {
//        ItemsScreen(
//            category = category,
//            items = itemsInCategory(category.id),           // resolve this category's planets
//            favoriteIds = setOf(1, 5),                      // plain state — no viewModel() in previews
//            onOpen = {},
//            onBack = {},
//        )
//    }
//}
//
//// Supplies every Item to the detail-screen preview — one per planet.
//class ItemPreviewProvider : PreviewParameterProvider<Item> {
//    override val values: Sequence<Item> = sampleItems.asSequence()
//}
//
//// LEVEL 3 — one compact card per item, rendered as FAVORITED so the ★ label and
//// toggle button show. Again: plain isFavorite value, no ViewModel constructed.
//@Preview(name = "Detail (favorited)", showBackground = true, widthDp = 320, heightDp = 480)
//@Composable
//fun DetailScreenPreview(
//    @PreviewParameter(ItemPreviewProvider::class) item: Item
//) {
//    NavViewModelStateTheme {
//        DetailScreen(
//            item = item,
//            isFavorite = true,                              // hand-supplied state — no viewModel()
//            onToggleFavorite = {},
//            onBack = {},
//        )
//    }
//}
