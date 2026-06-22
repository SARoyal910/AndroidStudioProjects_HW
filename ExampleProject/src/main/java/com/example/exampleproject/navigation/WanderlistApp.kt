// =============================================================================
// navigation/WanderlistApp.kt  —  the NAVIGATION HOST (the heart of the app)
//
// This is the one composable that owns ALL app state and ALL navigation. Every
// screen (in ui/screens) is "dumb" — it takes data + callbacks and knows nothing
// about the back stack. Centralizing navigation + state here is what lets the
// screens stay small, reusable, and previewable.
//
// Responsibilities:
//   1. Hold the app's DATA (the list of places) hoisted in one place, plus the
//      selected-tab index — so every screen below can stay stateless.
//   2. Keep ONE back stack PER TAB (the multiple-back-stacks pattern), so each
//      tab remembers exactly where the user left it.
//   3. Render a Scaffold: a TopAppBar (title + Back arrow driven BY the back
//      stack), a bottom NavigationBar, a FloatingActionButton, and a SnackbarHost.
//   4. Map every key to its screen with NavDisplay's entryProvider, and route all
//      add / toggle / delete edits — and save/load to storage — back through here.
// =============================================================================
package com.example.exampleproject.navigation

import android.util.Log                                     // Logcat logging (Log.d, Log.e, ...)
import androidx.compose.foundation.layout.fillMaxSize       // modifier: take all available width AND height
import androidx.compose.foundation.layout.padding           // modifier: add space around content
import androidx.compose.material3.ExperimentalMaterial3Api  // opt-in marker required by TopAppBar
import androidx.compose.material3.FloatingActionButton      // the round floating "+" action button
import androidx.compose.material3.IconButton                // a tappable, icon-sized button (our Back arrow)
import androidx.compose.material3.MaterialTheme             // access to the current theme's colors/typography
import androidx.compose.material3.NavigationBar             // the bottom bar container (holds the tab items)
import androidx.compose.material3.NavigationBarItem         // a single tab button inside the NavigationBar
import androidx.compose.material3.Scaffold                  // standard screen frame (top bar, bottom bar, FAB, insets)
import androidx.compose.material3.SnackbarHost              // the host that shows transient Snackbar messages
import androidx.compose.material3.SnackbarHostState         // the state object you call showSnackbar() on
import androidx.compose.material3.Text                      // draws text
import androidx.compose.material3.TopAppBar                 // the top header bar (title + optional Back arrow)
import androidx.compose.runtime.Composable                  // marks a function as emitting UI
import androidx.compose.runtime.LaunchedEffect              // runs a suspend block once when the composable enters
import androidx.compose.runtime.getValue                    // property-delegate read for State<T> (the `by` getter)
import androidx.compose.runtime.mutableIntStateOf           // observable Int state (the selected tab index)
import androidx.compose.runtime.mutableStateOf              // observable state holder (the "syncing" flag)
import androidx.compose.runtime.remember                    // keeps a value across recompositions (NOT process death)
import androidx.compose.runtime.rememberCoroutineScope      // a scope tied to this composable, to launch suspend work
import androidx.compose.runtime.saveable.rememberSaveable   // remembers state ACROSS rotation / process death
import androidx.compose.runtime.setValue                    // property-delegate write for MutableState<T> (the `by` setter)
import androidx.compose.runtime.toMutableStateList          // copies a List into an observable SnapshotStateList
import androidx.compose.ui.Modifier                         // the "how to lay out / decorate" object
import androidx.compose.ui.platform.LocalContext            // the Android Context (needed to open local storage)
import androidx.compose.ui.tooling.preview.Preview          // enables @Preview rendering in Android Studio
import androidx.compose.ui.unit.sp                          // scalable-pixel unit (used for emoji glyph sizes)
import androidx.navigation3.runtime.NavBackStack            // the type returned by rememberNavBackStack (one per tab)
import androidx.navigation3.runtime.NavKey                  // marker interface every navigation key implements
import androidx.navigation3.runtime.entryProvider           // DSL that maps each key type to a screen
import androidx.navigation3.runtime.rememberNavBackStack    // creates + remembers a back stack across recomposition
import androidx.navigation3.ui.NavDisplay                   // the composable that renders the current top key
import com.example.exampleproject.data.CONTINENTS           // the continent options for the Add form
import com.example.exampleproject.data.Destination          // the data model (built in addDestination)
import com.example.exampleproject.data.initialDestinations  // the starter list that seeds the app state
import com.example.exampleproject.data.storage.CloudDestinationStore // simulated cloud storage
import com.example.exampleproject.data.storage.LocalDestinationStore // on-device storage
import com.example.exampleproject.ui.screens.AddDestinationScreen
import com.example.exampleproject.ui.screens.DetailScreen
import com.example.exampleproject.ui.screens.ExploreScreen
import com.example.exampleproject.ui.screens.FlashcardScreen
import com.example.exampleproject.ui.screens.GuessScreen
import com.example.exampleproject.ui.screens.PlayMenuScreen
import com.example.exampleproject.ui.screens.StatsScreen
import com.example.exampleproject.ui.theme.ExampleProjectTheme // wraps the @Preview below
import kotlinx.coroutines.launch                            // launches suspend work (snackbars, storage)

