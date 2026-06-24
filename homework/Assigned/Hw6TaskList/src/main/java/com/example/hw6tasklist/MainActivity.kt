// =============================================================================
// MainActivity.kt  —  THE UI for the Hw6 "Tasks" app (Navigation 3 + Compose + Room)
//
// This one app ties together the three things this homework covers:
//   • NAVIGATION (Nav3)  — a list screen that pushes an add/edit screen and pops back.
//   • COMPOSE            — the list, each row, and the edit form are all @Composables.
//   • ROOM               — the tasks come from / are saved to a real SQLite database
//                          (see the data/ folder + TaskViewModel.kt).
//
// The flow you are building:
//
//     TaskListScreen (all tasks)  --tap "＋"-->        TaskEditScreen (new task)
//                                 --tap a row-->        TaskEditScreen (edit that task)
//                                 <--Save / Cancel / system-back (pops the stack)--
//
// ──────────────────────────────────────────────────────────────────────────────
// YOUR WORK IN THIS FILE:  ★ TODO 5, 6, 7, 8 ★
//   • TODO 5 — build TaskListScreen (the list + an "add" button)
//   • TODO 6 — build TaskRow (one task row)
//   • TODO 7 — build TaskEditScreen (the add/edit form)
//   • TODO 8 — wire the three NAVIGATION actions in AppNavigation's entryProvider
// The Nav3 host (AppNavigation / NavDisplay / entryProvider) is DONE for you as the
// worked example — compare it with NavListDetail's MainActivity.kt.
// ──────────────────────────────────────────────────────────────────────────────
// =============================================================================
package com.example.hw6tasklist

// --- Android framework imports ------------------------------------------------
import android.os.Bundle                                       // savedInstanceState type passed to onCreate
import androidx.activity.ComponentActivity                     // base Activity class with Compose support
import androidx.activity.compose.setContent                    // bridges an Activity to a Compose UI tree
import androidx.activity.enableEdgeToEdge                       // lets the app draw behind the system bars

// --- Compose layout / foundation imports -------------------------------------
import androidx.compose.foundation.clickable                   // makes a row/element tappable
import androidx.compose.foundation.layout.Arrangement          // spacing strategy for Row/Column children
import androidx.compose.foundation.layout.Box                  // overlap/align children (e.g. pin a FAB)
import androidx.compose.foundation.layout.Column               // stacks children vertically
import androidx.compose.foundation.layout.Row                  // lays out children horizontally
import androidx.compose.foundation.layout.Spacer               // empty box used to add fixed gaps
import androidx.compose.foundation.layout.fillMaxSize          // modifier: take all available width AND height
import androidx.compose.foundation.layout.fillMaxWidth         // modifier: take all available width
import androidx.compose.foundation.layout.height               // modifier: force a specific height
import androidx.compose.foundation.layout.padding              // modifier: add space around content
import androidx.compose.foundation.lazy.LazyColumn             // scrolling list (only renders visible rows)
import androidx.compose.foundation.lazy.items                  // iterate a List inside a LazyColumn

// --- Material 3 component imports ---------------------------------------------
import androidx.compose.material3.Button                       // filled, tappable button
import androidx.compose.material3.Checkbox                     // square check control (a task's "done")
import androidx.compose.material3.FloatingActionButton         // round "＋" action button (good for "add")
import androidx.compose.material3.HorizontalDivider            // thin horizontal separator line
import androidx.compose.material3.MaterialTheme                // access to the current theme's colors/typography
import androidx.compose.material3.OutlinedButton               // bordered (secondary) button
import androidx.compose.material3.OutlinedTextField            // bordered text input field
import androidx.compose.material3.Scaffold                     // standard screen frame (handles insets, bars)
import androidx.compose.material3.Text                         // draws text

// --- Compose runtime / state imports -----------------------------------------
import androidx.compose.runtime.Composable                     // marks a function as emitting UI
import androidx.compose.runtime.getValue                       // property-delegate read for State<T>
import androidx.compose.runtime.mutableStateOf                 // creates observable local UI state
import androidx.compose.runtime.remember                       // remembers a value across recompositions
import androidx.compose.runtime.setValue                       // property-delegate write for MutableState<T>
import androidx.compose.ui.Alignment                           // vertical/horizontal alignment within Row/Column/Box
import androidx.compose.ui.Modifier                            // the "how to lay out / decorate" object
import androidx.compose.ui.tooling.preview.Preview             // enables @Preview rendering in Android Studio
import androidx.compose.ui.unit.dp                             // density-independent pixel unit (e.g. 16.dp)

