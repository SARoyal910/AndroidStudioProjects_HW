// =============================================================================
// MainActivity.kt  —  HOMEWORK 5: "Settings List"
//
// ASSIGNMENT
//   Build a scrollable SETTINGS screen — the kind every app has. It is a vertical
//   list of rows, where each row follows the SAME visual pattern:
//
//       [icon]   Label text ......................fills the middle...   [control]
//
//   The control on the right edge is either a Switch (for on/off settings) or a
//   "›" chevron (for settings that would navigate to another screen).
//
// TARGET ("done") SCREEN — what it should look like when you finish:
//   • a "Settings" screen title in the top app bar,
//   • SIX rows: Notifications, Dark mode, Data saver (each a Switch),
//               Privacy, Language, About (each a "›" chevron),
//   • the toggle switches actually FLIP when you tap them,
//   • a divider separating the main settings from the "About" footer row.
//
// WHAT IS ALREADY DONE FOR YOU (do NOT redo these):
//   • the Scaffold + TopAppBar showing the "Settings" title,
//   • the enum Kind { TOGGLE, NAV } and the SettingItem data class,
//   • the `settings` list of all six items,
//   • the SettingRow composable's SIGNATURE (its parameter list).
//
// YOUR TODOs (each is a labelled banner further down — search for "TODO"):
//   TODO 1 — Show every row: render ALL items from `settings`, not just one.
//   TODO 2 — Row layout: lay SettingRow out as icon · label(weight) · control.
//   TODO 3 — Make toggles work: give each TOGGLE row remembered on/off state.
//   TODO 4 (optional) — add a divider above the "About" footer row.
//
// As shipped, this file COMPILES and RUNS — it just shows placeholders where your
// work goes, so you can run it first and then fill in the TODOs one at a time.
// =============================================================================
package com.example.hw5settingslist

// --- Android framework --------------------------------------------------------
import android.os.Bundle                                     // savedInstanceState type passed to onCreate
import androidx.activity.ComponentActivity                   // base Activity that can host a Compose UI
import androidx.activity.compose.setContent                  // installs a Compose UI tree as the Activity content
import androidx.activity.enableEdgeToEdge                    // draw behind the system bars for a modern look

// --- Compose foundation: layout + scrolling ----------------------------------
import androidx.compose.foundation.layout.Arrangement        // spacing BETWEEN children on the main axis
import androidx.compose.foundation.layout.Box                // overlap/center a single child (used for placeholders)
import androidx.compose.foundation.layout.Column             // stack children vertically
import androidx.compose.foundation.layout.Row                // place children horizontally (one settings row)
import androidx.compose.foundation.layout.Spacer             // an empty, fixed-size gap
import androidx.compose.foundation.layout.fillMaxSize        // modifier: take all width AND height
import androidx.compose.foundation.layout.fillMaxWidth       // modifier: take all width
import androidx.compose.foundation.layout.padding            // modifier: add empty space AROUND content
import androidx.compose.foundation.layout.width              // modifier: force a specific width (gap after the icon)
import androidx.compose.foundation.rememberScrollState       // remembers a scroll position across recomposition
import androidx.compose.foundation.verticalScroll            // modifier: make a Column scroll vertically

// --- Material 3 ---------------------------------------------------------------
import androidx.compose.material3.ExperimentalMaterial3Api   // opt-in marker for TopAppBar (still-evolving API)
import androidx.compose.material3.HorizontalDivider          // a thin horizontal line between sections (TODO 4)
import androidx.compose.material3.MaterialTheme              // the theme's colorScheme + typography
import androidx.compose.material3.Scaffold                   // standard screen frame (top bar + insets)
import androidx.compose.material3.Switch                     // the on/off toggle control on TOGGLE rows
import androidx.compose.material3.Text                       // draws a string (label, icon emoji, chevron)
import androidx.compose.material3.TopAppBar                  // the title bar across the top

// --- Compose runtime / state --------------------------------------------------
import androidx.compose.runtime.Composable                   // marks a function/lambda as emitting UI
import androidx.compose.runtime.getValue                     // `by` delegate READS of a State<T>
import androidx.compose.runtime.mutableStateOf               // observable state holder (used for the toggle in TODO 3)
import androidx.compose.runtime.remember                     // remember a value across recomposition
import androidx.compose.runtime.setValue                     // `by` delegate WRITES to a MutableState<T>

