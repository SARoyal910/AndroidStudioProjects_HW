// =============================================================================
// MainActivity.kt  —  THE SCREEN that lets you WATCH the storage journey happen
//
// CONCEPT: this is the only screen. You type a label, tap "Save to storage", and three
// things update from one reactive pipeline:
//   • the Saved items list (read live from Room — note the id SQLite assigned each row),
//   • the Journey panel (the numbered, color-coded trip the element just took), and
//   • the item count.
// Everything you save SURVIVES AN APP RESTART, because it is written to the SQLite file
// "journey.db", not just held in memory. Kill the app and relaunch: your rows remain, and
// the first thing the Journey panel shows is Room READING them back off disk.
//
// WHAT TO INSPECT HERE:
//   • collectAsStateWithLifecycle() — turns the ViewModel's StateFlows into Compose state.
//   • The split of STATEFUL wrapper (JourneyRoute) from STATELESS screen (JourneyScreen),
//     the standard Compose pattern that keeps the screen previewable without a database.
//   • JourneyPanel / JourneyStepRow — render the same trace the HTML walkthrough narrates.
//   • Companion guide: open how-an-item-reaches-storage.html for these steps as code blocks.
// =============================================================================
package com.example.storagejourney

// --- Android framework imports ------------------------------------------------
import android.os.Bundle                                       // savedInstanceState type passed to onCreate
import androidx.activity.ComponentActivity                     // base Activity class with Compose support
import androidx.activity.compose.setContent                    // bridges an Activity to a Compose UI tree
import androidx.activity.enableEdgeToEdge                       // lets the app draw behind the system bars

// --- Compose layout / foundation imports -------------------------------------
import androidx.compose.foundation.background                   // modifier: paint a solid/!shape background
import androidx.compose.foundation.layout.Arrangement          // spacing strategy for Row/Column children
import androidx.compose.foundation.layout.Box                   // overlap/relative layout container
import androidx.compose.foundation.layout.Column               // stacks children vertically
import androidx.compose.foundation.layout.Row                  // lays out children horizontally
import androidx.compose.foundation.layout.Spacer               // empty box used to add fixed gaps
import androidx.compose.foundation.layout.fillMaxSize          // modifier: take all available width AND height
import androidx.compose.foundation.layout.fillMaxWidth         // modifier: take all available width
import androidx.compose.foundation.layout.height               // modifier: force a specific height
import androidx.compose.foundation.layout.padding              // modifier: add space around content
import androidx.compose.foundation.layout.size                 // modifier: force a square width+height
import androidx.compose.foundation.layout.width                // modifier: force a specific width
import androidx.compose.foundation.rememberScrollState         // remembers how far a scroller is scrolled
import androidx.compose.foundation.shape.RoundedCornerShape    // a rounded-rectangle shape for chips/badges
import androidx.compose.foundation.verticalScroll              // modifier: make a Column scroll vertically

// --- Material 3 component imports ---------------------------------------------
import androidx.compose.material3.Button                       // filled, tappable button
import androidx.compose.material3.Card                         // elevated surface used to group content
import androidx.compose.material3.HorizontalDivider            // thin horizontal separator line
import androidx.compose.material3.MaterialTheme                // access to the current theme's colors/typography
import androidx.compose.material3.OutlinedButton               // bordered, lower-emphasis button
import androidx.compose.material3.OutlinedTextField            // bordered text input field
import androidx.compose.material3.Scaffold                     // standard screen frame (handles insets, bars)
import androidx.compose.material3.Text                         // draws text

// --- Compose runtime / state imports -----------------------------------------
import androidx.compose.runtime.Composable                     // marks a function as emitting UI
import androidx.compose.runtime.getValue                       // property-delegate read for State<T>
import androidx.compose.runtime.mutableStateOf                 // creates observable local UI state
import androidx.compose.runtime.remember                       // remembers a value across recompositions
import androidx.compose.runtime.setValue                       // property-delegate write for MutableState<T>
import androidx.compose.ui.Alignment                           // vertical/horizontal alignment within Row/Column
import androidx.compose.ui.Modifier                            // the "how to lay out / decorate" object
import androidx.compose.ui.graphics.Color                      // an ARGB color value
import androidx.compose.ui.text.font.FontFamily                // typeface family (Monospace for the trace)
import androidx.compose.ui.text.font.FontWeight                // text weight (Bold for emphasis)
import androidx.compose.ui.tooling.preview.Preview             // enables @Preview rendering in Android Studio
import androidx.compose.ui.unit.dp                             // density-independent pixel unit (e.g. 16.dp)

