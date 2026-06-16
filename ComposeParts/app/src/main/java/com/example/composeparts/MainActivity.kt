// =============================================================================
// MainActivity.kt
//
// CONCEPT: "COMPOSE PARTS" — an INTERACTIVE reference for the layout knobs you
// reach for constantly: PADDING, SPACING (Arrangement), ALIGNMENT, and SIZE.
//
// Unlike a static cheat-sheet, every example here is LIVE: drag a slider or tap a
// choice chip and BOTH the Kotlin code AND the rendered result update in real
// time. So you can "feel" what padding(24.dp) vs padding(8.dp) does, flip an
// Arrangement, or change an Alignment, and watch the layout react on the device.
//
// LAYOUT OF THE APP:
//   • A TabRow across the top: Padding · Spacing · Alignment · Size.
//   • Each tab is a scrolling list of example cards.
//   • Each card = title + note + interactive CONTROLS + the live CODE + the live
//     RESULT (a framed preview).
//
// READING ORDER:
//   1. Demo colors.
//   2. Reusable controls (IntSlider, ChoicePicker) + the ExampleFrame card.
//   3. The example composables, grouped by tab (each owns its own state).
//   4. The tab lists, PartsScreen (Scaffold + TabRow + list), and MainActivity.
// =============================================================================
package com.example.composeparts

// --- Android framework --------------------------------------------------------
import android.os.Bundle                                     // savedInstanceState type passed to onCreate
import androidx.activity.ComponentActivity                   // base Activity that can host a Compose UI
import androidx.activity.compose.setContent                  // installs a Compose UI tree as the Activity content
import androidx.activity.enableEdgeToEdge                    // draw behind the system bars for a modern look

// --- Compose foundation: layout, scrolling, drawing, lists --------------------
import androidx.compose.foundation.background                // modifier: paint a color/shape behind content
import androidx.compose.foundation.horizontalScroll          // modifier: let a wide code line / chip row scroll sideways
import androidx.compose.foundation.layout.Arrangement        // spacing BETWEEN children on the main axis
import androidx.compose.foundation.layout.Box                // overlap/stack children on the z-axis
import androidx.compose.foundation.layout.Column             // stack children vertically
import androidx.compose.foundation.layout.Row                // place children horizontally
import androidx.compose.foundation.layout.Spacer             // an empty, fixed-size gap
import androidx.compose.foundation.layout.fillMaxHeight      // modifier: take all available height
import androidx.compose.foundation.layout.fillMaxSize        // modifier: take all width AND height
import androidx.compose.foundation.layout.fillMaxWidth       // modifier: take all (or a fraction of) width
import androidx.compose.foundation.layout.height             // modifier: force a specific height
import androidx.compose.foundation.layout.padding            // modifier: add empty space AROUND content
import androidx.compose.foundation.layout.size               // modifier: force a specific width AND height
import androidx.compose.foundation.layout.width              // modifier: force a specific width
import androidx.compose.foundation.lazy.LazyColumn           // a scrolling list that only composes visible rows
import androidx.compose.foundation.lazy.items                // emit one row per element of a List in a LazyColumn
import androidx.compose.foundation.rememberScrollState       // remembers a scroll position across recomposition
import androidx.compose.foundation.verticalScroll            // modifier: make a Column scroll vertically
import androidx.compose.foundation.shape.RoundedCornerShape  // a rounded-rectangle shape

// --- Material 3 ---------------------------------------------------------------
import androidx.compose.material3.ExperimentalMaterial3Api   // opt-in marker for TopAppBar (still-evolving API)
import androidx.compose.material3.FilterChip                 // a toggleable chip (used as a single-choice option)
import androidx.compose.material3.MaterialTheme              // the theme's colorScheme + typography
import androidx.compose.material3.OutlinedCard               // a card drawn with an outline
import androidx.compose.material3.Scaffold                   // standard screen frame (top bar + insets)
import androidx.compose.material3.ScrollableTabRow           // the secondary (per-example) scrollable tab row
import androidx.compose.material3.Slider                     // a draggable control for a numeric value
import androidx.compose.material3.Surface                    // a themed background container
import androidx.compose.material3.Tab                        // one tab button inside a TabRow
import androidx.compose.material3.Text                       // draws a string
import androidx.compose.material3.TopAppBar                  // the title bar across the top

