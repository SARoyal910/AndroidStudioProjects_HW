// =============================================================================
// Hw4Solutions.kt  —  ANSWER KEY (runnable) for Homework 4, the ComposeCatalog half.
//
// This file holds the tasks the assignment routes to ComposeCatalog:
//   • T1  — a Column with arrangement & alignment
//   • T2  — a Row that shares width with weight (1:2:1, plus the "no middle weight" variant)
//   • T3  — a Box that layers & aligns (two corner badges)
//   • T7  — a counter (state & recomposition)
//   • T8  — a real toggle that drives the UI (state hoisting)
//   • T9  — a bound TextField (echo + character count)
//   • T10 — the capstone: an interactive planet screen
//
// The Part B modifier-order tasks (T4, T5, T6) live in the sibling project
// ComposeModifiers-solution. Every composable here is @Preview-able on its own,
// and MainActivity wires a tiny runtime selector so you can see them on the
// emulator without nesting two vertical scrolls.
//
// Teaching style: heavy, line-by-line comments — read it top to bottom.
// =============================================================================

package com.example.composecatalog

// --- Foundation: drawing + behavior modifiers, scrolling, shapes --------------
import androidx.compose.foundation.background                 // paint a color/shape behind content (draw-only)
import androidx.compose.foundation.clickable                  // make any composable respond to taps (real Compose only)
import androidx.compose.foundation.layout.Arrangement         // spacing BETWEEN children on the main axis
import androidx.compose.foundation.layout.Box                 // stacks/overlaps children on the z-axis
import androidx.compose.foundation.layout.Column              // stacks children VERTICALLY
import androidx.compose.foundation.layout.Row                 // places children HORIZONTALLY
import androidx.compose.foundation.layout.Spacer              // a fixed-size empty gap
import androidx.compose.foundation.layout.fillMaxSize         // take ALL width AND height
import androidx.compose.foundation.layout.fillMaxWidth        // take ALL available width
import androidx.compose.foundation.layout.height              // force a specific height
import androidx.compose.foundation.layout.padding             // add empty space AROUND content (layout/size modifier)
import androidx.compose.foundation.lazy.LazyColumn            // a vertically-scrolling list that composes only visible rows
import androidx.compose.foundation.lazy.items                 // emits one row per element of a List
import androidx.compose.foundation.rememberScrollState        // remembers scroll position across recomposition
import androidx.compose.foundation.shape.RoundedCornerShape   // a rounded-rectangle / pill shape
import androidx.compose.foundation.verticalScroll             // make a Column scroll vertically

// --- Material 3 components ----------------------------------------------------
import androidx.compose.material3.Button                      // filled, high-emphasis tappable button
import androidx.compose.material3.Card                        // rounded surface with a slight shadow
import androidx.compose.material3.HorizontalDivider           // thin horizontal rule
import androidx.compose.material3.MaterialTheme               // the theme's colors + typography
import androidx.compose.material3.OutlinedTextField           // an outlined text input
import androidx.compose.material3.Switch                      // a sliding on/off toggle
import androidx.compose.material3.Text                        // draws a string with a type style + color

// --- Compose runtime / state --------------------------------------------------
import androidx.compose.runtime.Composable                    // marks a function as one that EMITS UI
import androidx.compose.runtime.getValue                      // enables `by` READS of a State<T>
import androidx.compose.runtime.mutableStateOf                // observable state Compose watches
import androidx.compose.runtime.remember                      // remembers a value ACROSS recomposition
import androidx.compose.runtime.setValue                      // enables `by` WRITES to a MutableState<T>

// --- Compose UI / tooling -----------------------------------------------------
import androidx.compose.ui.Alignment                          // how to align children (cross axis / in a Box)
import androidx.compose.ui.Modifier                           // the "size / decorate / position" object
import androidx.compose.ui.draw.clip                          // clip content to a shape
import androidx.compose.ui.draw.shadow                        // cast a drop shadow (draw-only)
import androidx.compose.ui.graphics.Color                     // an ARGB color value
import androidx.compose.ui.text.font.FontWeight               // Normal, Medium, Bold …
import androidx.compose.ui.tooling.preview.Preview            // enables @Preview rendering in Android Studio
import androidx.compose.ui.unit.dp                            // density-independent pixel unit (16.dp)