// --- Lifecycle + ViewModel imports -------------------------------------------
import androidx.lifecycle.compose.collectAsStateWithLifecycle  // collects a Flow into Compose state, lifecycle-aware
import androidx.lifecycle.viewmodel.compose.viewModel          // obtains/remembers a ViewModel inside a composable

// --- Navigation 3 imports -----------------------------------------------------
// Nav3 is the modern, Compose-first navigation library: a single Activity holds a
// back stack of "keys", and Compose swaps the screen whenever the top key changes.
import androidx.navigation3.runtime.NavKey                     // marker interface every navigation key implements
import androidx.navigation3.runtime.entryProvider              // DSL that maps each key type to a screen
import androidx.navigation3.runtime.rememberNavBackStack       // creates + remembers the back stack across recomposition
import androidx.navigation3.ui.NavDisplay                      // the composable that renders the current top key

// --- App imports --------------------------------------------------------------
import com.example.hw6tasklist.data.Task                       // the Room entity (a task row)
import com.example.hw6tasklist.ui.theme.Hw6TaskListTheme       // our Material theme wrapper (Theme.kt)
import kotlinx.serialization.Serializable                      // makes the Nav3 keys serializable (required by Nav3)

// ===========================================================================
// NAVIGATION KEYS
// Each screen is identified by a "key". A key both NAMES the destination AND
// CARRIES that destination's arguments. Nav3 requires keys to implement NavKey
// and (so the back stack survives process death) be @Serializable.
// ===========================================================================

// `data object` = a singleton: there is only ever ONE list screen, so one shared
// object is the right model. It carries no arguments.
@Serializable
data object TaskListKey : NavKey                               // the list screen (no arguments)

// `data class` because each edit screen instance differs by WHICH task it edits.
// taskId is nullable on purpose:
//   • taskId == null  -> "add a brand-new task" (the form starts blank)
//   • taskId != null  -> "edit the existing task with this id"
@Serializable
data class TaskEditKey(val taskId: Long?) : NavKey            // the add/edit screen; taskId picks new-vs-edit

/**
 * MainActivity — the app's single Activity and the entry point Android launches.
 * In a Nav3 app you typically have exactly one Activity; it hosts the Compose UI
 * and the navigation back stack.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)                     // always call through to the framework first
        enableEdgeToEdge()                                     // draw under the system bars for a modern look
        setContent {                                           // everything inside is the Compose UI
            Hw6TaskListTheme {
                // Obtain the Room-backed ViewModel (built via its Application factory).
                // `application` is the Activity's Application instance; the factory needs it
                // so the ViewModel can open the database without leaking this Activity.
                val viewModel: TaskViewModel = viewModel(
                    factory = TaskViewModel.factory(application)
                )
                // Scaffold provides the standard screen frame and hands us `innerPadding`
                // (the space taken by the system bars) so content isn't drawn under them.
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    AppNavigation(
                        viewModel = viewModel,
                        modifier = Modifier.padding(innerPadding),
                    )
                }
            }
        }
    }
}

// ===========================================================================
// NAVIGATION HOST  (DONE for you — this is the worked Nav3 example)
// ===========================================================================

/**
 * AppNavigation — owns the back stack and maps each key to its screen.
 *
 * It collects the Room-backed task list ONCE here and hands it to whichever screen
 * is showing. Pushing a key (`backStack.add`) navigates forward; popping
 * (`backStack.removeLastOrNull`) navigates back.
 *
 * @param viewModel the Room-backed state holder (task list + save/delete/toggle actions).
 * @param modifier  layout modifier from the Scaffold (applies system-bar insets).
 */
