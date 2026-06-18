// =============================================================================
// MainActivity.kt  —  HOMEWORK 5: "Settings List"  —  SOLUTION (answer key)
//
// This is the COMPLETED version of the homework: every TODO has been implemented
// and each filled-in slot is marked with a "// SOLUTION:" comment explaining what
// the code does and why. Compare it against the starter to see the diff.
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
// FINISHED SCREEN — what this solution produces:
//   • a "Settings" screen title in the top app bar,
//   • SIX rows: Notifications, Dark mode, Data saver (each a Switch),
//               Privacy, Language, About (each a "›" chevron),
//   • the toggle switches actually FLIP when you tap them,
//   • a divider separating the main settings from the "About" footer row.
//
// WHAT WAS ALREADY PROVIDED (the starter shipped these):
//   • the Scaffold + TopAppBar showing the "Settings" title,
//   • the enum Kind { TOGGLE, NAV } and the SettingItem data class,
//   • the `settings` list of all six items,
//   • the SettingRow composable's SIGNATURE (its parameter list).
//
// THE TODOs THAT THIS SOLUTION IMPLEMENTS:
//   TODO 1 — Show every row: render ALL items from `settings`, not just one.
//   TODO 2 — Row layout: lay SettingRow out as icon · label(weight) · control.
//   TODO 3 — Make toggles work: give each TOGGLE row remembered on/off state.
//   TODO 4 — add a divider above the "About" footer row.
// =============================================================================
package com.example.hw5settingslist

// --- Android framework --------------------------------------------------------
import android.os.Bundle                                     // savedInstanceState type passed to onCreate
import androidx.activity.ComponentActivity                   // base Activity that can host a Compose UI
import androidx.activity.compose.setContent                  // installs a Compose UI tree as the Activity content
import androidx.activity.enableEdgeToEdge                    // draw behind the system bars for a modern look

// --- Compose foundation: layout + scrolling ----------------------------------
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
import androidx.compose.runtime.key                          // gives each looped row a stable identity (TODO 3)
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
// The signature receives the row's data plus a way to flip the toggle:
//   • item     — the SettingItem to draw (its icon, label, and kind).
//   • isOn      — for a TOGGLE row, the CURRENT on/off value to show on the Switch.
//                 (Ignored by NAV rows, which show a chevron instead.)
//   • onToggle — called when the user taps the Switch, with the new value.
//                 The PARENT owns the state and updates it — this is "state
//                 hoisting": the row only displays state and reports taps.
//
// The BODY (TODO 2, implemented below) lays the row out as:
//     [icon]   Label .................................................   [control]
// ===========================================================================
@Composable
fun SettingRow(
    item: SettingItem,
    isOn: Boolean,
    onToggle: (Boolean) -> Unit,
) {
    // SOLUTION (TODO 2): one settings row laid out as  icon · label · control.
    // A Row places its children left-to-right on a single horizontal line.
    Row(
        // fillMaxWidth so the row spans the screen; the padding gives each row some
        // breathing room (16.dp on the sides, 12.dp top/bottom) so taps land comfortably.
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        // CenterVertically lines up the icon, the label text and the control on the
        // SAME center line — without it they'd align to the top and look ragged.
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // 1) The leading emoji "icon". sp (scale-independent px) so it respects the
        //    user's font-size setting; 22.sp makes it a touch bigger than body text.
        Text(item.icon, fontSize = 22.sp)
        // 2) A fixed 16.dp gap between the icon and the label.
        Spacer(Modifier.width(16.dp))
        // 3) The label. weight(1f) tells the Row "let this child EAT all the leftover
        //    horizontal space," which shoves whatever comes after it (the control) to
        //    the far END of the row — the classic "label on the left, control on the
        //    right" settings look, with no hard-coded widths.
        Text(item.label, modifier = Modifier.weight(1f))
        // 4) The trailing control depends on the row's KIND:
        //    • TOGGLE → a real Switch. `checked = isOn` shows the current value; the
        //      parent owns that value (state hoisting) and onToggle reports taps back.
        //    • NAV    → a "›" chevron hinting "tap to go to another screen."
        if (item.kind == Kind.TOGGLE) {
            Switch(checked = isOn, onCheckedChange = onToggle)
        } else {
            Text("›", fontSize = 24.sp)
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

            // SOLUTION (TODO 1): render EVERY item, not just one hard-coded row.
            // We're already inside a verticalScroll Column, so the simplest loop is
            // forEach — it emits one SettingRow per item, in list order. (We use
            // forEachIndexed because TODO 4's divider also wants the position; the
            // index itself isn't strictly needed since we key off the label.)
            settings.forEachIndexed { _, item ->

                // SOLUTION (TODO 4): a thin divider just BEFORE the "About" row, so
                // "About" reads as a separate footer section below the main list.
                // Emitting it here (inside the loop, guarded by the label) keeps it
                // in the right spot even if the list is reordered.
                if (item.label == "About") {
                    HorizontalDivider()
                }

                // SOLUTION (TODO 3): give EACH row its own on/off state.
                // `key(item.label)` gives every iteration a stable identity so its
                // remembered state stays attached to THIS item across recompositions
                // (e.g. if the list ever changes order, each toggle keeps its value).
                key(item.label) {
                    // remember + mutableStateOf holds the toggle's value across
                    // recomposition; `by` lets us read/write `on` as a plain Boolean.
                    // A NAV row simply never reads/changes this (it shows a chevron).
                    var on by remember { mutableStateOf(item.initiallyOn) }
                    // State hoisting: the PARENT (here) owns `on`; the row only
                    // DISPLAYS it (isOn) and REPORTS taps (onToggle). The tap sets
                    // `on = it`, which recomposes this key block with the new value,
                    // so the Switch visibly flips.
                    SettingRow(item = item, isOn = on, onToggle = { on = it })
                }
            }
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
// In this completed solution the preview shows the full six-row settings list,
// with three working Switches and a divider above the "About" footer row.
// ===========================================================================
@Preview(name = "Settings", showBackground = true, widthDp = 380, heightDp = 720)
@Composable
private fun SettingsScreenPreview() {
    Hw5SettingsListTheme { SettingsScreen() }
}