import com.example.composecatalog.ui.theme.ComposeCatalogTheme // our Material 3 theme wrapper

// =============================================================================
// T1 — a Column with arrangement & alignment                            [Part A]
// -----------------------------------------------------------------------------
@Composable
fun T1PlanetColumn() {                                        // T1
    Column(
        // fillMaxWidth = take ALL horizontal space; padding(16) insets the whole column.
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        // verticalArrangement controls spacing on the MAIN axis (vertical for a Column).
        // spacedBy(8.dp) inserts an 8dp gap BETWEEN children (not before first / after last).
        verticalArrangement = Arrangement.spacedBy(8.dp),
        // T1 — CHANGE TO SEE IT: swap the line above for
        //   verticalArrangement = Arrangement.spacedBy(24.dp)
        // and ONLY THE GAPS GROW (8dp -> 24dp). The Texts/Button do not resize; the group
        // just spreads apart and gets taller. Arrangement spaces the main axis; it never
        // changes a child's own size.
        horizontalAlignment = Alignment.CenterHorizontally     // CROSS axis: center each child left-to-right
    ) {
        Text("Mercury", style = MaterialTheme.typography.titleLarge) // child 1
        Text("Closest to the Sun")                                   // child 2
        Text("88-day year")                                          // child 3
        Button(onClick = { /* no-op for the layout demo */ }) {      // child 4
            Text("Open")
        }
    }
}

// =============================================================================
// T2 — a Row that shares width with weight                              [Part A]
// -----------------------------------------------------------------------------
@Composable
fun T2WeightedRow() {                                         // T2 — the 1:2:1 version
    Row(
        modifier = Modifier
            .fillMaxWidth()                                  // the row spans the full width...
            .padding(16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)   // ...minus 8dp gaps between buttons
    ) {
        // weight(n) divides the LEFTOVER horizontal space in proportion to n.
        // 1 : 2 : 1  ->  A = 1/4, B = 2/4, C = 1/4 of the space remaining after the gaps.
        Button(onClick = {}, modifier = Modifier.weight(1f)) { Text("A") }
        Button(onClick = {}, modifier = Modifier.weight(2f)) { Text("B (wide)") }
        Button(onClick = {}, modifier = Modifier.weight(1f)) { Text("C") }
    }
}

@Composable
fun T2WeightedRowNoMiddle() {                                // T2 — the predict-then-run variant
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // PREDICTION (confirmed by running): B has NO weight now, so Compose measures it at
        // its natural content width FIRST. Whatever space is left is split EQUALLY between the
        // two weight(1f) buttons -> A and C become equal and noticeably WIDER, B shrinks to
        // hug its label. (Un-weighted children are measured first; weighted children share the rest.)
        Button(onClick = {}, modifier = Modifier.weight(1f)) { Text("A") }
        Button(onClick = {}) { Text("B (wide)") }            // no weight -> intrinsic width
        Button(onClick = {}, modifier = Modifier.weight(1f)) { Text("C") }
    }
}

// =============================================================================
// T3 — a Box that layers & aligns                                       [Part A]
// -----------------------------------------------------------------------------
@Composable
fun T3Banner() {                                             // T3
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(140.dp)                                 // fixed banner height
            .background(Color(0xFF22314A)),                 // tinted backdrop (draw-only)
        contentAlignment = Alignment.Center                 // DEFAULT placement for children without .align()
    ) {
        // No .align() -> this title inherits contentAlignment = Center.
        Text("Featured planet", color = Color.White)

        // .align(...) OVERRIDES the default for THIS child only. Box children stack on the
        // z-axis, so each badge floats OVER the title and is pinned to its own corner.
        Text(
            "NEW",
            color = Color.White,
            modifier = Modifier
                .align(Alignment.BottomEnd)                 // moved from TopEnd -> BottomEnd
                .padding(8.dp)
        )
        Text(
            "NEW",
            color = Color.White,
            modifier = Modifier
                .align(Alignment.TopStart)                  // second badge, opposite corner
                .padding(8.dp)
        )
        // T3 — WHY Box (not Row/Column): a badge must OVERLAP the content and sit in a corner.
        // Row/Column lay children out sequentially and never overlap, so a badge there would
        // push the title aside. Box stacks on the z-axis + lets each child align independently.
    }
}

