// =============================================================================
// MainActivity.kt
//
// CONCEPT: MODIFIERS & LAYOUT — "how do I size, space, decorate, and arrange?"
//
// This file is a TEACHING ARTIFACT. ComposeCatalog showed you WHICH component to
// reach for; this project shows you how to CONTROL them with the two tools you
// use on literally every composable:
//
//   1. THE MODIFIER CHAIN
//      `Modifier` is an ORDERED, immutable list of decorations. Every call —
//      `.padding(...)`, `.background(...)`, `.size(...)` — returns a NEW Modifier
//      that WRAPS the previous one. Compose applies them OUTSIDE-IN: the first
//      modifier in the chain is the OUTERMOST layer, the last is closest to the
//      content. Because each layer wraps the next, **ORDER CHANGES THE RESULT.**
//      The headline demos below prove it: `background then padding` looks nothing
//      like `padding then background`.
//
//   2. LAYOUT: Column / Row / Box + Arrangement, Alignment, weight
//      • Arrangement = how children are spread along the layout's MAIN axis
//        (vertical for Column, horizontal for Row): spacedBy, Center, SpaceBetween…
//      • Alignment   = how children line up on the CROSS axis
//        (horizontalAlignment in a Column, verticalAlignment in a Row).
//      • weight      = how children SHARE the leftover main-axis space, in ratios.
//      • Box stacks children on top of each other; `Modifier.align(...)` positions
//        each child within the Box.
//
// HOW TO READ IT:
//   Each idea is one labelled `Lesson`. Open MainActivity in Android Studio and
//   look at the @Preview functions for the "order matters" comparisons — the
//   difference is obvious at a glance in the design pane, no emulator needed.
// =============================================================================

// The package declaration — mirrors the folder path under src/main/java/.
package com.example.composemodifiers

// --- Android framework imports ------------------------------------------------
import android.os.Bundle                                     // savedInstanceState type passed to onCreate
import androidx.activity.ComponentActivity                   // base Activity class that can host a Compose UI
import androidx.activity.compose.setContent                  // installs a Compose UI tree as the Activity's content
import androidx.activity.enableEdgeToEdge                    // lets the app draw behind the system status/nav bars

// --- Compose foundation: behavior + drawing modifiers -------------------------
import androidx.compose.foundation.background                // modifier: paint a solid color/shape behind content
import androidx.compose.foundation.border                    // modifier: draw an outline (width + color) around content
import androidx.compose.foundation.clickable                 // modifier: make ANY composable respond to taps
import androidx.compose.foundation.rememberScrollState       // remembers how far a scrollable has been scrolled
import androidx.compose.foundation.verticalScroll            // modifier: make a Column scroll vertically

// --- Compose foundation: layout modifiers & containers ------------------------
import androidx.compose.foundation.layout.Arrangement        // controls spacing BETWEEN children on the main axis
import androidx.compose.foundation.layout.Box                // a layout that stacks/overlaps children on the z-axis
import androidx.compose.foundation.layout.Column             // a layout that stacks children VERTICALLY
import androidx.compose.foundation.layout.Row                // a layout that places children HORIZONTALLY
import androidx.compose.foundation.layout.Spacer             // an empty element used to insert a fixed-size gap
import androidx.compose.foundation.layout.aspectRatio        // modifier: force a width:height ratio (e.g. 16:9)
import androidx.compose.foundation.layout.fillMaxHeight      // modifier: take ALL available height
import androidx.compose.foundation.layout.fillMaxSize        // modifier: take ALL available width AND height
import androidx.compose.foundation.layout.fillMaxWidth       // modifier: take ALL (or a fraction of) available width
import androidx.compose.foundation.layout.height             // modifier: force a specific height
import androidx.compose.foundation.layout.offset             // modifier: shift content by an (x, y) without re-layout
import androidx.compose.foundation.layout.padding            // modifier: add empty space AROUND content
import androidx.compose.foundation.layout.size               // modifier: force a specific width AND height
import androidx.compose.foundation.layout.width              // modifier: force a specific width
import androidx.compose.foundation.layout.wrapContentWidth   // modifier: shrink to fit content (the opposite of fillMaxWidth)
import androidx.compose.foundation.shape.CircleShape         // a fully-rounded (pill/circle) shape
import androidx.compose.foundation.shape.RoundedCornerShape  // a rounded-rectangle shape with a chosen corner radius