// --- Compose runtime / state --------------------------------------------------
import androidx.compose.runtime.Composable                   // marks a function/lambda as emitting UI
import androidx.compose.runtime.getValue                     // `by` delegate READS of a State<T>
import androidx.compose.runtime.mutableIntStateOf            // observable Int state
import androidx.compose.runtime.remember                     // remember a value across recomposition
import androidx.compose.runtime.setValue                     // `by` delegate WRITES to a MutableState<T>

// --- Compose UI ---------------------------------------------------------------
import androidx.compose.ui.Alignment                         // how children align (Center, TopStart, …)
import androidx.compose.ui.Modifier                          // the "how to size/decorate/position" object
import androidx.compose.ui.draw.clip                          // modifier: clip content to a shape (rounded corners)
import androidx.compose.ui.graphics.Color                    // an ARGB color value
import androidx.compose.ui.text.font.FontFamily              // typeface (Monospace for the code block)
import androidx.compose.ui.text.font.FontWeight              // bold/normal weight (used in the layout overview + Scaffold mock)
import androidx.compose.ui.tooling.preview.Preview           // @Preview rendering in Android Studio
import androidx.compose.ui.unit.dp                           // density-independent pixels (16.dp)
import androidx.compose.ui.unit.em                           // relative text unit (letterSpacing) — fraction of font size
import androidx.compose.ui.unit.sp                           // scale-independent pixels for font sizes (12.sp)

import com.example.composeparts.ui.theme.ComposePartsTheme   // our Material 3 theme wrapper
import kotlin.math.roundToInt                                // turn a Slider's Float into a whole dp value

// ===========================================================================
// DEMO COLORS — bold, fixed colors so the layout demos are easy to see. The same
// hex literals appear in the code strings shown to you, so what you read matches.
// ===========================================================================
private val Blue = Color(0xFF2563EB)
private val Green = Color(0xFF0F9D58)
private val Orange = Color(0xFFE8730C)

// ===========================================================================
// REUSABLE CONTROLS
// ===========================================================================

/**
 * IntSlider — a labelled slider bound to a whole-number value (dp, %, weight…).
 * The caller formats [labelText] with the live value (e.g. "padding = 24.dp"),
 * and the slider snaps to integers across [range].
 */
@Composable
private fun IntSlider(labelText: String, value: Int, range: IntRange, onValue: (Int) -> Unit) {
    Column {
        Text(labelText, style = MaterialTheme.typography.labelLarge)
        Slider(
            value = value.toFloat(),
            onValueChange = { onValue(it.roundToInt()) },     // round the Float back to a whole dp
            valueRange = range.first.toFloat()..range.last.toFloat(),
            // `steps` = stops BETWEEN the ends, so the thumb snaps to each integer.
            steps = (range.last - range.first - 1).coerceAtLeast(0),
        )
    }
}

/**
 * ChoicePicker — a single-choice row of chips for enum-like options (Arrangement,
 * Alignment…). The selected index is highlighted; tapping one reports it back.
 * The row scrolls sideways if the options don't fit.
 */
@Composable
private fun ChoicePicker(label: String, options: List<String>, selected: Int, onSelect: (Int) -> Unit) {
    Column {
        Text(label, style = MaterialTheme.typography.labelLarge)
        Row(
            modifier = Modifier.horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            options.forEachIndexed { i, opt ->
                FilterChip(selected = selected == i, onClick = { onSelect(i) }, label = { Text(opt) })
            }
        }
    }
}

/**
 * CodeBlock — a Kotlin snippet on a dark, monospaced surface (like an IDE editor).
 * Lines SOFT-WRAP so nothing is ever cut off the right edge — a wrapped line is
 * continued (slightly indented) on the next line. The small monospace size keeps
 * most lines on one row.
 */
@Composable
private fun CodeBlock(code: String, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        color = Color(0xFF0F172A),
        shape = RoundedCornerShape(10.dp),
    ) {
        Text(
            text = code,
            color = Color(0xFFE6EDF6),
            fontFamily = FontFamily.Monospace,
            fontSize = 11.sp,
            lineHeight = 16.sp,
            softWrap = true,                                  // wrap long lines instead of clipping them
            modifier = Modifier.fillMaxWidth().padding(12.dp),
        )
    }
}