// =============================================================================
// T7 — a counter (state & recomposition)                                [Part C]
// -----------------------------------------------------------------------------
@Composable
fun Counter() {                                             // T7
    // remember { } caches the value ACROSS recompositions; mutableStateOf makes it OBSERVABLE
    // (reading subscribes this composable; writing schedules a recomposition). `by` reads/writes
    // it like a normal var.
    var count by remember { mutableStateOf(0) }            // the single source of truth

    Column(
        modifier = Modifier.padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Count: $count", style = MaterialTheme.typography.headlineSmall) // re-reads on each recompose
        Spacer(Modifier.height(8.dp))
        Button(onClick = { count++ }) { Text("Add one") }   // mutate state -> recompose -> Text updates
        // T7 — PLAIN-VAR EXPLANATION: change the line above to `var count = 0` (no remember,
        // no state) and the number STAYS AT 0. Two reasons: (1) a plain var isn't snapshot
        // State, so mutating it never notifies Compose -> no recomposition; (2) even if a
        // recomposition happened, `var count = 0` re-initialises to 0 every run because there's
        // no remember to preserve it. You need BOTH: remember (survive) + mutableStateOf (trigger).
    }
}

// =============================================================================
// T8 — a real toggle that drives the UI (state hoisting)                [Part C]
// -----------------------------------------------------------------------------
@Composable
fun ToggleDemo() {                                          // T8 — STATEFUL: owns the state
    var on by remember { mutableStateOf(false) }           // the source of truth lives here

    Column(modifier = Modifier.padding(16.dp)) {
        // "state down, event up": pass the value DOWN, pass the change-handler UP.
        ToggleRow(checked = on, onCheckedChange = { on = it })

        // Something VISIBLE driven by the SAME state: an extra card appears only when ON.
        if (on) {
            Spacer(Modifier.height(12.dp))
            Card(modifier = Modifier.fillMaxWidth()) {
                Text(
                    "Notifications are enabled — you'll get alerts.",
                    modifier = Modifier.padding(16.dp)
                )
            }
        }
    }
}

@Composable
fun ToggleRow(                                              // STATELESS: owns NOTHING -> reusable + previewable
    checked: Boolean,                                      // value handed in from above
    onCheckedChange: (Boolean) -> Unit,                   // event handed back up
    modifier: Modifier = Modifier                          // convention: hoisted modifier, first optional param
) {
    Row(
        modifier = modifier.padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            if (checked) "Notifications: ON" else "Notifications: OFF",
            modifier = Modifier.weight(1f)                 // label takes the leftover width...
        )
        Switch(checked = checked, onCheckedChange = onCheckedChange) // ...switch sits at the end
    }
}

// =============================================================================
// T9 — a bound TextField (echo + character count)                       [Part C]
// -----------------------------------------------------------------------------
@Composable
fun NameField() {                                          // T9
    var name by remember { mutableStateOf("") }           // holds the current text (source of truth)

    Column(modifier = Modifier.padding(16.dp)) {
        OutlinedTextField(
            value = name,                                  // the field DISPLAYS state (state flows down)
            onValueChange = { name = it },                 // every keystroke writes state (event flows up)
            label = { Text("Your name") },
            singleLine = true
        )
        Spacer(Modifier.height(8.dp))
        // Re-reads `name`, so it recomposes on every keystroke alongside the field.
        Text("Hello, ${name.ifBlank { "stranger" }} (${name.length} chars)")
        // T9 — DATA-FLOW LOOP (unidirectional): type -> onValueChange -> state changes ->
        // recomposition -> the field AND this echo Text both show the new value. The field
        // never stores its own text; it is just a view of `name`.
    }
}

