// =============================================================================
// ui/screens/StatsScreen.kt  —  Tab 2, read-only aggregates + settings
//
// Derives all of its numbers from the same `destinations` list (it never stores
// its own copy), shows a per-continent breakdown, and hosts the app-wide
// dark-mode switch. StatTile — the small "big number + label" box — also lives
// here, since it is only used on this screen.
// =============================================================================
package com.example.exampleproject.ui.screens

import androidx.compose.foundation.layout.Arrangement       // controls spacing BETWEEN children (e.g. spacedBy)
import androidx.compose.foundation.layout.Column            // stacks children vertically
import androidx.compose.foundation.layout.Row               // lays children out horizontally
import androidx.compose.foundation.layout.Spacer            // empty box used to add fixed gaps
import androidx.compose.foundation.layout.fillMaxSize       // modifier: take all available width AND height
import androidx.compose.foundation.layout.fillMaxWidth      // modifier: take all available width
import androidx.compose.foundation.layout.height            // modifier: force a specific height
import androidx.compose.foundation.layout.padding           // modifier: add space around content
import androidx.compose.foundation.layout.size              // modifier: force a specific size (the sync spinner)
import androidx.compose.foundation.rememberScrollState      // remembers how far a scroll container is scrolled
import androidx.compose.foundation.verticalScroll           // makes a Column scroll vertically
import androidx.compose.material3.Button                    // filled, high-emphasis button (Save / Push)
import androidx.compose.material3.Card                      // a surface container with elevation/rounded corners
import androidx.compose.material3.CircularProgressIndicator // a spinner shown while the cloud sync runs
import androidx.compose.material3.ElevatedCard              // a Card variant with a stronger shadow
import androidx.compose.material3.HorizontalDivider         // thin horizontal separator line
import androidx.compose.material3.LinearProgressIndicator   // a horizontal progress bar (completion %)
import androidx.compose.material3.MaterialTheme             // access to the current theme's colors/typography
import androidx.compose.material3.OutlinedButton            // a low-emphasis, outlined button (Load / Pull)
import androidx.compose.material3.Switch                    // an on/off toggle (dark mode)
import androidx.compose.material3.Text                      // draws text
import androidx.compose.runtime.Composable                  // marks a function as emitting UI
import androidx.compose.ui.Alignment                        // how to align children (e.g. center vertically)
import androidx.compose.ui.Modifier                         // the "how to lay out / decorate" object
import androidx.compose.ui.tooling.preview.Preview          // enables @Preview rendering in Android Studio
import androidx.compose.ui.unit.dp                          // density-independent pixel unit (e.g. 16.dp)
import com.example.exampleproject.data.Destination          // the data model this screen aggregates
import com.example.exampleproject.data.initialDestinations  // sample data for the @Preview
import com.example.exampleproject.ui.theme.ExampleProjectTheme // wraps the @Preview
import kotlin.math.roundToInt                               // rounds the completion fraction to a whole percent

/**
 * StatsScreen (Stats tab) — read-only aggregates over the whole [destinations]
 * list, a per-continent breakdown, and a Settings card with the app-wide
 * dark-mode switch.
 *
 * @param destinations      every place (the screen derives all numbers from it).
 * @param darkTheme         current theme flag (drives the switch position).
 * @param onToggleDarkTheme flips the app-wide theme.
 * @param syncing           true while a cloud push/pull is in flight (drives the spinner).
 * @param onSaveLocal       force an immediate save of the list to this device.
 * @param onReset           reset the list back to the starter places (and save that).
 * @param onPushCloud       upload the list to the (simulated) cloud.
 * @param onPullCloud       download the list from the (simulated) cloud.
 * @param modifier          optional layout modifier supplied by the caller.
 */