// --- Compose UI ---------------------------------------------------------------
import androidx.compose.ui.Alignment                         // how children align (CenterVertically, …)
import androidx.compose.ui.Modifier                          // the "how to size/decorate/position" object
import androidx.compose.ui.tooling.preview.Preview           // @Preview rendering in Android Studio
import androidx.compose.ui.unit.dp                           // density-independent pixels (16.dp)
import androidx.compose.ui.unit.sp                           // scale-independent pixels for font sizes (the big emoji/chevron)

import com.example.hw5settingslist.ui.theme.Hw5SettingsListTheme // our Material 3 theme wrapper

// ===========================================================================
// THE DATA MODEL  (DONE — do not change)
//
// We describe each settings row as DATA, separate from the UI that draws it.
// That way SettingRow can be written once and reused for all six rows, and we
// can add/remove/reorder settings just by editing the `settings` list below.
// ===========================================================================

// A setting is one of two KINDS, and the kind decides which control we show on
// the right: a Switch (toggle on/off) or a "›" chevron (tap to go somewhere).
enum class Kind { TOGGLE, NAV }

// One row's worth of data. `icon` is just an emoji String so we don't need any
// icon assets; `initiallyOn` only matters for TOGGLE rows (their starting state).
data class SettingItem(
    val icon: String,                                        // a leading emoji, e.g. "🔔"
    val label: String,                                       // the row's text, e.g. "Notifications"
    val kind: Kind,                                          // TOGGLE → Switch, NAV → "›" chevron
    val initiallyOn: Boolean = false,                        // starting on/off value for a TOGGLE row
)

// The six settings, in display order. Three toggles, then three navigation rows.
val settings = listOf(
    SettingItem("🔔", "Notifications", Kind.TOGGLE, initiallyOn = true),
    SettingItem("🌙", "Dark mode",     Kind.TOGGLE, initiallyOn = false),
    SettingItem("📉", "Data saver",    Kind.TOGGLE, initiallyOn = false),
    SettingItem("🔒", "Privacy",       Kind.NAV),
    SettingItem("🌐", "Language",      Kind.NAV),
    SettingItem("ℹ️", "About",         Kind.NAV),
)

// ===========================================================================
// SettingRow — draws ONE row of the settings list.
//
// The SIGNATURE is given to you (DONE). It receives the row's data plus a way to
// flip the toggle:
//   • item     — the SettingItem to draw (its icon, label, and kind).
//   • isOn      — for a TOGGLE row, the CURRENT on/off value to show on the Switch.
//                 (Ignored by NAV rows, which show a chevron instead.)
//   • onToggle — called when the user taps the Switch, with the new value.
//                 The PARENT owns the state and updates it — this is "state
//                 hoisting": the row only displays state and reports taps.
//
// YOUR JOB (TODO 2) is to fill in the BODY so the row looks like:
//     [icon]   Label .................................................   [control]
// ===========================================================================
@Composable
fun SettingRow(
    item: SettingItem,
    isOn: Boolean,
    onToggle: (Boolean) -> Unit,
) {
    // ─────────────── TODO 2 (you): Row layout — icon · label · control ───────────────
    // Replace the placeholder Text below with a real Row.
    //   • Use a Row(...) with verticalAlignment = Alignment.CenterVertically so the
    //     icon, label and control all line up on the same center line.
    //   • Give the Row Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 12.dp).
    //   • Inside, in order:
    //       1) Text(item.icon, fontSize = 22.sp)            // the leading emoji
    //       2) Spacer(Modifier.width(16.dp))                // gap after the icon
    //       3) Text(item.label, modifier = Modifier.weight(1f))  // weight(1f) makes the
    //          label EAT all the leftover width, pushing the control to the far END
    //       4) the trailing control: if item.kind == Kind.TOGGLE show
    //          Switch(checked = isOn, onCheckedChange = onToggle);
    //          otherwise show Text("›", fontSize = 24.sp) for a NAV row.
    // (See Labs 6 & 8 for Row cross-axis alignment + weight.)
    //
    // Placeholder (delete when you build the real row): shows the label so the
    // screen is readable, but with no icon, no weight, and no control yet.


    // TODO 2
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Display the emoji icon.
        Text(
            text = item.icon,
            fontSize = 22.sp
        )

        Spacer(
            modifier = Modifier.width(16.dp)
        )

        Text(
            text = item.label,
            modifier = Modifier.weight(1f)
        )

        if (item.kind == Kind.TOGGLE) {
            Switch(
                checked = isOn,
                onCheckedChange = onToggle
            )
        } else {
            Text(
                text = "›",
                fontSize = 24.sp
            )
        }
    }
}