// =============================================================================
// T10 — capstone: an interactive planet screen                          [Part D]
// -----------------------------------------------------------------------------

// A tiny immutable model. `id` is the stable identity we key favorites by.
data class Planet(val id: Int, val name: String, val blurb: String)

private val planets = listOf(
    Planet(1, "Mercury", "Closest to the Sun · 88-day year"),
    Planet(2, "Venus",   "Hottest planet · thick CO₂ clouds"),
    Planet(3, "Earth",   "The only known living world"),
    Planet(4, "Mars",    "The red planet · home of Olympus Mons"),
    Planet(5, "Jupiter", "Largest planet · the Great Red Spot"),
    Planet(6, "Saturn",  "Ringed gas giant"),
)

@Composable
fun PlanetScreen() {                                       // T10 — owns the state
    // STATE THAT CHANGES THE UI: the set of favorited planet ids. We store a Set<Int> and
    // replace it with a NEW set on every toggle (assigning a new value is what triggers recompose).
    var favorites by remember { mutableStateOf(setOf<Int>()) }

    Column(
        modifier = Modifier
            .fillMaxWidth()                               // outer column spans the width  (size)
            .padding(16.dp)                               // ...with a 16dp inset          (size)
    ) {
        // --- Banner Box (from T3): centered title + corner badge showing the live count ---
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp)
                .clip(RoundedCornerShape(16.dp))          // round corners FIRST (so the fill is rounded)
                .background(Color(0xFF22314A)),           // draw-only fill behind the content
            contentAlignment = Alignment.Center           // default placement = centered title
        ) {
            Text(
                "Solar System",
                color = Color.White,
                style = MaterialTheme.typography.headlineSmall
            )
            // Corner badge — RE-READS favorites.size so it updates live. Note the modifier
            // ORDER (Part B): position -> clip -> fill -> inner text padding.
            Text(
                "★ ${favorites.size}",
                color = Color(0xFF0F172A),
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(8.dp)                         // gap from the corner
                    .clip(RoundedCornerShape(50))          // pill shape
                    .background(Color(0xFFFFD54F))         // gold fill, respects the clip
                    .padding(horizontal = 8.dp, vertical = 4.dp) // text breathing room INSIDE the pill
            )
        }

        Spacer(Modifier.height(12.dp))                    // required Spacer
        HorizontalDivider()                               // required HorizontalDivider
        Spacer(Modifier.height(4.dp))

        // --- The list: LazyColumn composes only the rows that are visible ---
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(planets, key = { it.id }) { planet ->    // stable keys help recomposition/scrolling
                PlanetRow(
                    planet = planet,
                    isFavorite = planet.id in favorites,   // value DOWN
                    onToggleFavorite = {                   // event UP
                        // produce a NEW set (don't mutate in place) so Compose sees the change
                        favorites = if (planet.id in favorites)
                            favorites - planet.id
                        else
                            favorites + planet.id
                    }
                )
            }
        }
    }
}

@Composable
fun PlanetRow(                                            // extracted, reusable, STATELESS row
    planet: Planet,
    isFavorite: Boolean,                                  // state in (hoisted up to PlanetScreen)
    onToggleFavorite: () -> Unit,                         // event out
    modifier: Modifier = Modifier                         // convention: hoisted modifier, first optional param
) {
    Card(
        modifier = modifier
            .fillMaxWidth()                              // size-affecting modifier (T6)
            .shadow(4.dp, RoundedCornerShape(12.dp))     // draw-only modifier      (T6)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Title + blurb take the leftover width via weight, pushing the star to the end.
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    planet.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(planet.blurb, style = MaterialTheme.typography.bodyMedium)
            }
            // The star is the interactive bit: tapping it sends the event up, which rewrites
            // `favorites`, which recomposes the badge AND this row.
            Text(
                text = if (isFavorite) "★" else "☆",
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier
                    .clickable { onToggleFavorite() }    // real click handling (emulator only)
                    .padding(8.dp)                       // larger, comfier tap target
            )
        }
    }
}