// --- Lifecycle + ViewModel imports -------------------------------------------
import androidx.lifecycle.compose.collectAsStateWithLifecycle  // collects a Flow into Compose state, lifecycle-aware
import androidx.lifecycle.viewmodel.compose.viewModel          // obtains/remembers a ViewModel inside a composable

// --- App imports --------------------------------------------------------------
import com.example.storagejourney.data.StoredItem              // the persisted element (a Room row)
import com.example.storagejourney.journey.JourneyStage         // which layer a step belongs to (drives its color)
import com.example.storagejourney.journey.JourneyStep          // one recorded moment in the trip
import com.example.storagejourney.ui.theme.StorageJourneyTheme // our Material theme wrapper (Theme.kt)

/**
 * MainActivity — the app's single entry-point Activity.
 *
 * It builds the [StorageJourneyViewModel] via its Application factory and hands the screen
 * over to Compose. There is no navigation here; the whole app is one screen on purpose.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)                     // always call through to the framework first
        enableEdgeToEdge()                                     // draw under the system bars for a modern look
        setContent {
            // Obtain the ViewModel (constructed via its Application factory). `viewModel()`
            // remembers it across recompositions and scopes it to this Activity, so it
            // survives rotation — the database is not rebuilt on every recomposition.
            val viewModel: StorageJourneyViewModel = viewModel(
                factory = StorageJourneyViewModel.factory(application)
            )
            StorageJourneyTheme(dynamicColor = false) {        // dynamicColor=false so the palette is stable
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    JourneyRoute(
                        viewModel = viewModel,
                        modifier = Modifier.padding(innerPadding),
                    )
                }
            }
        }
    }
}

// ===========================================================================
// UI  (STATEFUL wrapper)
// ===========================================================================

/**
 * Stateful entry point: collects the ViewModel's [StateFlow]s into Compose state and
 * forwards the data + callbacks to the STATELESS [JourneyScreen].
 *
 * THREE ideas in one `val x by someFlow.collectAsStateWithLifecycle()` line:
 *   1. someFlow                       — a StateFlow the ViewModel exposes (its live value).
 *   2. .collectAsStateWithLifecycle() — SUBSCRIBES to it, wraps the latest value in Compose
 *      State, and recomposes this function on each new emission. "WithLifecycle" pauses the
 *      collection while the screen is off-screen (the Android-safe collectAsState).
 *   3. `by`                           — a delegate that unwraps State's .value, so `x` reads
 *      as the plain value and reading it registers this composable as a reader.
 */
@Composable
fun JourneyRoute(
    viewModel: StorageJourneyViewModel,
    modifier: Modifier = Modifier,
) {
    val items by viewModel.items.collectAsStateWithLifecycle()       // live rows from Room
    val journey by viewModel.journey.collectAsStateWithLifecycle()   // the recorded trip

    JourneyScreen(
        items = items,
        journey = journey,
        onSave = viewModel::addItem,            // -> reset trace, record UI/VM, Room insert
        onDelete = viewModel::deleteItem,       // -> Room delete (persisted)
        onClear = viewModel::clearAll,          // -> Room delete-all (persisted)
        modifier = modifier,
    )
}

// ===========================================================================
// UI  (STATELESS screen — fully previewable without a database)
// ===========================================================================

/**
 * The whole screen as a STATELESS composable: it receives all data and all callbacks as
 * parameters and holds NO ViewModel. That is what makes it usable from @Preview with
 * hand-supplied data (see the bottom of this file).
 *
 * Layout note: we use a single `Column` with `verticalScroll(...)` and plain `forEach`
 * loops for the two lists, rather than `LazyColumn`. A LazyColumn cannot be nested inside
 * another vertically-scrolling container (its height would be unbounded), and for a small
 * teaching list a plain Column is perfectly fine.
 *
 * @param items    the persisted elements to render (from Room's reactive Flow).
 * @param journey  the recorded steps of the most recent element's trip.
 * @param onSave   called with the typed label to persist a new element.
 * @param onDelete called to delete one persisted element.
 * @param onClear  called to wipe all persisted elements.
 * @param modifier optional layout modifier (carries the Scaffold's system-bar insets).
 */