// --- Material 3 components (used only to label the demos) ---------------------
import androidx.compose.material3.ExperimentalMaterial3Api   // opt-in marker for still-evolving M3 APIs (TopAppBar)
import androidx.compose.material3.HorizontalDivider          // a thin horizontal rule between lessons
import androidx.compose.material3.MaterialTheme              // entry point to the theme's colorScheme + typography
import androidx.compose.material3.Scaffold                   // standard screen frame (top bar + content insets)
import androidx.compose.material3.Text                       // draws a string using a typography style + color
import androidx.compose.material3.TopAppBar                  // the bar across the top of the screen (title)

// --- Compose runtime / state --------------------------------------------------
import androidx.compose.runtime.Composable                   // marks a function as one that EMITS UI
import androidx.compose.runtime.getValue                     // enables `by` delegate READS of a State<T>
import androidx.compose.runtime.mutableIntStateOf            // observable Int state (specialized mutableStateOf)
import androidx.compose.runtime.remember                     // remembers a value ACROSS recomposition
import androidx.compose.runtime.setValue                     // enables `by` delegate WRITES to a MutableState<T>

// --- Compose UI / tooling -----------------------------------------------------
import androidx.compose.ui.Alignment                         // describes how to align children (cross axis / in a Box)
import androidx.compose.ui.Modifier                          // the "how to size / decorate / position" object
import androidx.compose.ui.draw.alpha                        // modifier: make content partially transparent (0f..1f)
import androidx.compose.ui.draw.clip                         // modifier: clip content to a shape (rounded corners…)
import androidx.compose.ui.draw.rotate                       // modifier: rotate content by N degrees
import androidx.compose.ui.draw.shadow                       // modifier: cast a drop shadow (with a shape)
import androidx.compose.ui.graphics.Color                    // an ARGB color value (Color.White, Color(0xFF…))
import androidx.compose.ui.text.font.FontWeight              // Normal, Medium, Bold, … (used on labels)
import androidx.compose.ui.tooling.preview.Preview           // enables @Preview rendering in Android Studio
import androidx.compose.ui.unit.dp                           // density-independent pixel unit (e.g. 16.dp)

// --- App theme ----------------------------------------------------------------
import com.example.composemodifiers.ui.theme.ComposeModifiersTheme // our Material 3 theme wrapper (ui/theme/Theme.kt)

// ===========================================================================
// SMALL REUSABLE HELPERS
// ---------------------------------------------------------------------------
// `Lesson` frames each idea with a title + caption (the slot pattern again).
// `Tile` is a labelled colored box we drop into demos to make layout visible.
// ===========================================================================

/**
 * Lesson — a titled, captioned frame around one modifier/layout demo.
 *
 * @param title   the idea's name (e.g. "Order matters: padding vs background").
 * @param caption a one-line plain-English explanation.
 * @param content the live demo, supplied by the caller as a trailing lambda.
 */
@Composable
fun Lesson(title: String, caption: String, content: @Composable () -> Unit) {
    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp)) {
        Text(title, style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
        Text(
            caption,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(bottom = 10.dp),
        )
        content()                                            // the caller's demo UI
    }
    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
}

/**
 * Tile — a small colored box with a centered white label. We use it all over the
 * demos so the effect of a modifier (size, padding, alignment, weight) is VISIBLE.
 *
 * The `modifier` parameter is FIRST-CLASS: callers pass in the very modifiers the
 * lesson is about (e.g. `Tile("A", color, Modifier.weight(1f))`). Accepting a
 * `modifier` parameter like this is the #1 convention for reusable composables.
 *
 * @param label    short text drawn in the center.
 * @param color    the tile's background color.
 * @param modifier caller-supplied sizing/positioning — the star of each demo.
 */
@Composable
fun Tile(label: String, color: Color, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier.background(color),               // paint the tile; caller controls size/position
        contentAlignment = Alignment.Center,                 // center the label inside the tile
    ) {
        Text(label, color = Color.White, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge)
    }
}

// A short, reused list of demo colors (pulled from raw values so the contrast is
// predictable regardless of light/dark theme).
private val Blue = Color(0xFF2563EB)
private val Green = Color(0xFF0F9D58)
private val Orange = Color(0xFFE8730C)
private val Purple = Color(0xFF7C3AED)