// ===========================================================================
// SettingsScreen — the whole screen: a Scaffold with a "Settings" title (DONE),
// and a scrolling body where your list of rows goes (TODO 1 / 3 / 4).
// ===========================================================================
@OptIn(ExperimentalMaterial3Api::class)                      // TopAppBar is still an experimental Material 3 API
@Composable
fun SettingsScreen(modifier: Modifier = Modifier) {
    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = { TopAppBar(title = { Text("Settings") }) }, // the screen title (DONE)
    ) { innerPadding ->
        // The body is a vertical-scroll Column so a long list (or a small screen)
        // can scroll, and padding(innerPadding) keeps content clear of the bars.
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState()),
        ) {

            // ─────────────── TODO 1 (you): Show every row ───────────────
            // Right now we render only ONE hard-coded row. Instead, render ALL
            // items from the `settings` list. The simplest way (you are already
            // inside a verticalScroll Column) is:
            //
            //     settings.forEach { item ->
            //         ... one SettingRow per item ...
            //     }
            //
            // (A LazyColumn also works, but it must NOT be nested inside this
            //  verticalScroll Column — if you choose LazyColumn, remove the
            //  .verticalScroll(...) above and put items(settings) { } here.)
            //
            // For EACH item you create a SettingRow. The toggle's on/off value is
            // handled in TODO 3 below — for now you may pass isOn = item.initiallyOn
            // and onToggle = {} just to get all six rows on screen.
            //
            // ─────────────── TODO 3 (you): Make toggles work ───────────────
            // A Switch will not move on its own — it shows whatever `checked` value
            // you give it. To make it flip, each row needs its OWN remembered state:
            //
            //     var on by remember { mutableStateOf(item.initiallyOn) }
            //
            // Then wire that state into the row:
            //     SettingRow(item = item, isOn = on, onToggle = { on = it })
            // Tapping the Switch calls onToggle(newValue), which updates `on`,
            // which recomposes the row with the new checked value. That is "state
            // hoisting": the parent OWNS the state, the row just displays it.
            // (See Lab 5 for remember + mutableStateOf.)
            //
            // ─────────────── TODO 4 (optional, you): Footer divider ───────────────
            // Add a HorizontalDivider() just BEFORE the last row ("About") so it
            // reads like a separate footer section. With a forEach you can do this
            // by checking the index (e.g. settings.forEachIndexed { i, item -> ... })
            // and emitting HorizontalDivider() when item.label == "About".
            //
            // Placeholders below (replace with your real list). They keep the screen
            // compiling and visible until you implement TODO 1/3/4:

            //TODO 1
            settings.forEach { item ->

                // TODO 3 - Each toggle row remembers its own on/off state.
                var on by remember {
                    mutableStateOf(item.initiallyOn)
                }

                SettingRow(
                    item = item,
                    isOn = on,
                    onToggle = { on = it }
                )
            }

            Spacer(modifier = Modifier.width(0.dp))           // harmless spacer; remove freely
        }
    }
}

// ===========================================================================
// MainActivity — the app's single Activity and Android's entry point.
// ===========================================================================
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()                                    // draw edge-to-edge behind the system bars
        setContent {
            Hw5SettingsListTheme {                            // apply our Material 3 colors + typography
                SettingsScreen()                              // show the settings screen
            }
        }
    }
}

// ===========================================================================
// @Preview — render the screen in Android Studio's design pane (no device needed).
// As shipped this shows the placeholders; once you finish the TODOs the preview
// will show the full six-row settings list.
// ===========================================================================
@Preview(name = "Settings", showBackground = true, widthDp = 380, heightDp = 720)
@Composable
private fun SettingsScreenPreview() {
    Hw5SettingsListTheme { SettingsScreen() }
}