/**
 * ExampleFrame — the shared card for every example: title + note, the interactive
 * CONTROLS, the live CODE, and the live RESULT in a framed preview. Each example
 * composable owns its own state and hands its current code/controls/result here.
 */
@Composable
private fun ExampleFrame(
    title: String,
    note: String,
    code: String,
    controls: @Composable () -> Unit,
    result: @Composable () -> Unit,
) {
    OutlinedCard(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(title, style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
            Text(note, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            controls()                                        // sliders / choice chips

            // RESULT comes right under the controls, so when you drag a slider you
            // SEE the effect immediately — the code reference sits below it.
            Text("Result", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Surface(color = MaterialTheme.colorScheme.surfaceVariant, shape = RoundedCornerShape(10.dp), modifier = Modifier.fillMaxWidth()) {
                Box(modifier = Modifier.fillMaxWidth().padding(14.dp)) { result() }
            }

            Text("Code", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            CodeBlock(code)                                   // reflects the live values
        }
    }
}

// A small reusable colored tile for layout demos.
@Composable
private fun Tile(color: Color, w: Int = 40, h: Int = 40) {
    Box(modifier = Modifier.size(width = w.dp, height = h.dp).background(color))
}

// ===========================================================================
// TAB 1 — PADDING (interactive)
// ===========================================================================

@Composable
private fun PaddingAllSides() {
    var p by remember { mutableIntStateOf(16) }               // the padding amount, in dp
    ExampleFrame(
        title = "All sides",
        note = "padding(n.dp) adds the same gap on every side. Drag to change it — the blue shows the space around the text.",
        code = "Modifier.padding($p.dp)",
        controls = { IntSlider("padding = $p.dp", p, 0..48) { p = it } },
    ) {
        Box(modifier = Modifier.background(Blue)) {
            Text("hi", color = Color.White, modifier = Modifier.padding(p.dp))
        }
    }
}

@Composable
private fun PaddingPerAxis() {
    var h by remember { mutableIntStateOf(24) }
    var v by remember { mutableIntStateOf(8) }
    ExampleFrame(
        title = "Per axis",
        note = "Give the horizontal and vertical sides different amounts in one call.",
        code = """
            Modifier.padding(horizontal = $h.dp, vertical = $v.dp)
        """.trimIndent(),
        controls = {
            IntSlider("horizontal = $h.dp", h, 0..48) { h = it }
            IntSlider("vertical = $v.dp", v, 0..48) { v = it }
        },
    ) {
        Box(modifier = Modifier.background(Green)) {
            Text("h / v", color = Color.White, modifier = Modifier.padding(horizontal = h.dp, vertical = v.dp))
        }
    }
}

@Composable
private fun PaddingOrder() {
    var bgFirst by remember { mutableIntStateOf(0) }          // 0 = background→padding, 1 = padding→background
    var p by remember { mutableIntStateOf(16) }
    val backgroundFirst = bgFirst == 0
    ExampleFrame(
        title = "Order matters: background vs padding",
        note = "A Modifier chain is ordered. Flip the order and watch the blue move: background→padding shows blue AROUND the text; padding→background makes the blue HUG the text.",
        code = if (backgroundFirst)
            "Modifier.background(Color(0xFF2563EB)).padding($p.dp)"
        else
            "Modifier.padding($p.dp).background(Color(0xFF2563EB))",
        controls = {
            ChoicePicker("order", listOf("background → padding", "padding → background"), bgFirst) { bgFirst = it }
            IntSlider("padding = $p.dp", p, 0..40) { p = it }
        },
    ) {
        val mod = if (backgroundFirst) Modifier.background(Blue).padding(p.dp)
        else Modifier.padding(p.dp).background(Blue)
        Box(modifier = mod) { Text("text", color = Color.White) }
    }
}

// ===========================================================================
// TAB 2 — SPACING (interactive)
// ===========================================================================

@Composable
private fun SpacingColumn() {
    var gap by remember { mutableIntStateOf(8) }
    ExampleFrame(
        title = "Column · spacedBy",
        note = "Arrangement.spacedBy(n) puts an even gap between every child — no manual Spacers.",
        code = "Column(verticalArrangement = Arrangement.spacedBy($gap.dp)) { … }",
        controls = { IntSlider("spacedBy = $gap.dp", gap, 0..40) { gap = it } },
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(gap.dp)) {
            Text("first"); Text("second"); Text("third")
        }
    }
}

private val ROW_ARRANGEMENTS = listOf("spacedBy", "SpaceBetween", "SpaceAround", "SpaceEvenly", "Center", "Start", "End")

@Composable
private fun SpacingRowArrangement() {
    var which by remember { mutableIntStateOf(1) }            // default SpaceBetween
    var gap by remember { mutableIntStateOf(8) }
    // Resolve the chosen Arrangement.Horizontal + the matching code text.
    val arrangement = when (which) {
        0 -> Arrangement.spacedBy(gap.dp)
        1 -> Arrangement.SpaceBetween
        2 -> Arrangement.SpaceAround
        3 -> Arrangement.SpaceEvenly
        4 -> Arrangement.Center
        5 -> Arrangement.Start
        else -> Arrangement.End
    }
    val arrCode = if (which == 0) "Arrangement.spacedBy($gap.dp)" else "Arrangement.${ROW_ARRANGEMENTS[which]}"
    ExampleFrame(
        title = "Row · horizontalArrangement",
        note = "How the tiles spread along the row. SpaceBetween/Around/Evenly need fillMaxWidth so there is leftover space to distribute.",
        code = "Row(Modifier.fillMaxWidth(), horizontalArrangement = $arrCode) { … }",
        controls = {
            ChoicePicker("arrangement", ROW_ARRANGEMENTS, which) { which = it }
            if (which == 0) IntSlider("gap = $gap.dp", gap, 0..40) { gap = it }
        },
    ) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = arrangement) {
            Tile(Blue); Tile(Green); Tile(Orange)
        }
    }
}