@Composable
fun AppNavigation(
    viewModel: TaskViewModel,
    modifier: Modifier = Modifier,
) {
    // Collect the ViewModel's task StateFlow into Compose state. Reading `tasks`
    // here makes this composable recompose whenever Room emits a new list.
    val tasks by viewModel.tasks.collectAsStateWithLifecycle()

    // The back stack starts at the list screen. rememberNavBackStack preserves it
    // across recompositions and configuration changes.
    val backStack = rememberNavBackStack(TaskListKey)

    NavDisplay(
        backStack = backStack,
        modifier = modifier,
        // System back gesture / hardware back button: pop the top key (no-op if empty).
        onBack = { backStack.removeLastOrNull() },
        // entryProvider maps each key TYPE to the screen shown while that key is on top.
        entryProvider = entryProvider {

            // =================================================================
            // ★ TODO 8 — wire the three NAVIGATION actions ★
            // (builds on NavListDetail: backStack.add(...) to go forward,
            //  backStack.removeLastOrNull() to go back)
            //
            // Right now the "add" button, the row taps, and Save/Cancel do NOT move
            // between screens — their lambdas are empty. Make them navigate:
            //   8a) onAddTask  -> push a NEW-task key:   backStack.add(TaskEditKey(taskId = null))
            //   8b) onOpenTask -> push an EDIT key for that task: backStack.add(TaskEditKey(taskId = task.id))
            //   8c) onSave & onCancel -> after saving (or cancelling), pop back to the
            //       list:               backStack.removeLastOrNull()
            // =================================================================

            // When TaskListKey is on top, show the full list of tasks.
            entry<TaskListKey> {
                TaskListScreen(
                    tasks = tasks,
                    onAddTask = {
                        // TODO 8a: backStack.add(TaskEditKey(taskId = null))
                        backStack.add(TaskEditKey(taskId = null))
                    },
                    onOpenTask = { task ->
                        // TODO 8b: backStack.add(TaskEditKey(taskId = task.id))
                        backStack.add(TaskEditKey(taskId = task.id))
                    },
                    onToggleDone = viewModel::toggleDone,       // flip done -> Room UPDATE (TODO 4b)
                    onDelete = viewModel::delete,               // delete -> Room DELETE (TODO 4a)
                )
            }

            // When a TaskEditKey is on top, show the add/edit form for that key.
            entry<TaskEditKey> { key ->
                // Resolve WHICH task we're editing. A null taskId means "new task", so
                // `existing` stays null and the form starts blank. Otherwise we find the
                // task in the already-loaded list (no extra DB round-trip needed).
                val existing: Task? = key.taskId?.let { id -> tasks.find { it.id == id } }
                TaskEditScreen(
                    existing = existing,
                    onSave = { task ->
                        viewModel.save(task)                    // persist via Room (TODO 3)
                        // TODO 8c: backStack.removeLastOrNull()  // then pop back to the list
                        backStack.removeLastOrNull()
                    },
                    onCancel = {
                        // TODO 8c: backStack.removeLastOrNull()
                        backStack.removeLastOrNull()
                    },
                )
            }
        }
    )
}

// ===========================================================================
// SCREEN 1 — the task list
// ===========================================================================

/**
 * The list screen: shows every task and a way to add a new one. Stateless — it
 * renders the [tasks] it is given and reports user intents via callbacks.
 *
 * @param tasks        the Room-backed tasks to render (already sorted by the DAO).
 * @param onAddTask    called when the user wants to create a new task (navigate to the form).
 * @param onOpenTask   called with a task when its row is tapped (navigate to edit it).
 * @param onToggleDone called with a task when its checkbox is flipped (Room UPDATE).
 * @param onDelete     called with a task when its delete control is tapped (Room DELETE).
 */
@Composable
fun TaskListScreen(
    tasks: List<Task>,
    onAddTask: () -> Unit,
    onOpenTask: (Task) -> Unit,
    onToggleDone: (Task) -> Unit,
    onDelete: (Task) -> Unit,
    modifier: Modifier = Modifier,
) {
    // =====================================================================
    // ★ TODO 5 — build the task list + an "add" button ★
    // (builds on RoomAndPreferences' Barnes notes list; the OPTIONAL FAB builds on hw5's Box/align)
    //
    // Replace this placeholder so the screen shows:
    //   • a way to ADD a task whose onClick calls onAddTask(). SIMPLEST: a plain
    //     Button("New task") at the TOP of a Column — exactly like RoomAndPreferences
    //     puts its "Add note" button above the list. No new layout ideas needed.
    //   • the LIST — a LazyColumn that emits one TaskRow(...) per task in `tasks`:
    //     `items(tasks, key = { it.id }) { task -> TaskRow(...); HorizontalDivider() }`,
    //     wiring each row's callbacks to onOpenTask / onToggleDone / onDelete.
    //   • an EMPTY STATE — when `tasks` is empty, show a friendly "No tasks yet" message
    //     instead of a blank screen.
    //
    // OPTIONAL STRETCH — a Material FloatingActionButton pinned bottom-right (the hw5
    // Box/align trick). Make the list and the FAB SIBLINGS inside ONE Box:
    //     Box(Modifier.fillMaxSize()) {
    //         LazyColumn(Modifier.fillMaxSize(),
    //             contentPadding = PaddingValues(bottom = 88.dp)) { /* items + dividers */ }
    //         FloatingActionButton(onClick = onAddTask,
    //             modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp)) { Text("＋") }
    //     }
    // The bottom contentPadding stops the FAB covering the last row. (PaddingValues lives
    // in androidx.compose.foundation.layout — add that import if you take this path.)
    //
    // The placeholder below just proves the screen is wired up; delete it.
    // =====================================================================
    Column(modifier = modifier.fillMaxSize().padding(16.dp)) {
        Text("Tasks", style = MaterialTheme.typography.headlineSmall)
        Spacer(Modifier.height(12.dp))
//        Text(
//            "TODO 5 — build the task list here.\n\n" +
//                "Add a FloatingActionButton (or Button) that calls onAddTask(), then a " +
//                "LazyColumn of TaskRow(...) over `tasks`, plus an empty-state message.\n\n" +
//                "There ${if (tasks.size == 1) "is" else "are"} currently ${tasks.size} task(s) in the database.",
//            style = MaterialTheme.typography.bodyMedium,
//        )
        Button(onClick = onAddTask){
            Text("New Task")
        }
        Spacer(Modifier.height(12.dp))

        if (tasks.isEmpty()) {
            Text (
                text = "NO tasks yet",
                style = MaterialTheme.typography.bodyMedium,
            )
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
            ) {
                items (
                    items = tasks,
                    key = { it.id }
                ) {
                        task -> TaskRow(
                    task = task,
                    onToggleDone = { onToggleDone(task) },
                    onOpen = { onOpenTask(task) },
                    onDelete = { onDelete(task) },
                )
                    HorizontalDivider()
                }
            }
        }
    }
}