// Logcat tag string. Every log line from this app can be filtered in Logcat by
// searching for "Wander".
private const val TAG = "Wander"

// ===========================================================================
// TABS — the model of the bottom navigation bar itself.
//
// A tiny list pairing each tab with its emoji "icon" and label. We deliberately
// use an EMOJI rendered via Text() instead of Icons.Default.* : the material-icons
// artifact isn't on this project's classpath, so an emoji glyph is a zero-
// dependency way to give each tab a distinct icon and keep the build green.
// ===========================================================================

// One entry per bottom-bar tab. `index` is the value stored in `selectedTab`.
private data class TabSpec(val index: Int, val emoji: String, val label: String)

// The four top-level tabs, in bar order. Index 0 is the start tab (Explore).
private val TABS = listOf(
    TabSpec(0, "🧭", "Explore"),                            // 🧭 compass — browse the list
    TabSpec(1, "🎮", "Play"),                               // 🎮 games — flashcards + guess
    TabSpec(2, "➕", "Add"),                                 // ➕ plus — add a new place
    TabSpec(3, "📊", "Stats"),                               // 📊 chart — totals + settings + storage
)

/**
 * WanderlistApp — owns all app state and all navigation; the single source of
 * truth every screen reads from.
 *
 * @param darkTheme         the current theme flag (passed down only so the Stats
 *                          switch can show the right on/off position).
 * @param onToggleDarkTheme flips the app-wide theme (defined up in MainActivity).
 * @param modifier          optional layout modifier supplied by the caller.
 */