@Composable
private fun SpacingSpacer() {
    var w by remember { mutableIntStateOf(24) }
    ExampleFrame(
        title = "Spacer",
        note = "A Spacer is an empty, fixed-size element — drop one in to push neighbours apart by an exact amount.",
        code = "Spacer(Modifier.width($w.dp))",
        controls = { IntSlider("Spacer width = $w.dp", w, 0..80) { w = it } },
    ) {
        Row {
            Tile(Blue)
            Spacer(modifier = Modifier.width(w.dp))
            Tile(Green)
        }
    }
}

// ===========================================================================
// TAB 3 — ALIGNMENT (interactive)
// ===========================================================================

private val COLUMN_ALIGN = listOf("Start", "CenterHorizontally", "End")

@Composable
private fun AlignColumn() {
    var a by remember { mutableIntStateOf(1) }
    val align = when (a) { 0 -> Alignment.Start; 1 -> Alignment.CenterHorizontally; else -> Alignment.End }
    ExampleFrame(
        title = "Column · horizontalAlignment",
        note = "In a Column the cross axis is horizontal, so horizontalAlignment moves children left ↔ right.",
        code = "Column(horizontalAlignment = Alignment.${COLUMN_ALIGN[a]}) { … }",
        controls = { ChoicePicker("horizontalAlignment", COLUMN_ALIGN, a) { a = it } },
    ) {
        Column(modifier = Modifier.fillMaxWidth(), horizontalAlignment = align) {
            Text("one"); Text("two")
        }
    }
}

private val ROW_ALIGN = listOf("Top", "CenterVertically", "Bottom")

@Composable
private fun AlignRow() {
    var a by remember { mutableIntStateOf(1) }
    val align = when (a) { 0 -> Alignment.Top; 1 -> Alignment.CenterVertically; else -> Alignment.Bottom }
    ExampleFrame(
        title = "Row · verticalAlignment",
        note = "In a Row the cross axis is vertical, so verticalAlignment lines up children of different heights.",
        code = "Row(verticalAlignment = Alignment.${ROW_ALIGN[a]}) { … }",
        controls = { ChoicePicker("verticalAlignment", ROW_ALIGN, a) { a = it } },
    ) {
        Row(modifier = Modifier.fillMaxWidth().height(64.dp), verticalAlignment = align) {
            Tile(Blue, 24, 24); Spacer(Modifier.width(8.dp)); Tile(Green, 48, 48)
        }
    }
}

