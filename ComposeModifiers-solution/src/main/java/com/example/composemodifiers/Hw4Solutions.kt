// =============================================================================
// Hw4Solutions.kt  —  ANSWER KEY (runnable) for Homework 4, the ComposeModifiers half.
//
// This file holds Part B — "modifier order is a feature":
//   • T4 — padding vs background (the predict-then-run pair)
//   • T5 — clip, border & background together (a rounded avatar)
//   • T6 — size-affecting vs draw-only modifiers (one Card, labelled)
//
// The layout/state tasks (T1–T3, T7–T10) live in ComposeCatalog-solution. Every
// composable here is @Preview-able on its own, and MainActivity wires them into
// one scrolling screen so you can see them on the emulator.
//
// Teaching style: heavy, line-by-line comments.
// =============================================================================

package com.example.composemodifiers

// --- Foundation: drawing modifiers, scrolling, shapes -------------------------
import androidx.compose.foundation.background                 // paint a color/shape behind content (draw)
import androidx.compose.foundation.border                     // draw an outline (width + color + shape)
import androidx.compose.foundation.layout.Arrangement         // spacing BETWEEN children on the main axis
import androidx.compose.foundation.layout.Box                 // stacks/overlaps children on the z-axis
import androidx.compose.foundation.layout.Column              // stacks children VERTICALLY
import androidx.compose.foundation.layout.Spacer              // a fixed-size empty gap
import androidx.compose.foundation.layout.fillMaxSize         // take ALL width AND height
import androidx.compose.foundation.layout.fillMaxWidth        // take ALL available width (size modifier)
import androidx.compose.foundation.layout.height              // force a specific height
import androidx.compose.foundation.layout.padding             // add empty space AROUND content (size modifier)
import androidx.compose.foundation.layout.size                // force a specific width AND height
import androidx.compose.foundation.rememberScrollState        // remembers scroll position across recomposition
import androidx.compose.foundation.shape.RoundedCornerShape   // a rounded-rectangle shape
import androidx.compose.foundation.verticalScroll             // make a Column scroll vertically

// --- Material 3 components ----------------------------------------------------
import androidx.compose.material3.Card                        // rounded surface with a slight shadow
import androidx.compose.material3.HorizontalDivider           // thin horizontal rule
import androidx.compose.material3.MaterialTheme               // the theme's colors + typography
import androidx.compose.material3.Text                        // draws a string with a type style + color

// --- Compose runtime / UI / tooling -------------------------------------------
import androidx.compose.runtime.Composable                    // marks a function as one that EMITS UI
import androidx.compose.ui.Alignment                          // how to align children (in a Box)
import androidx.compose.ui.Modifier                           // the "size / decorate / position" object
import androidx.compose.ui.draw.alpha                         // make content partially transparent (draw-only)
import androidx.compose.ui.draw.clip                          // clip content to a shape (draw-only)
import androidx.compose.ui.draw.shadow                        // cast a drop shadow (draw-only)
import androidx.compose.ui.graphics.Color                     // an ARGB color value
import androidx.compose.ui.tooling.preview.Preview            // enables @Preview rendering in Android Studio
import androidx.compose.ui.unit.dp                            // density-independent pixel unit (16.dp)

import com.example.composemodifiers.ui.theme.ComposeModifiersTheme // our Material 3 theme wrapper

// =============================================================================
// T4 — padding vs background (predict, then run)                        [Part B]
// -----------------------------------------------------------------------------
// PREDICTION (confirmed by running):
//   A (background FIRST, then padding): background paints the WHOLE box, and the
//      16dp padding sits INSIDE the green -> the green INCLUDES the padding.
//   B (padding FIRST, then background): the 16dp inset is applied first as a
//      transparent margin, then green paints only the inner area -> a TRANSPARENT
//      GAP to the edge, green hugging the text.
// Rule: clip/paint follow the chain outside-in; the first modifier wraps the rest.
@Composable
fun T4AbackgroundThenPadding() {                             // T4 — variant A
    Text(
        "Hello",
        modifier = Modifier
            .background(Color(0xFF3DDC84))                   // 1) paint the WHOLE area green (outermost)
            .padding(16.dp)                                 // 2) THEN inset the text 16dp INSIDE that green
    )
}