@Composable
fun JourneyScreen(
    items: List<StoredItem>,
    journey: List<JourneyStep>,
    onSave: (String) -> Unit,
    onDelete: (StoredItem) -> Unit,
    onClear: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // LOCAL, NON-PERSISTED UI state: the text currently in the input. Only the SUBMITTED
    // label is persisted — this field resets to "" after a save.
    var label by remember { mutableStateOf("") }

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())     // one scroll container for the whole screen
            .padding(16.dp),
    ) {

        // --- Title + one-line explanation -------------------------------------
        Text("Storage Journey", style = MaterialTheme.typography.headlineSmall)
        Text(
            "Save a line of text and watch the one element travel UI → ViewModel → Repository " +
                "→ Room → back to the screen. Everything you save survives an app restart.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 4.dp),
        )

        Spacer(Modifier.height(16.dp))

        // --- The input + Save button (the start of the journey) ---------------
        OutlinedTextField(
            value = label,
            onValueChange = { label = it },                    // local UI state only
            label = { Text("Text to store") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(8.dp))
        Button(
            onClick = {
                onSave(label)                                  // -> ViewModel.addItem -> Room insert
                label = ""                                     // clear the local input field
            },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Save to storage")
        }

        Spacer(Modifier.height(20.dp))

        // --- The Journey panel: the recorded trip of the last element ---------
        JourneyPanel(journey = journey)

        Spacer(Modifier.height(20.dp))

        // --- The persisted items, read live from Room -------------------------
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text(
                "Saved items (${items.size})",                 // count proves the rows survive restart
                style = MaterialTheme.typography.titleMedium,
            )
            if (items.isNotEmpty()) {
                OutlinedButton(onClick = onClear) { Text("Clear storage") }
            }
        }
        HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

        if (items.isEmpty()) {
            Text(
                "Nothing stored yet. Save something above — it lands in journey.db and will " +
                    "still be here after you kill and relaunch the app.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        } else {
            // Plain forEach (not LazyColumn) because we're already inside a verticalScroll.
            items.forEach { item ->
                ItemRow(item = item, onDelete = { onDelete(item) })
                HorizontalDivider()
            }
        }

        Spacer(Modifier.height(24.dp))
    }
}

// ===========================================================================
// UI  (the Journey panel — renders the JourneyLog trace)
// ===========================================================================

/**
 * The panel that lists every recorded step of the most recent element's trip, numbered and
 * color-coded by layer. This is the in-app mirror of how-an-item-reaches-storage.html.
 */
@Composable
fun JourneyPanel(journey: List<JourneyStep>) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text("Journey of the last element", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(2.dp))
            Text(
                if (journey.isEmpty())
                    "Save something above to record its trip through the layers."
                else
                    "Each row is one layer the data passed through, with the time since the trip began.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(10.dp))

            // `forEachIndexed` gives us both the position (for the step number) and the step.
            journey.forEachIndexed { index, step ->
                JourneyStepRow(number = index + 1, step = step)
                if (index != journey.lastIndex) Spacer(Modifier.height(8.dp))
            }
        }
    }
}

/**
 * One row in the Journey panel: [number badge] [colored stage chip] [message + "+N ms"].
 *
 * @param number the 1-based step number (its position in the list).
 * @param step   the recorded step (stage, message, elapsed millis).
 */
@Composable
fun JourneyStepRow(number: Int, step: JourneyStep) {
    val color = stageColor(step.stage)                         // pick the layer's color once
    Row(verticalAlignment = Alignment.Top) {
        // Step number badge.
        Box(
            modifier = Modifier
                .size(24.dp)
                .background(color, RoundedCornerShape(12.dp)),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                number.toString(),
                color = Color.White,
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.labelSmall,
            )
        }
        Spacer(Modifier.width(10.dp))
        Column(modifier = Modifier.weight(1f)) {               // weight => take the remaining width
            Row(verticalAlignment = Alignment.CenterVertically) {
                // The colored stage chip (UI / ViewModel / Repository / Room / Flow).
                Box(
                    modifier = Modifier
                        .background(color.copy(alpha = 0.14f), RoundedCornerShape(6.dp))
                        .padding(horizontal = 8.dp, vertical = 2.dp),
                ) {
                    Text(
                        step.stage.label,
                        color = color,
                        fontWeight = FontWeight.Bold,
                        style = MaterialTheme.typography.labelSmall,
                    )
                }
                Spacer(Modifier.width(8.dp))
                // Elapsed time since the trip began, in monospace so the numbers line up.
                Text(
                    "+${step.sinceStartMillis} ms",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontFamily = FontFamily.Monospace,
                    style = MaterialTheme.typography.labelSmall,
                )
            }
            Spacer(Modifier.height(2.dp))
            Text(step.message, style = MaterialTheme.typography.bodySmall)
        }
    }
}