private val VERT = listOf("Top", "Center", "Bottom")
private val HORIZ = listOf("Start", "Center", "End")

// Map a (vertical, horizontal) choice to the 2-D Alignment Box uses.
private fun boxAlign(v: Int, h: Int): Alignment = when (v) {
    0 -> when (h) { 0 -> Alignment.TopStart; 1 -> Alignment.TopCenter; else -> Alignment.TopEnd }
    1 -> when (h) { 0 -> Alignment.CenterStart; 1 -> Alignment.Center; else -> Alignment.CenterEnd }
    else -> when (h) { 0 -> Alignment.BottomStart; 1 -> Alignment.BottomCenter; else -> Alignment.BottomEnd }
}
// Its Kotlin name, e.g. "TopStart" — but the dead-center one is just "Center".
private fun boxAlignName(v: Int, h: Int): String = if (v == 1 && h == 1) "Center" else VERT[v] + HORIZ[h]

@Composable
private fun AlignBox() {
    var v by remember { mutableIntStateOf(1) }
    var h by remember { mutableIntStateOf(1) }
    ExampleFrame(
        title = "Box · contentAlignment",
        note = "A Box aligns its content in two dimensions at once. Pick a vertical and a horizontal anchor.",
        code = "Box(contentAlignment = Alignment.${boxAlignName(v, h)}) { … }",
        controls = {
            ChoicePicker("vertical", VERT, v) { v = it }
            ChoicePicker("horizontal", HORIZ, h) { h = it }
        },
    ) {
        Box(modifier = Modifier.fillMaxWidth().height(120.dp).background(Blue), contentAlignment = boxAlign(v, h)) {
            Text("here", color = Color.White)
        }
    }
}

// ===========================================================================
// TAB 4 — SIZE (interactive)
// ===========================================================================

@Composable
private fun SizeFixed() {
    var s by remember { mutableIntStateOf(64) }
    ExampleFrame(
        title = "Fixed size",
        note = "size(n) fixes both width and height to the same value.",
        code = "Modifier.size($s.dp)",
        controls = { IntSlider("size = $s.dp", s, 24..160) { s = it } },
    ) {
        Box(modifier = Modifier.size(s.dp).background(Blue))
    }
}

@Composable
private fun SizeFill() {
    var pct by remember { mutableIntStateOf(50) }
    val fraction = pct / 100f
    ExampleFrame(
        title = "fillMaxWidth(fraction)",
        note = "fillMaxWidth() takes ALL the width; pass a fraction (0f..1f) to take part of it.",
        code = "Modifier.fillMaxWidth(${"%.2f".format(fraction)}f)",
        controls = { IntSlider("fraction = $pct%", pct, 10..100) { pct = it } },
    ) {
        Box(modifier = Modifier.fillMaxWidth(fraction).height(24.dp).background(Green))
    }
}

@Composable
private fun SizeWeight() {
    var w1 by remember { mutableIntStateOf(1) }
    var w2 by remember { mutableIntStateOf(2) }
    ExampleFrame(
        title = "weight",
        note = "Inside a Row/Column, weight(n) divides the LEFTOVER space by ratio. Change the two weights and watch the tiles re-share the row; the 48.dp tile is fixed.",
        code = "Box(Modifier.weight(${w1}f))\nBox(Modifier.weight(${w2}f))\nBox(Modifier.width(48.dp))",
        controls = {
            IntSlider("first weight = ${w1}f", w1, 1..5) { w1 = it }
            IntSlider("second weight = ${w2}f", w2, 1..5) { w2 = it }
        },
    ) {
        Row(modifier = Modifier.fillMaxWidth().height(48.dp)) {
            Box(modifier = Modifier.weight(w1.toFloat()).fillMaxHeight().background(Blue))
            Box(modifier = Modifier.weight(w2.toFloat()).fillMaxHeight().background(Green))
            Box(modifier = Modifier.width(48.dp).fillMaxHeight().background(Orange))
        }
    }
}

// ===========================================================================
// TAB 5 — UNITS: dp is for layout, but TEXT uses sp (and em), and dp also sizes
// things like corner radius. Drag to feel each unit.
// ===========================================================================