@Composable
fun StatsScreen(
    destinations: List<Destination>,
    darkTheme: Boolean,
    onToggleDarkTheme: () -> Unit,
    syncing: Boolean,
    onSaveLocal: () -> Unit,
    onReset: () -> Unit,
    onPushCloud: () -> Unit,
    onPullCloud: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // Derived figures (recomputed whenever the list changes).
    val total = destinations.size
    val visited = destinations.count { it.visited }
    val toGo = total - visited
    val fraction = if (total == 0) 0f else visited.toFloat() / total
    val percent = (fraction * 100).roundToInt()
    // Group places by continent for the breakdown, e.g. {"Asia" -> [..], "Europe" -> [..]}.
    val byContinent = destinations.groupBy { it.continent }

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
    ) {
        Text("Your travel stats", style = MaterialTheme.typography.headlineSmall)
        Spacer(Modifier.height(16.dp))

        // Three headline numbers in a Row — each StatTile shares the width equally.
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            StatTile(label = "Places", value = total.toString(), modifier = Modifier.weight(1f))
            StatTile(label = "Visited", value = visited.toString(), modifier = Modifier.weight(1f))
            StatTile(label = "To go", value = toGo.toString(), modifier = Modifier.weight(1f))
        }
        Spacer(Modifier.height(20.dp))

        // Completion bar.
        Text("$percent% visited", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(8.dp))
        LinearProgressIndicator(
            progress = { fraction },
            modifier = Modifier.fillMaxWidth().height(8.dp),
        )
        Spacer(Modifier.height(24.dp))

        // Per-continent breakdown — one row per continent that has any places.
        Text("By continent", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(8.dp))
        byContinent.toSortedMap().forEach { (continent, places) ->
            Row(
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text(continent, style = MaterialTheme.typography.bodyLarge)
                Text(
                    "${places.count { it.visited }} / ${places.size}",
                    style = MaterialTheme.typography.bodyLarge,
                )
            }
            HorizontalDivider()
        }
        Spacer(Modifier.height(24.dp))

        // Settings card: the dark-mode switch. Toggling it calls back UP to
        // MainActivity, which flips the theme the whole app is wrapped in.
        ElevatedCard(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("Dark theme", style = MaterialTheme.typography.titleMedium)
                    Text(
                        "Re-colors the entire app instantly.",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
                Switch(checked = darkTheme, onCheckedChange = { onToggleDarkTheme() })
            }
        }
        Spacer(Modifier.height(16.dp))

        // Storage card. Persistence is now a real feature: every edit auto-saves to
        // this device and the list reloads on launch. The buttons call back UP to
        // WanderlistApp, which runs the (suspend) save/reset/sync work on the
        // DestinationStore implementations.
        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Storage", style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.height(4.dp))
                Text(
                    "Your list auto-saves to this device and reloads when you reopen " +
                        "the app — your dark-theme choice is remembered too.",
                    style = MaterialTheme.typography.bodySmall,
                )
                Spacer(Modifier.height(12.dp))

                // LOCAL — auto-saved on this device (SharedPreferences + JSON). These
                // buttons just make the saving visible (force a save) and let you wipe
                // it back to the starter list.
                Text("On this device (local)", style = MaterialTheme.typography.labelLarge)
                Spacer(Modifier.height(4.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = onSaveLocal, modifier = Modifier.weight(1f)) { Text("Save now") }
                    OutlinedButton(onClick = onReset, modifier = Modifier.weight(1f)) { Text("Reset") }
                }
                Spacer(Modifier.height(12.dp))

                // CLOUD — simulated remote sync. While `syncing` is true a spinner
                // shows and the buttons disable, exactly as for a real slow request.
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        "In the cloud (sync)",
                        style = MaterialTheme.typography.labelLarge,
                        modifier = Modifier.weight(1f),
                    )
                    if (syncing) CircularProgressIndicator(modifier = Modifier.size(18.dp))
                }
                Spacer(Modifier.height(4.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = onPushCloud, enabled = !syncing, modifier = Modifier.weight(1f)) {
                        Text("Push")
                    }
                    OutlinedButton(onClick = onPullCloud, enabled = !syncing, modifier = Modifier.weight(1f)) {
                        Text("Pull")
                    }
                }
            }
        }
        Spacer(Modifier.height(16.dp))

        // About card.
        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("About Wanderlist", style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.height(4.dp))
                Text(
                    "A sample app combining Jetpack Compose, Navigation 3, and " +
                        "persistence: bottom-tab navigation, a list → detail drill-down, " +
                        "a form, hoisted state, and on-device storage — split across " +
                        "small, single-purpose files.",
                    style = MaterialTheme.typography.bodyMedium,
                )
            }
        }
    }
}

/**
 * StatTile — a small reusable stat box: a big number above a label, centered, on
 * a Card. Defined once and used three times above — a tiny example of factoring a
 * repeated piece of UI into its own Composable.
 *
 * @param label    the caption under the number.
 * @param value    the number (already formatted as a String).
 * @param modifier supplied by the caller — the Stats row passes weight(1f).
 */
@Composable
fun StatTile(label: String, value: String, modifier: Modifier = Modifier) {
    Card(modifier = modifier) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(value, style = MaterialTheme.typography.headlineMedium)
            Text(label, style = MaterialTheme.typography.labelMedium)
        }
    }
}

// The Stats screen, fed the starter data (light theme, switch off).
@Preview(name = "Stats", showBackground = true, widthDp = 320, heightDp = 560)
@Composable
fun StatsScreenPreview() {
    ExampleProjectTheme {
        StatsScreen(
            destinations = initialDestinations,
            darkTheme = false,
            onToggleDarkTheme = {},
            syncing = false,
            onSaveLocal = {},
            onReset = {},
            onPushCloud = {},
            onPullCloud = {},
        )
    }
}