@OptIn(ExperimentalMaterial3Api::class)                    // TopAppBar is still an experimental Material 3 API
@Composable
fun WanderlistApp(
    darkTheme: Boolean,
    onToggleDarkTheme: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // ───────────────────────────────────────────────────────────────────────
    // (1) APP STATE — hoisted here, the single source of truth.
    //
    // `destinations` is an OBSERVABLE list (SnapshotStateList): when we add,
    // remove, or replace an element, every screen reading it recomposes.
    //
    // It's seeded with the starter list, but that's just the FIRST-FRAME value: a
    // LaunchedEffect below replaces it with whatever was saved on the device. Every
    // edit then auto-saves (see persistLocal()), so the list survives both rotation
    // AND a full app restart — the saved copy is reloaded each time the app starts.
    // (selectedTab uses rememberSaveable; the list relies on disk reload instead,
    //  which avoids serializing the whole list into the rotation bundle.)
    // ───────────────────────────────────────────────────────────────────────
    val destinations = remember { initialDestinations.toMutableStateList() }

    // Which bottom tab is selected. rememberSaveable so it survives rotation.
    var selectedTab by rememberSaveable { mutableIntStateOf(0) } // 0 = Explore (the start tab)

    // ───────────────────────────────────────────────────────────────────────
    // (2) ONE BACK STACK PER TAB. Both Explore and Play can drill one level deep
    // ([root, leaf]); Add and Stats stay at their root. All four are remembered
    // at once, so every tab keeps its own history across tab switches.
    // ───────────────────────────────────────────────────────────────────────
    val exploreBackStack = rememberNavBackStack(ExploreKey)  // Explore: list -> detail
    val playBackStack    = rememberNavBackStack(PlayKey)     // Play: menu -> a game
    val addBackStack     = rememberNavBackStack(AddKey)      // Add: just the form
    val statsBackStack   = rememberNavBackStack(StatsKey)    // Stats: just the stats screen

    // Map the selected-tab index to THAT tab's back stack.
    val activeBackStack: NavBackStack<NavKey> = when (selectedTab) {
        0 -> exploreBackStack
        1 -> playBackStack
        2 -> addBackStack
        else -> statsBackStack
    }

    // The key currently ON TOP of the displayed stack — drives the TopAppBar
    // title, the Back arrow, and the FAB. lastOrNull() is null-safe.
    val topKey = activeBackStack.lastOrNull()

    // Snackbar plumbing + a coroutine scope to launch suspend work (snackbars and
    // the storage calls below).
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    // ───────────────────────────────────────────────────────────────────────
    // ON-DEVICE PERSISTENCE — the list is saved here so it outlives the app.
    //
    // Two implementations behind one DestinationStore interface: local (this
    // device, SharedPreferences + JSON) and cloud (simulated, with fake latency).
    // localStore/cloudStore are remembered so there's exactly one of each; `syncing`
    // drives the cloud spinner while a fake network request is in flight.
    // ───────────────────────────────────────────────────────────────────────
    val context = LocalContext.current
    val localStore = remember { LocalDestinationStore(context) }
    val cloudStore = remember { CloudDestinationStore() }
    var syncing by remember { mutableStateOf(false) }

    // Persist the whole list to this device. Called after EVERY edit, so what's on
    // screen and what's on disk never drift apart. We snapshot first (toList()) so
    // the background save sees a stable copy even if the list changes meanwhile.
    fun persistLocal() {
        scope.launch { localStore.save(destinations.toList()) }
    }

    // LOAD ON LAUNCH — runs once when the app enters. Replace the starter seed with
    // the saved list if there is one; on the very first run (nothing saved yet),
    // write the starter list out so it's there next time. This (plus persistLocal()
    // on every edit) is what makes the list survive rotation AND a full restart.
    LaunchedEffect(Unit) {
        val saved = localStore.load()
        if (saved != null) {
            destinations.clear()
            destinations.addAll(saved)
        } else {
            localStore.save(destinations.toList())
        }
    }

    Log.d(
        TAG,
        "tab=$selectedTab top=$topKey  depths → explore=${exploreBackStack.size} " +
            "play=${playBackStack.size} add=${addBackStack.size} stats=${statsBackStack.size}  " +
            "places=${destinations.size}",
    )

    // ───────────────────────────────────────────────────────────────────────
    // EDIT HELPERS — the ONLY places that mutate app state. Screens call these
    // via callbacks; they never touch `destinations` directly.
    // ───────────────────────────────────────────────────────────────────────

    // Flip one place's `visited` flag by replacing it with a .copy() (Destination
    // is immutable), which recomposes every screen showing it — then save.
    fun toggleVisited(id: Int) {
        val index = destinations.indexOfFirst { it.id == id }
        if (index >= 0) {
            val current = destinations[index]
            destinations[index] = current.copy(visited = !current.visited)
            persistLocal()                                  // edit → write through to disk
        }
    }

    // Append a brand-new place with a unique id (one past the current maximum).
    fun addDestination(
        name: String, country: String, continent: String, priority: Int, visited: Boolean,
    ) {
        val nextId = (destinations.maxOfOrNull { it.id } ?: 0) + 1
        destinations.add(
            Destination(
                id = nextId,
                name = name.trim(),
                country = country.trim(),
                continent = continent,
                emoji = "📍",                                // a generic pin for user-added places
                blurb = "Added to your Wanderlist.",
                bestSeason = "Whenever you can!",
                notes = "You added this place. Open it any time to mark it visited.",
                priority = priority,
                visited = visited,
            ),
        )
        persistLocal()                                      // edit → write through to disk
    }

    // Remove a place by id. Used by the Detail screen's delete action.
    fun removeDestination(id: Int) {
        destinations.removeAll { it.id == id }
        persistLocal()                                      // edit → write through to disk
    }

    // ───────────────────────────────────────────────────────────────────────
    // EXPLICIT STORAGE ACTIONS (surfaced on the Stats screen). The list already
    // auto-saves on every edit (persistLocal()), so these are about giving the user
    // — and the learner reading the code — VISIBLE control over it: force a save
    // now, reset back to the starter list, or sync with the simulated cloud.
    // Each launches its suspend work in `scope` and reports via a Snackbar.
    // ───────────────────────────────────────────────────────────────────────

    // Force an immediate save and confirm it — the same write persistLocal() does
    // silently after each edit, but with a snackbar so it's easy to SEE it happen.
    fun saveLocal() {
        scope.launch {
            val snapshot = destinations.toList()            // snapshot once: save it AND report ITS size
            localStore.save(snapshot)                        // (the list could change during the suspend call)
            snackbarHostState.showSnackbar("Saved ${snapshot.size} places to this device")
        }
    }

    // Reset the list back to the starter places and persist that, replacing whatever
    // was saved. Handy for demos, and it shows that "storage" includes overwriting.
    fun resetToStarter() {
        destinations.clear()
        destinations.addAll(initialDestinations)
        scope.launch {
            localStore.save(destinations.toList())
            snackbarHostState.showSnackbar("Reset to the starter list")
        }
    }

    fun pushCloud() {
        scope.launch {
            syncing = true                                  // show the spinner / disable the buttons
            try {
                val snapshot = destinations.toList()        // snapshot what we send, so the message matches
                cloudStore.save(snapshot)
                snackbarHostState.showSnackbar("Synced ${snapshot.size} places to the cloud")
            } catch (e: Exception) {                        // a real network call could fail
                snackbarHostState.showSnackbar("Cloud sync failed: ${e.message}")
            } finally {
                syncing = false                             // ALWAYS clear it, success or error
            }
        }
    }

    fun pullCloud() {
        scope.launch {
            syncing = true
            try {
                val loaded = cloudStore.load()
                if (loaded != null) {
                    destinations.clear(); destinations.addAll(loaded)
                    localStore.save(loaded)                  // persist the pulled list so it's the new local copy
                    snackbarHostState.showSnackbar("Pulled ${loaded.size} places from the cloud")
                } else {
                    snackbarHostState.showSnackbar("Nothing in the cloud yet — push first")
                }
            } catch (e: Exception) {
                snackbarHostState.showSnackbar("Cloud load failed: ${e.message}")
            } finally {
                syncing = false
            }
        }
    }

    // ───────────────────────────────────────────────────────────────────────
    // (3) THE SCAFFOLD — the app frame shared across all screens.
    // ───────────────────────────────────────────────────────────────────────
    Scaffold(
        modifier = modifier.fillMaxSize(),
        // --- TOP APP BAR: title + (when drilled in) a Back arrow. ---
        topBar = {
            TopAppBar(
                title = {
                    val title = when (val key = topKey) {
                        is DetailKey ->
                            destinations.firstOrNull { it.id == key.destinationId }?.name ?: "Place"
                        AddKey -> "Add a place"
                        StatsKey -> "Your stats"
                        PlayKey -> "Play"
                        FlashcardKey -> "Flashcards"
                        GuessKey -> "Guess the place"
                        else -> "Wanderlist"                 // ExploreKey (or null)
                    }
                    Text(title)
                },
                navigationIcon = {
                    // Show a Back arrow whenever the current tab is drilled in past
                    // its root (Explore→Detail, or Play→a game). Tapping it pops the
                    // active tab's stack — one generic rule covers every tab.
                    if (activeBackStack.size > 1) {
                        IconButton(onClick = { activeBackStack.removeLastOrNull() }) {
                            Text("‹", style = MaterialTheme.typography.headlineMedium)
                        }
                    }
                },
            )
        },
        // --- BOTTOM NAVIGATION BAR: one item per tab. Switching to a DIFFERENT tab
        // just changes the selected index (history preserved). Re-tapping the tab
        // you are ALREADY on pops that tab's stack back to its root. ---
        bottomBar = {
            NavigationBar {
                TABS.forEach { tab ->
                    NavigationBarItem(
                        selected = selectedTab == tab.index,
                        onClick = {
                            if (selectedTab == tab.index) {
                                // Already here: pop THIS tab's stack to its root
                                // (a no-op for tabs already at their root).
                                while (activeBackStack.size > 1) activeBackStack.removeLastOrNull()
                            } else {
                                selectedTab = tab.index                // switch tabs (preserves history)
                            }
                        },
                        icon = { Text(text = tab.emoji, fontSize = 20.sp) },
                        label = { Text(text = tab.label) },
                    )
                }
            }
        },
        // --- FLOATING ACTION BUTTON: only on the Explore list; jumps to the Add
        // tab (index 2) — navigating programmatically. ---
        floatingActionButton = {
            if (topKey is ExploreKey) {
                FloatingActionButton(onClick = { selectedTab = 2 }) {
                    Text("＋", fontSize = 24.sp)
                }
            }
        },
        // --- SNACKBAR HOST: where transient confirmations appear. ---
        snackbarHost = { SnackbarHost(snackbarHostState) },
    ) { innerPadding ->
        // ───────────────────────────────────────────────────────────────────
        // (4) DISPLAY THE SELECTED TAB'S STACK and map every key to a screen.
        // ───────────────────────────────────────────────────────────────────
        NavDisplay(
            backStack = activeBackStack,
            modifier = Modifier.padding(innerPadding),       // keep content clear of the bars
            onBack = { activeBackStack.removeLastOrNull() },
            entryProvider = entryProvider {

                // ===== EXPLORE TAB =====
                entry<ExploreKey> {
                    ExploreScreen(
                        destinations = destinations,
                        onOpen = { id -> exploreBackStack.add(DetailKey(id)) },
                        onToggleVisited = { id -> toggleVisited(id) },
                    )
                }
                entry<DetailKey> { key ->
                    // Resolve from the MUTABLE list, guarding null (the place can be
                    // deleted) — defensive resolution, unlike first { }.
                    val destination = destinations.firstOrNull { it.id == key.destinationId }
                    if (destination != null) {
                        DetailScreen(
                            destination = destination,
                            onToggleVisited = { toggleVisited(destination.id) },
                            onDelete = {
                                // Pop FIRST (so this screen leaves the stack), THEN remove.
                                exploreBackStack.removeLastOrNull()
                                removeDestination(destination.id)
                            },
                            onBack = { exploreBackStack.removeLastOrNull() },
                        )
                    }
                }

                // ===== PLAY TAB =====
                // The menu, plus the two games it drills into. Both games read the
                // same `destinations` list (cards / things to find come from it).
                entry<PlayKey> {
                    PlayMenuScreen(
                        onOpenFlashcards = { playBackStack.add(FlashcardKey) },
                        onOpenGuess = { playBackStack.add(GuessKey) },
                    )
                }
                entry<FlashcardKey> {
                    FlashcardScreen(
                        destinations = destinations,
                        onBack = { playBackStack.removeLastOrNull() },
                    )
                }
                entry<GuessKey> {
                    GuessScreen(
                        destinations = destinations,
                        onBack = { playBackStack.removeLastOrNull() },
                    )
                }

                // ===== ADD TAB =====
                entry<AddKey> {
                    AddDestinationScreen(
                        continents = CONTINENTS,
                        onAdd = { name, country, continent, priority, visited ->
                            addDestination(name, country, continent, priority, visited)
                            scope.launch { snackbarHostState.showSnackbar("Added $name to your list") }
                            // Reset Explore to its root, then hop there so the new pin shows.
                            while (exploreBackStack.size > 1) exploreBackStack.removeLastOrNull()
                            selectedTab = 0
                        },
                    )
                }

                // ===== STATS TAB =====
                // Aggregates + the dark-mode switch + the Storage card (save/load).
                entry<StatsKey> {
                    StatsScreen(
                        destinations = destinations,
                        darkTheme = darkTheme,
                        onToggleDarkTheme = onToggleDarkTheme,
                        syncing = syncing,
                        onSaveLocal = { saveLocal() },
                        onReset = { resetToStarter() },
                        onPushCloud = { pushCloud() },
                        onPullCloud = { pullCloud() },
                    )
                }
            },
        )
    }
}

// The whole app frame: Scaffold + TopAppBar + bottom NavigationBar + the Explore
// start screen. Confirms the four emoji tabs and the FAB render together.
@Preview(name = "Full app", showBackground = true, widthDp = 320, heightDp = 640)
@Composable
fun WanderlistAppPreview() {
    ExampleProjectTheme {
        WanderlistApp(darkTheme = false, onToggleDarkTheme = {})
    }
}