// =============================================================================
// RUNTIME HOST — a tiny selector so every task is reachable on the emulator.
// (T1–T9 live in a verticalScroll Column; T10 owns its own LazyColumn, so we
//  switch between them rather than nesting two vertical scrolls — which would
//  throw an "infinite height" measure error.)
// =============================================================================

@Composable
private fun TaskHeader(label: String) {                  // a small labelled separator
    Spacer(Modifier.height(16.dp))
    Text(label, style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
    HorizontalDivider()
}

@Composable
fun WidgetTasks() {                                       // T1–T9 stacked in one scroll
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
    ) {
        TaskHeader("T1 — Column: arrangement & alignment"); T1PlanetColumn()
        TaskHeader("T2 — Row: weight 1 : 2 : 1");           T2WeightedRow()
        TaskHeader("T2 — Row: middle button un-weighted");  T2WeightedRowNoMiddle()
        TaskHeader("T3 — Box: layer & align (two badges)"); T3Banner()
        TaskHeader("T7 — Counter (state & recomposition)"); Counter()
        TaskHeader("T8 — Toggle (state hoisting)");         ToggleDemo()
        TaskHeader("T9 — Bound TextField (echo + count)");  NameField()
        Spacer(Modifier.height(24.dp))
    }
}

@Composable
fun Hw4CatalogSolutionsApp() {
    // A two-button "tab bar" picks which screen to show. `tab` is itself remembered state,
    // so tapping a button recomposes and swaps the body — another small state demo.
    var tab by remember { mutableStateOf(0) }
    Column(modifier = Modifier.fillMaxSize()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(onClick = { tab = 0 }, modifier = Modifier.weight(1f)) { Text("T1–T9") }
            Button(onClick = { tab = 1 }, modifier = Modifier.weight(1f)) { Text("T10 Capstone") }
        }
        HorizontalDivider()
        when (tab) {
            0 -> WidgetTasks()                            // the non-lazy tasks, scrollable
            else -> PlanetScreen()                        // the capstone owns its LazyColumn
        }
    }
}

// =============================================================================
// @Preview functions — inspect each task in the Android Studio design pane.
// =============================================================================

@Preview(name = "T1 Column", showBackground = true, widthDp = 360)
@Composable
fun T1Preview() { ComposeCatalogTheme { T1PlanetColumn() } }

@Preview(name = "T2 Row 1:2:1", showBackground = true, widthDp = 360)
@Composable
fun T2Preview() { ComposeCatalogTheme { T2WeightedRow() } }

@Preview(name = "T2 Row no-middle", showBackground = true, widthDp = 360)
@Composable
fun T2NoMiddlePreview() { ComposeCatalogTheme { T2WeightedRowNoMiddle() } }

@Preview(name = "T3 Banner", showBackground = true, widthDp = 360)
@Composable
fun T3Preview() { ComposeCatalogTheme { T3Banner() } }

@Preview(name = "T7 Counter", showBackground = true, widthDp = 360)
@Composable
fun T7Preview() { ComposeCatalogTheme { Counter() } }

@Preview(name = "T8 Toggle OFF", showBackground = true, widthDp = 360)
@Composable
fun T8OffPreview() { ComposeCatalogTheme { ToggleRow(checked = false, onCheckedChange = {}) } }

@Preview(name = "T8 Toggle ON", showBackground = true, widthDp = 360)
@Composable
fun T8OnPreview() { ComposeCatalogTheme { ToggleRow(checked = true, onCheckedChange = {}) } }

@Preview(name = "T9 NameField", showBackground = true, widthDp = 360)
@Composable
fun T9Preview() { ComposeCatalogTheme { NameField() } }

@Preview(name = "T10 Capstone", showBackground = true, widthDp = 360, heightDp = 640)
@Composable
fun T10Preview() { ComposeCatalogTheme { PlanetScreen() } }