@Composable
private fun UnitsFontSize() {
    var s by remember { mutableIntStateOf(18) }
    ExampleFrame(
        title = "Font size · sp",
        note = "Text sizes use sp, NOT dp. sp is density-independent AND scales with the user's system font-size (accessibility) setting — so always use it for fontSize.",
        code = "Text(\"Aa\", fontSize = $s.sp)",
        controls = { IntSlider("fontSize = $s.sp", s, 10..48) { s = it } },
    ) {
        Text("Aa 123 ★ Planets", fontSize = s.sp)
    }
}

@Composable
private fun UnitsLineHeight() {
    var lh by remember { mutableIntStateOf(22) }
    ExampleFrame(
        title = "Line height · sp",
        note = "lineHeight — the vertical space per line of text — is also in sp. Increase it to spread wrapped lines apart.",
        code = "Text(text, lineHeight = $lh.sp)",
        controls = { IntSlider("lineHeight = $lh.sp", lh, 14..48) { lh = it } },
    ) {
        Text(
            "Mercury, Venus, Earth, Mars, Jupiter and Saturn — the planets used throughout this app.",
            fontSize = 15.sp,
            lineHeight = lh.sp,
        )
    }
}

@Composable
private fun UnitsLetterSpacing() {
    var n by remember { mutableIntStateOf(0) }                // hundredths of an em
    val e = n / 100f
    ExampleFrame(
        title = "Letter spacing · em",
        note = "em is RELATIVE to the current font size: 0.10.em = 10% of the font size. Because it scales with the text, tracking stays proportional.",
        code = "Text(\"PLANETS\", letterSpacing = ${"%.2f".format(e)}.em)",
        controls = { IntSlider("letterSpacing = ${"%.2f".format(e)}.em", n, 0..40) { n = it } },
    ) {
        Text("PLANETS", fontSize = 22.sp, letterSpacing = e.em)
    }
}

@Composable
private fun UnitsCornerRadius() {
    var r by remember { mutableIntStateOf(12) }
    ExampleFrame(
        title = "Corner radius · dp",
        note = "dp isn't only width & height — it also measures corner radius, border width, elevation and offsets. Here it rounds a clipped box.",
        code = "Modifier.clip(RoundedCornerShape($r.dp))",
        controls = { IntSlider("radius = $r.dp", r, 0..40) { r = it } },
    ) {
        Box(modifier = Modifier.size(80.dp).clip(RoundedCornerShape(r.dp)).background(Blue))
    }
}

// ===========================================================================
// TAB 0 — LAYOUTS: WHICH container to reach for (the decision), then one example
// of each. This is the "Column vs Row vs LazyColumn vs Box vs Scaffold" guide.
// ===========================================================================

// A few planet names for the LazyColumn demo.
private val PLANETS = listOf(
    "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn",
    "Uranus", "Neptune", "Ceres", "Pluto", "Eris", "Makemake",
)