// ===========================================================================
// THE SCREEN — a scrolling list of lessons.
// (Opt-in needed for TopAppBar, exactly as in ComposeCatalog.)
// ===========================================================================

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ModifiersScreen(modifier: Modifier = Modifier) {
    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = { TopAppBar(title = { Text("Modifiers & Layout") }) },
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)                       // sit below the app bar / system bars
                .verticalScroll(rememberScrollState())       // scroll when content overflows
                .padding(horizontal = 16.dp),                // our own side gutters
        ) {

            // ===================================================================
            // 1 · THE CHAIN — a Modifier is an ordered pipeline.
            // ===================================================================
            Lesson("The modifier chain", "Each .call() wraps the previous one. The chain is read outside-in: first = outermost.") {
                // Here the chain is: size (reserve 160×72) -> clip (round corners)
                // -> background (fill the rounded area) -> padding (inset content).
                Box(
                    modifier = Modifier
                        .size(width = 160.dp, height = 72.dp)    // 1. reserve space
                        .clip(RoundedCornerShape(12.dp))         // 2. round the corners of everything inside
                        .background(Blue)                        // 3. fill the (now-rounded) area
                        .padding(12.dp),                         // 4. inset the content from the edges
                    contentAlignment = Alignment.Center,
                ) {
                    Text("size→clip→background→padding", color = Color.White, style = MaterialTheme.typography.labelMedium)
                }
            }

            // ===================================================================
            // 2 · ORDER MATTERS: background ↔ padding  (the headline lesson)
            // ===================================================================
            Lesson("Order matters: background vs padding", "Swap two modifiers and the picture changes. Watch where the blue goes.") {
                // We put both versions on a light card background so the TRANSPARENT
                // padding (which lets the card show through) is visible on the right.
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(8.dp))
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("background → padding", style = MaterialTheme.typography.labelSmall)
                        Spacer(Modifier.height(6.dp))
                        // background FIRST: the blue fills the whole box, THEN padding
                        // pushes the text inward — so blue shows AROUND the text.
                        Box(Modifier.background(Blue).padding(16.dp)) {
                            Text("text", color = Color.White)
                        }
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("padding → background", style = MaterialTheme.typography.labelSmall)
                        Spacer(Modifier.height(6.dp))
                        // padding FIRST: 16dp of transparent margin (the card shows
                        // through), THEN blue fills only the remaining inner area —
                        // so the blue hugs the text with NO blue border around it.
                        Box(Modifier.padding(16.dp).background(Blue)) {
                            Text("text", color = Color.White)
                        }
                    }
                }
            }

            // ===================================================================
            // 3 · WRAPPING MADE VISIBLE: border → padding → border
            // ===================================================================
            Lesson("Each modifier wraps the next", "Two borders with padding between them: proof that the chain is nested layers.") {
                // Outer border, then 12dp padding, then an inner border, then the
                // text. You SEE two concentric outlines with a gap — that gap is the
                // padding layer sitting between the two border layers.
                Box(
                    modifier = Modifier
                        .border(2.dp, Blue, RoundedCornerShape(10.dp))   // OUTER outline
                        .padding(12.dp)                                  // the gap
                        .border(2.dp, Orange, RoundedCornerShape(6.dp))  // INNER outline
                        .padding(12.dp),                                 // inset before the text
                ) {
                    Text("nested layers")
                }
            }

            // ===================================================================
            // 4 · SIZE — how big should a composable be?
            // ===================================================================
            Lesson("Sizing", "size() fixes both dimensions; fillMaxWidth() takes all (or a fraction of) the width; wrapContent shrinks to fit.") {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    // Fixed 120×40 tile.
                    Tile("size(120×40)", Green, Modifier.size(width = 120.dp, height = 40.dp))
                    // Take the FULL width.
                    Tile("fillMaxWidth()", Blue, Modifier.fillMaxWidth().height(36.dp))
                    // Take HALF the width (fraction argument).
                    Tile("fillMaxWidth(0.5f)", Purple, Modifier.fillMaxWidth(0.5f).height(36.dp))
                    // Offered the full width, but wrapContentWidth shrinks the tile
                    // back to its content and centers it within that full width.
                    Tile("wrapContentWidth", Orange, Modifier.fillMaxWidth().wrapContentWidth().height(36.dp))
                }
            }

            // ===================================================================
            // 5 · PADDING — the many ways to inset.
            // ===================================================================
            Lesson("Padding variants", "All sides, per-axis (horizontal/vertical), or per-side (start/top/end/bottom).") {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    // 16dp on every side.
                    Box(Modifier.background(Blue).padding(16.dp)) { Text("all 16", color = Color.White) }
                    // Different horizontal vs vertical insets.
                    Box(Modifier.background(Green).padding(horizontal = 20.dp, vertical = 4.dp)) { Text("h20 v4", color = Color.White) }
                    // Only one side.
                    Box(Modifier.background(Purple).padding(start = 28.dp, top = 8.dp)) { Text("start/top", color = Color.White) }
                }
            }

            // ===================================================================
            // 6 · DECORATION — clip, border, shadow.
            // ===================================================================
            Lesson("Clip, border & shadow", "Round corners with clip, outline with border, lift off the surface with shadow.") {
                Row(horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    // Clip to a circle, then fill — order matters here too (clip first).
                    Tile("clip", Blue, Modifier.size(64.dp).clip(CircleShape))
                    // A bordered, rounded, but unfilled box.
                    Box(
                        modifier = Modifier.size(64.dp).border(3.dp, Green, RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center,
                    ) { Text("border") }
                    // shadow() needs a shape and is applied BEFORE background so the
                    // shadow follows the rounded outline; then we fill the shape.
                    Box(
                        modifier = Modifier
                            .size(64.dp)
                            .shadow(elevation = 10.dp, shape = RoundedCornerShape(12.dp))
                            .background(Orange, RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center,
                    ) { Text("shadow", color = Color.White) }
                }
            }

            // ===================================================================
            // 7 · ARRANGEMENT — spreading children along the MAIN axis.
            // (Row's main axis is horizontal; Column's is vertical.)
            // ===================================================================
            Lesson("Arrangement (main axis)", "How the children spread along the layout's main axis. Each Row below uses a different one.") {
                // A reusable little strip of three tiles we render under each label.
                @Composable
                fun Strip(arrangement: Arrangement.Horizontal) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(6.dp))
                            .padding(4.dp),
                        horizontalArrangement = arrangement,
                    ) {
                        Tile("1", Blue, Modifier.size(32.dp))
                        Tile("2", Green, Modifier.size(32.dp))
                        Tile("3", Purple, Modifier.size(32.dp))
                    }
                }
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("spacedBy(8.dp)", style = MaterialTheme.typography.labelSmall); Strip(Arrangement.spacedBy(8.dp))
                    Text("SpaceBetween", style = MaterialTheme.typography.labelSmall); Strip(Arrangement.SpaceBetween)
                    Text("SpaceAround", style = MaterialTheme.typography.labelSmall); Strip(Arrangement.SpaceAround)
                    Text("SpaceEvenly", style = MaterialTheme.typography.labelSmall); Strip(Arrangement.SpaceEvenly)
                    Text("Center", style = MaterialTheme.typography.labelSmall); Strip(Arrangement.Center)
                    Text("End", style = MaterialTheme.typography.labelSmall); Strip(Arrangement.End)
                }
            }

            // ===================================================================
            // 8 · ALIGNMENT — lining children up on the CROSS axis.
            // ===================================================================
            Lesson("Alignment (cross axis)", "In a Row the cross axis is vertical: verticalAlignment lines tiles up Top / Center / Bottom.") {
                // One tall Row; the three tiles have different heights so the cross-axis
                // alignment is obvious. We show Top, Center, Bottom side by side.
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(20.dp)) {
                    Column {
                        Text("Top", style = MaterialTheme.typography.labelSmall)
                        Row(modifier = Modifier.height(64.dp), verticalAlignment = Alignment.Top) {
                            Tile("A", Blue, Modifier.size(28.dp)); Spacer(Modifier.width(4.dp)); Tile("B", Green, Modifier.size(44.dp))
                        }
                    }
                    Column {
                        Text("Center", style = MaterialTheme.typography.labelSmall)
                        Row(modifier = Modifier.height(64.dp), verticalAlignment = Alignment.CenterVertically) {
                            Tile("A", Blue, Modifier.size(28.dp)); Spacer(Modifier.width(4.dp)); Tile("B", Green, Modifier.size(44.dp))
                        }
                    }
                    Column {
                        Text("Bottom", style = MaterialTheme.typography.labelSmall)
                        Row(modifier = Modifier.height(64.dp), verticalAlignment = Alignment.Bottom) {
                            Tile("A", Blue, Modifier.size(28.dp)); Spacer(Modifier.width(4.dp)); Tile("B", Green, Modifier.size(44.dp))
                        }
                    }
                }
            }

            // ===================================================================
            // 9 · WEIGHT — children SHARE leftover space in ratios.
            // ===================================================================
            Lesson("weight", "weight(n) divides the LEFTOVER main-axis space by ratio. Here 1 : 2, plus a fixed 48dp tile.") {
                Row(modifier = Modifier.fillMaxWidth().height(44.dp), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    // Takes 1 share of the leftover width. fillMaxHeight() makes the
                    // tile as tall as the 44dp Row so the proportions are easy to see.
                    Tile("weight 1", Blue, Modifier.weight(1f).fillMaxHeight())
                    // Takes 2 shares — so it ends up TWICE as wide as the first.
                    Tile("weight 2", Green, Modifier.weight(2f).fillMaxHeight())
                    // Fixed width: it is measured FIRST; weights split what remains.
                    Tile("48dp", Orange, Modifier.width(48.dp).fillMaxHeight())
                }
            }

            // ===================================================================
            // 10 · BOX + align — positioning children in a stack.
            // ===================================================================
            Lesson("Box & Modifier.align", "Box stacks children; each child uses Modifier.align(...) to sit in a corner or center.") {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(120.dp)
                        .background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(8.dp)),
                ) {
                    // Each child positions itself within the Box independently.
                    Tile("TopStart", Blue, Modifier.align(Alignment.TopStart).size(64.dp, 28.dp))
                    Tile("Center", Green, Modifier.align(Alignment.Center).size(64.dp, 28.dp))
                    Tile("BottomEnd", Purple, Modifier.align(Alignment.BottomEnd).size(72.dp, 28.dp))
                }
            }

            // ===================================================================
            // 11 · TRANSFORMS — offset, alpha, rotate.
            // ===================================================================
            Lesson("Transforms: offset, alpha, rotate", "Nudge with offset, fade with alpha, spin with rotate — without changing layout size.") {
                Row(horizontalArrangement = Arrangement.spacedBy(24.dp), verticalAlignment = Alignment.CenterVertically) {
                    // offset shifts the drawing by (x, y) but keeps the reserved slot.
                    Tile("offset", Blue, Modifier.size(56.dp).offset(x = 8.dp, y = 8.dp))
                    // alpha makes content semi-transparent (0f = invisible, 1f = opaque).
                    Tile("alpha .4", Green, Modifier.size(56.dp).alpha(0.4f))
                    // rotate spins the content around its center by N degrees.
                    Tile("rotate 20°", Orange, Modifier.size(56.dp).rotate(20f))
                }
            }

            // ===================================================================
            // 12 · aspectRatio — lock a width:height ratio.
            // ===================================================================
            Lesson("aspectRatio", "Take the full width, then force the height to a 16:9 ratio — handy for media/cards.") {
                Tile("16 : 9", Purple, Modifier.fillMaxWidth().aspectRatio(16f / 9f).clip(RoundedCornerShape(8.dp)))
            }

            // ===================================================================
            // 13 · clickable — a modifier can add BEHAVIOR, not just looks.
            // ===================================================================
            Lesson("clickable", "Modifiers aren't only visual: clickable makes any composable tappable. Tap the tile to count.") {
                // Local tap counter so the demo actually does something on device.
                var taps by remember { mutableIntStateOf(0) }
                Tile(
                    label = "Tapped $taps",
                    color = Blue,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .clip(RoundedCornerShape(8.dp))      // clip FIRST so the ripple respects the rounded shape
                        .clickable { taps++ },               // add the tap behavior
                )
            }

            Spacer(Modifier.height(24.dp))                   // breathing room at the very bottom
        }
    }
}