/**
 * One row in the Saved-items list: the SQLite-assigned id badge, the stored label, and a
 * Delete button. Stateless — behavior is delegated to [onDelete].
 */
@Composable
fun ItemRow(item: StoredItem, onDelete: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // The id badge — proof that SQLite assigned this row a primary key on insert.
        Box(
            modifier = Modifier
                .background(MaterialTheme.colorScheme.secondaryContainer, RoundedCornerShape(6.dp))
                .padding(horizontal = 8.dp, vertical = 4.dp),
        ) {
            Text(
                "#${item.id}",
                color = MaterialTheme.colorScheme.onSecondaryContainer,
                fontFamily = FontFamily.Monospace,
                style = MaterialTheme.typography.labelMedium,
            )
        }
        Spacer(Modifier.width(12.dp))
        Text(
            item.label,
            style = MaterialTheme.typography.bodyLarge,
            modifier = Modifier.weight(1f),                    // take the space between badge and button
        )
        OutlinedButton(onClick = onDelete) { Text("Delete") }
    }
}

/**
 * Map a [JourneyStage] to a stable color. These deliberately match the layer colors used in
 * how-an-item-reaches-storage.html so the app and the walkthrough read as one lesson.
 */
private fun stageColor(stage: JourneyStage): Color = when (stage) {
    JourneyStage.UI -> Color(0xFF2D64C8)         // blue   — the screen
    JourneyStage.VIEWMODEL -> Color(0xFF6D58B8)  // violet — the state holder
    JourneyStage.REPOSITORY -> Color(0xFF0A8F9A) // teal   — the storage boundary
    JourneyStage.ROOM -> Color(0xFFB56C00)       // amber  — the SQLite engine / disk
    JourneyStage.FLOW -> Color(0xFF1B8A5A)       // green  — the reactive return trip
}

// ===========================================================================
// @Preview functions — render the screen WITHOUT a device or a real database.
//
// IMPORTANT: previews call the STATELESS JourneyScreen with HAND-SUPPLIED data and no-op
// callbacks ({}). We never construct a StorageJourneyViewModel in a preview — it would try
// to open the Room database, which is not available in the design pane and would fail.
// ===========================================================================

// Fake rows + a fake completed journey, used only by the previews below.
private val previewItems = listOf(
    StoredItem(id = 3, label = "Buy milk", createdAt = 0L),
    StoredItem(id = 2, label = "Read the Room docs", createdAt = 0L),
    StoredItem(id = 1, label = "Try the Database Inspector", createdAt = 0L),
)
private val previewJourney = listOf(
    JourneyStep(JourneyStage.UI, "The Save button captured \"Buy milk\" and called viewModel.addItem(\"Buy milk\").", 0L),
    JourneyStep(JourneyStage.VIEWMODEL, "ViewModel built StoredItem(label=\"Buy milk\", createdAt=…) and launched a coroutine.", 1L),
    JourneyStep(JourneyStage.REPOSITORY, "Repository.save(...) called dao.insert(item) — a suspend write off the main thread.", 2L),
    JourneyStep(JourneyStage.ROOM, "Room executed INSERT and SQLite committed the row to journey.db as id #3.", 6L),
    JourneyStep(JourneyStage.FLOW, "Room re-ran SELECT * FROM items, found 3 row(s), and pushed a new List down the Flow.", 8L),
)

@Preview(name = "Journey - filled", showBackground = true, widthDp = 380, heightDp = 900)
@Composable
fun JourneyScreenFilledPreview() {
    StorageJourneyTheme(dynamicColor = false) {
        JourneyScreen(
            items = previewItems,
            journey = previewJourney,
            onSave = {},                                       // no-op: previews don't persist
            onDelete = {},
            onClear = {},
        )
    }
}

@Preview(name = "Journey - empty", showBackground = true, widthDp = 380, heightDp = 600)
@Composable
fun JourneyScreenEmptyPreview() {
    StorageJourneyTheme(dynamicColor = false) {
        JourneyScreen(
            items = emptyList(),
            journey = emptyList(),
            onSave = {},
            onDelete = {},
            onClear = {},
        )
    }
}