@Composable
fun T4BpaddingThenBackground() {                            // T4 — variant B
    Text(
        "Hello",
        modifier = Modifier
            .padding(16.dp)                                 // 1) inset 16dp first -> transparent margin
            .background(Color(0xFF3DDC84))                  // 2) paint green only on the SMALLER inner area
    )
    // T4 — emulator vs playground: the result matches the playground exactly; what the REAL
    // version adds is live Material theming / dark-mode color resolution, a real touch ripple
    // if you make it .clickable, and true density-correct dp->px scaling on the device.
}

// =============================================================================
// T5 — clip, border & background together (a rounded avatar)            [Part B]
// -----------------------------------------------------------------------------
@Composable
fun T5Avatar() {                                            // T5 — the clean version
    Box(
        modifier = Modifier
            .size(72.dp)                                    // fixed square (layout)
            .clip(RoundedCornerShape(16.dp))                // 1) round the corners FIRST...
            .background(Color(0xFFB3E5FC))                  // 2) ...so the fill respects the rounded clip
            .border(2.dp, Color(0xFF0288D1), RoundedCornerShape(16.dp)), // 3) border on the same rounded shape
        contentAlignment = Alignment.Center
    ) {
        Text("JP")
    }
    // T5 — REORDER OBSERVATION: if you put .background() BEFORE .clip(), the fill paints on the
    // full SQUARE before the clip takes effect, so the color reaches into the square corners and
    // you lose the rounded fill (clip only affects what's drawn AFTER it). Keep .clip() first.
}

// =============================================================================
// T6 — size-affecting vs draw-only modifiers (one Card)                 [Part B]
// -----------------------------------------------------------------------------
@Composable
fun T6Card() {                                             // T6
    Card(
        modifier = Modifier
            .fillMaxWidth()                                // size — changes the MEASURED width
            .padding(16.dp)                                // size — adds measured space around the card
            .shadow(8.dp, RoundedCornerShape(12.dp))       // draw — paints a shadow, no size change
            .alpha(0.9f)                                   // draw — changes opacity only
    ) {
        Column(modifier = Modifier.padding(16.dp)) {       // size — inner content padding
            Text("Olympus Mons", style = MaterialTheme.typography.titleMedium)
            Text("Tallest volcano in the solar system")
        }
    }
    // T6 — ALPHA vs PADDING: alpha is a DRAW-only modifier (runs after measurement is fixed), so
    // the card keeps the same measured box and the cards below do NOT move — it just paints more
    // transparently. padding is a LAYOUT modifier (runs in the measure phase) and ADDS to the
    // card's measured size, so everything after it is pushed down. If it changes how BIG the node
    // is, siblings move; if it only changes how it's PAINTED, they don't.
}

// =============================================================================
// RUNTIME HOST — all three Part B tasks in one scrolling screen.
// =============================================================================

@Composable
private fun TaskHeader(label: String) {                   // a small labelled separator
    Spacer(Modifier.height(16.dp))
    Text(label, style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
    HorizontalDivider()
    Spacer(Modifier.height(8.dp))
}

@Composable
fun Hw4ModifierSolutionsScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        TaskHeader("T4·A — background, then padding (green includes the padding)")
        T4AbackgroundThenPadding()
        TaskHeader("T4·B — padding, then background (transparent gap to the edge)")
        T4BpaddingThenBackground()
        TaskHeader("T5 — clip → background → border (rounded avatar)")
        T5Avatar()
        TaskHeader("T6 — one Card: size vs draw modifiers")
        T6Card()
        Spacer(Modifier.height(24.dp))
    }
}

// =============================================================================
// @Preview functions — inspect each task in the Android Studio design pane.
// =============================================================================

@Preview(name = "T4 A · bg→pad", showBackground = true, widthDp = 280)
@Composable
fun T4APreview() { ComposeModifiersTheme { T4AbackgroundThenPadding() } }

@Preview(name = "T4 B · pad→bg", showBackground = true, widthDp = 280)
@Composable
fun T4BPreview() { ComposeModifiersTheme { T4BpaddingThenBackground() } }

@Preview(name = "T5 Avatar", showBackground = true, widthDp = 200)
@Composable
fun T5Preview() { ComposeModifiersTheme { T5Avatar() } }

@Preview(name = "T6 Card", showBackground = true, widthDp = 360)
@Composable
fun T6Preview() { ComposeModifiersTheme { T6Card() } }

@Preview(name = "All Part B", showBackground = true, widthDp = 360, heightDp = 760)
@Composable
fun Hw4ModifierSolutionsPreview() { ComposeModifiersTheme { Hw4ModifierSolutionsScreen() } }