/**
 * One row in the task list. Stateless — all behavior is delegated to callbacks.
 *
 * @param task         the task this row renders.
 * @param onToggleDone called when the done checkbox is tapped (Room UPDATE).
 * @param onOpen       called when the row body is tapped (navigate to edit).
 * @param onDelete     called when the delete control is tapped (Room DELETE).
 */
@Composable
fun TaskRow(
    task: Task,
    onToggleDone: () -> Unit,
    onOpen: () -> Unit,
    onDelete: () -> Unit,
) {
    // =====================================================================
    // ★ TODO 6 — make this row real ★
    // (builds on hw5's settings row: Row cross-axis + Modifier.weight + state)
    //
    // Build a Row (verticalAlignment = Alignment.CenterVertically,
    //   horizontalArrangement = Arrangement.spacedBy(8.dp)) containing:
    //   • a Checkbox(checked = task.done, onCheckedChange = { onToggleDone() })
    //   • a Column with Modifier.weight(1f) holding the title (titleMedium) and, if
    //     task.notes is not blank, the notes (bodyMedium). Give the Column a
    //     Modifier.clickable { onOpen() } so tapping the text opens the editor.
    //   • a small priority label — map the Int to text with
    //         when (task.priority) { 2 -> "High"; 1 -> "Normal"; else -> "Low" }
    //   • a delete control — an OutlinedButton(onClick = onDelete) { Text("Delete") }
    //
    // The placeholder below shows just the title (and is tappable); replace it.
    // =====================================================================
    val priorityText = when (task.priority) {
        2 -> "High"
        1 -> "Normal"
        else -> "Low"
    }
    Row(
        modifier = Modifier.fillMaxWidth()
            .padding(8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Checkbox(
            checked = task.done,
            onCheckedChange = { onToggleDone() }
        )
        Column(
            modifier = Modifier.weight(1f)
                .clickable { onOpen() }
        ) {
            Text(
                text = task.title,
                style = MaterialTheme.typography.titleMedium,
            )
            if (task.notes.isNotBlank()) {
                Text(
                    text = task.notes,
                    style = MaterialTheme.typography.bodyMedium,
                )
            }
        }


        Text(
            text = priorityText,
            style = MaterialTheme.typography.bodyMedium,
        )
        OutlinedButton(onClick = onDelete) {
            Text("Delete")
        }
    }
}

// ===========================================================================
// SCREEN 2 — the add / edit form
// ===========================================================================

/**
 * The add/edit screen. If [existing] is null the form is for a NEW task (blank);
 * otherwise it pre-fills from that task and edits it.
 *
 * @param existing the task being edited, or null to create a new one.
 * @param onSave   called with the finished [Task] to persist (insert or update).
 * @param onCancel called to leave without saving.
 */
@Composable
fun TaskEditScreen(
    existing: Task?,
    onSave: (Task) -> Unit,
    onCancel: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // =====================================================================
    // ★ TODO 7 — build the add/edit form ★
    // (builds on RoomAndPreferences' add-note inputs + hw5's remembered state)
    //
    // 1) LOCAL form state, seeded from `existing` (or blank for a new task). KEY each
    //    remember on `existing` so the fields re-seed if the task arrives a moment later
    //    (e.g. when the app is killed and reopened directly on this edit screen — without
    //    the key, the form could stay blank because `remember` caches its first value):
    //        var title by remember(existing) { mutableStateOf(existing?.title ?: "") }
    //        var notes by remember(existing) { mutableStateOf(existing?.notes ?: "") }
    //        var done by remember(existing) { mutableStateOf(existing?.done ?: false) }
    //        var priority by remember(existing) { mutableStateOf(existing?.priority ?: 1) }
    // 2) UI: an OutlinedTextField for title and one for notes; a control to change
    //    priority; a Checkbox for `done`. SIMPLEST priority control — ONE Button that
    //    cycles AND shows the value (reuses the same mapping as TODO 6):
    //        Button(onClick = { priority = (priority + 1) % 3 }) {
    //            Text("Priority: " + when (priority) { 2 -> "High"; 1 -> "Normal"; else -> "Low" })
    //        }
    //    (A Row of three Low/Normal/High buttons also works, but then highlight the
    //    selected one — a filled Button for the active level, OutlinedButton for the rest.)
    // 3) A "Save" Button that builds a Task and calls onSave(...). PRESERVE the id and
    //    createdAt when editing so Room UPDATES the same row instead of inserting a new one:
    //        onSave(
    //            Task(
    //                id = existing?.id ?: 0L,                          // 0 = new -> INSERT; non-zero -> UPDATE
    //                title = title.trim(),
    //                notes = notes.trim(),
    //                done = done,
    //                priority = priority,
    //                createdAt = existing?.createdAt ?: System.currentTimeMillis(),
    //            )
    //        )
    //    ...and a "Cancel" Button (or OutlinedButton) that calls onCancel().
    //
    // The placeholder below shows the title and a working Back button; replace it.
    // =====================================================================
    var title by remember(existing) { mutableStateOf(existing?.title ?: "") }
    var notes by remember(existing) { mutableStateOf(existing?.notes ?: "") }
    var done by remember(existing) { mutableStateOf(existing?.done ?: false) }
    var priority by remember(existing) { mutableStateOf(existing?.priority ?: 1) }

    val priorityText = when (priority) {
        2 -> "High"
        1 -> "Normal"
        else -> "Low"
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = if (existing == null) "New task" else "Edit task",
            style = MaterialTheme.typography.headlineSmall
        )

        OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("Title") },
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = notes,
            onValueChange = { notes = it },
            label = { Text("Notes") },
            modifier = Modifier.fillMaxWidth()
        )

        Button(
            onClick = { priority = (priority + 1) % 3 }
        ) {
            Text("Priority: $priorityText")
        }

        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Checkbox(
                checked = done,
                onCheckedChange = { done = it }
            )

            Text("Done")
        }

        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = {
                    onSave(
                        Task(
                            id = existing?.id ?: 0L,
                            title = title.trim(),
                            notes = notes.trim(),
                            done = done,
                            priority = priority,
                            createdAt = existing?.createdAt ?: System.currentTimeMillis()
                        )
                    )
                },
                enabled = title.trim().isNotEmpty()
            ) {
                Text("Save")
            }

            OutlinedButton(onClick = onCancel) {
                Text("Cancel")
            }
        }
    }
}

// ===========================================================================
// @Preview — render TaskListScreen in Android Studio's design pane WITHOUT a
// device or a real database. Previews call the STATELESS screen with hand-made
// data and no-op callbacks ({}); never build a ViewModel in a preview (it would
// try to open the Room database, which the design pane can't provide).
// As you implement TODO 5/6, this preview fills in to show your real list.
// ===========================================================================
private val previewTasks = listOf(
    Task(id = 1, title = "Buy groceries", notes = "Milk, eggs, bread", done = false, priority = 1),
    Task(id = 2, title = "Submit Homework 6", notes = "Nav + Compose + Room", done = false, priority = 2),
    Task(id = 3, title = "Read Room docs", notes = "", done = true, priority = 0),
)

@Preview(name = "Task list", showBackground = true, widthDp = 360, heightDp = 640)
@Composable
fun TaskListScreenPreview() {
    Hw6TaskListTheme {
        TaskListScreen(
            tasks = previewTasks,
            onAddTask = {},                                    // no-op: previews don't navigate
            onOpenTask = {},
            onToggleDone = {},
            onDelete = {},
        )
    }
}