/**
 * MainActivity — the app's single Activity and Android's entry point.
 *
 * Installs the Compose UI, applies the Material 3 theme, and renders the scrolling
 * [ModifiersScreen]. No navigation, no data — purely a layout/Modifier reference.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)                   // always call through to the framework first
        enableEdgeToEdge()                                   // draw under the system bars for a modern look
        setContent {
            ComposeModifiersTheme {                          // apply our Material 3 colors + typography
                // HW4 SOLUTIONS: show the Part B tasks (T4–T6). The original ModifiersScreen()
                // is still defined and @Preview-able. See Hw4Solutions.kt for the answers.
                Hw4ModifierSolutionsScreen()
            }
        }
    }
}

// ===========================================================================
// @Preview functions — the "order matters" comparisons shine in the design pane.
// ===========================================================================

// The full scrolling screen.
@Preview(name = "Modifiers screen", showBackground = true, widthDp = 360, heightDp = 1600)
@Composable
fun ModifiersScreenPreview() {
    ComposeModifiersTheme { ModifiersScreen() }
}

// A focused preview of JUST the background-vs-padding comparison — the single most
// useful thing to stare at while the idea sinks in.
@Preview(name = "Order: background vs padding", showBackground = true, widthDp = 360)
@Composable
fun OrderMattersPreview() {
    ComposeModifiersTheme {
        Row(modifier = Modifier.padding(16.dp), horizontalArrangement = Arrangement.spacedBy(24.dp)) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("background → padding", style = MaterialTheme.typography.labelSmall)
                Spacer(Modifier.height(6.dp))
                Box(Modifier.background(Blue).padding(16.dp)) { Text("text", color = Color.White) }
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("padding → background", style = MaterialTheme.typography.labelSmall)
                Spacer(Modifier.height(6.dp))
                Box(Modifier.padding(16.dp).background(Blue)) { Text("text", color = Color.White) }
            }
        }
    }
}