// One row of the decision table: the container name + when to reach for it.
@Composable
private fun ChooseRow(container: String, useWhen: String) {
    Column {
        Text(container, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        Text(useWhen, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun LayoutsOverview() {
    OutlinedCard(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("Which container?", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
            Text("Pick the one that matches your need — then open its tab for a live demo.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            ChooseRow("Column", "A few items stacked vertically. Composes ALL children — add Modifier.verticalScroll(…) if it might overflow.")
            ChooseRow("Row", "A few items side by side (icon + label, a button bar). Also composes all children.")
            ChooseRow("LazyColumn / LazyRow", "A long or data-driven SCROLLING list — only the visible rows compose (fast). Use items(list).")
            ChooseRow("Box", "Overlap children on the z-axis, or center / position one. Each child can use Modifier.align(…).")
            ChooseRow("Scaffold", "The standard SCREEN skeleton: topBar / bottomBar / FAB slots + innerPadding. Put a Column or LazyColumn inside it.")
        }
    }
}

@Composable
private fun LayoutColumnEx() {
    ExampleFrame(
        title = "Column — a few items, vertical",
        note = "Use when you have a SMALL, fixed set of items to stack vertically. A Column composes all of them at once (no laziness); add Modifier.verticalScroll(rememberScrollState()) if the content could be taller than the screen.",
        code = "Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {\n    Text(\"first\"); Text(\"second\"); Text(\"third\")\n}",
        controls = {},
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("first"); Text("second"); Text("third")
        }
    }
}

@Composable
private fun LayoutRowEx() {
    ExampleFrame(
        title = "Row — a few items, horizontal",
        note = "Use for a few items side by side — an icon + label, or a button bar. Like Column it composes all children; if you have MANY, use a LazyRow instead.",
        code = "Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {\n    /* a few tiles */\n}",
        controls = {},
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Tile(Blue); Tile(Green); Tile(Orange)
        }
    }
}

@Composable
private fun LayoutLazyEx() {
    ExampleFrame(
        title = "LazyColumn — long / scrolling list",
        note = "Use for a LONG or data-driven list. Unlike a Column, a LazyColumn only composes the rows currently on screen, so it stays fast for hundreds of items. Use items(list) { } with a stable key. (Don't nest one inside a vertical-scroll parent without a fixed height.)",
        code = "LazyColumn {\n    items(planets) { name -> Text(name) }\n}",
        controls = {},
    ) {
        // Fixed height so this scrolls INSIDE the card (and has bounded constraints).
        LazyColumn(modifier = Modifier.fillMaxWidth().height(150.dp)) {
            items(PLANETS) { name ->
                Text(name, modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp))
            }
        }
    }
}

@Composable
private fun LayoutBoxEx() {
    ExampleFrame(
        title = "Box — overlap / center",
        note = "Use to layer children on the z-axis or center one. Each child positions itself with Modifier.align(…). Classic uses: a badge/dot on an avatar, text over an image, or centering content.",
        code = "Box {\n    /* avatar */\n    Box(Modifier.align(Alignment.BottomEnd)) { /* online dot */ }\n}",
        controls = {},
    ) {
        Box {
            Box(modifier = Modifier.size(56.dp).clip(RoundedCornerShape(12.dp)).background(Blue))            // avatar
            Box(modifier = Modifier.size(16.dp).clip(RoundedCornerShape(8.dp)).background(Green).align(Alignment.BottomEnd)) // online dot
        }
    }
}

@Composable
private fun LayoutScaffoldEx() {
    ExampleFrame(
        title = "Scaffold — the screen skeleton",
        note = "Use as the ROOT of a screen. It gives you slots for topBar / bottomBar / floatingActionButton and an innerPadding that keeps your content clear of the system bars. Put your Column or LazyColumn inside its content lambda. (Below is an illustration of the slots.)",
        code = "Scaffold(\n    topBar = { TopAppBar(title = { Text(\"Title\") }) },\n    floatingActionButton = { FloatingActionButton(onClick = {}) { Text(\"+\") } },\n) { innerPadding ->\n    Column(Modifier.padding(innerPadding)) { /* screen content */ }\n}",
        controls = {},
    ) {
        // A small mock illustrating the slots (not a real nested Scaffold).
        Column(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp))) {
            Box(modifier = Modifier.fillMaxWidth().height(34.dp).background(Blue), contentAlignment = Alignment.CenterStart) {
                Text("  topBar", color = Color.White, style = MaterialTheme.typography.labelLarge)
            }
            Box(modifier = Modifier.fillMaxWidth().height(70.dp).background(MaterialTheme.colorScheme.surfaceVariant), contentAlignment = Alignment.Center) {
                Text("content (innerPadding applied)", style = MaterialTheme.typography.bodySmall)
            }
            Row(modifier = Modifier.fillMaxWidth().padding(8.dp), horizontalArrangement = Arrangement.End) {
                Box(modifier = Modifier.size(36.dp).clip(RoundedCornerShape(10.dp)).background(Orange), contentAlignment = Alignment.Center) {
                    Text("+", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

// ===========================================================================
// TAB MODEL — each tab is a label + a list of example composables.
// ===========================================================================
// One example = a short name (for the sub-tab) + the composable that renders it.
private data class Example(val name: String, val content: @Composable () -> Unit)

// One topic tab = a label + its named examples (shown via a sub-tab row).
private data class TabSpec(val label: String, val examples: List<Example>)

private val TABS = listOf(
    TabSpec("Layouts", listOf(
        Example("Overview") { LayoutsOverview() },
        Example("Column") { LayoutColumnEx() },
        Example("Row") { LayoutRowEx() },
        Example("LazyColumn") { LayoutLazyEx() },
        Example("Box") { LayoutBoxEx() },
        Example("Scaffold") { LayoutScaffoldEx() },
    )),
    TabSpec("Padding", listOf(
        Example("All sides") { PaddingAllSides() },
        Example("Per axis") { PaddingPerAxis() },
        Example("Order") { PaddingOrder() },
    )),
    TabSpec("Spacing", listOf(
        Example("Column") { SpacingColumn() },
        Example("Row") { SpacingRowArrangement() },
        Example("Spacer") { SpacingSpacer() },
    )),
    TabSpec("Alignment", listOf(
        Example("Column") { AlignColumn() },
        Example("Row") { AlignRow() },
        Example("Box") { AlignBox() },
    )),
    TabSpec("Size", listOf(
        Example("Fixed") { SizeFixed() },
        Example("fillMaxWidth") { SizeFill() },
        Example("weight") { SizeWeight() },
    )),
    TabSpec("Units", listOf(
        Example("Font size") { UnitsFontSize() },
        Example("Line height") { UnitsLineHeight() },
        Example("Letter spacing") { UnitsLetterSpacing() },
        Example("Corner radius") { UnitsCornerRadius() },
    )),
)

/**
 * PartsScreen — the whole app, with TWO levels of tabs so you follow ONE example
 * at a time instead of scrolling a long stack:
 *   • a primary TabRow picks the TOPIC (Padding / Spacing / Alignment / Size);
 *   • a secondary ScrollableTabRow picks WHICH example within that topic;
 *   • only the selected example is shown below (scrollable if it's tall).
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PartsScreen(modifier: Modifier = Modifier) {
    var topic by remember { mutableIntStateOf(0) }            // which primary tab
    var example by remember { mutableIntStateOf(0) }          // which example within it

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = { TopAppBar(title = { Text("Compose Parts") }) },
    ) { innerPadding ->
        // Consume the Scaffold insets (top app bar + status bar, and the bottom
        // navigation bar) so our content sits inside the safe area.
        Column(modifier = Modifier.fillMaxSize().padding(innerPadding)) {

            // PRIMARY tabs — the topic. Scrollable so all five fit without cramping.
            // Switching topics resets to the topic's first example.
            ScrollableTabRow(selectedTabIndex = topic, edgePadding = 8.dp) {
                TABS.forEachIndexed { i, tab ->
                    Tab(
                        selected = topic == i,
                        onClick = { topic = i; example = 0 },
                        text = { Text(tab.label) },
                    )
                }
            }

            val examples = TABS[topic].examples
            val sel = example.coerceIn(0, examples.lastIndex)  // stay in range

            // SECONDARY tabs — the examples within the topic ("tab within a tab").
            // Scrollable so longer names (e.g. "fillMaxWidth") don't get cramped.
            ScrollableTabRow(selectedTabIndex = sel, edgePadding = 12.dp) {
                examples.forEachIndexed { i, ex ->
                    Tab(selected = sel == i, onClick = { example = i }, text = { Text(ex.name) })
                }
            }

            // Just the ONE selected example, in a vertical scroll so a tall card
            // (and its bottom edge) is always reachable above the nav bar.
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
            ) {
                examples[sel].content()
                Spacer(modifier = Modifier.height(24.dp))      // breathing room at the bottom
            }
        }
    }
}

/**
 * MainActivity — the app's single Activity and Android's entry point.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ComposePartsTheme {
                PartsScreen()
            }
        }
    }
}

// ===========================================================================
// @Preview — render in Android Studio's design pane (controls won't move in a
// static preview, but the layout shows; run the app to drag the sliders).
// ===========================================================================
@Preview(name = "Compose Parts", showBackground = true, widthDp = 380, heightDp = 1400)
@Composable
fun PartsScreenPreview() {
    ComposePartsTheme { PartsScreen() }
}

@Preview(name = "One example", showBackground = true, widthDp = 380)
@Composable
private fun OneExamplePreview() {
    ComposePartsTheme { PaddingAllSides() }
}
