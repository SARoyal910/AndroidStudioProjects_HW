// =============================================================================
// ui/screens/DetailScreen.kt  —  the fourth screen (drill-down from Explore)
//
// Shows everything about ONE place, plus a Visited toggle and a Delete action
// guarded by a confirm dialog. Like every screen here it is stateless about APP
// data — it gets a fully-resolved Destination and reports taps via callbacks —
// but it DOES own a little local UI state (whether the dialog is open).
// =============================================================================
package com.example.exampleproject.ui.screens

import androidx.compose.foundation.layout.Column            // stacks children vertically
import androidx.compose.foundation.layout.Spacer            // empty box used to add fixed gaps
import androidx.compose.foundation.layout.fillMaxSize       // modifier: take all available width AND height
import androidx.compose.foundation.layout.fillMaxWidth      // modifier: take all available width
import androidx.compose.foundation.layout.height            // modifier: force a specific height
import androidx.compose.foundation.layout.padding           // modifier: add space around content
import androidx.compose.foundation.rememberScrollState      // remembers how far a scroll container is scrolled
import androidx.compose.foundation.verticalScroll           // makes a Column scroll vertically
import androidx.compose.material3.AlertDialog               // a modal confirm/cancel dialog (delete confirmation)
import androidx.compose.material3.FilledTonalButton         // a medium-emphasis (tonal) button
import androidx.compose.material3.MaterialTheme             // access to the current theme's colors/typography
import androidx.compose.material3.OutlinedButton            // a low-emphasis, outlined button
import androidx.compose.material3.Text                      // draws text
import androidx.compose.material3.TextButton                // a text-only, lowest-emphasis button
import androidx.compose.runtime.Composable                  // marks a function as emitting UI
import androidx.compose.runtime.getValue                    // property-delegate read for State<T> (the `by` getter)
import androidx.compose.runtime.mutableStateOf              // observable state holder (dialog open flag)
import androidx.compose.runtime.remember                    // keeps a value across recompositions
import androidx.compose.runtime.setValue                    // property-delegate write for MutableState<T>
import androidx.compose.ui.Modifier                         // the "how to lay out / decorate" object
import androidx.compose.ui.tooling.preview.Preview          // enables @Preview rendering in Android Studio
import androidx.compose.ui.tooling.preview.PreviewParameter // feeds one value into a preview parameter
import androidx.compose.ui.tooling.preview.PreviewParameterProvider // supplies the SET of preview values
import androidx.compose.ui.unit.dp                          // density-independent pixel unit (e.g. 16.dp)
import androidx.compose.ui.unit.sp                          // scalable-pixel unit (the big emoji glyph)
import com.example.exampleproject.data.Destination          // the data model this screen renders
import com.example.exampleproject.data.initialDestinations  // sample data for the @Preview
import com.example.exampleproject.data.priorityStars        // formats the 1–5 priority as stars
import com.example.exampleproject.ui.theme.ExampleProjectTheme // wraps the @Preview

/**
 * DetailScreen (Explore tab, level 2 — the FOURTH screen) — everything about one
 * [destination], with a Visited toggle and a Delete action (guarded by a confirm
 * dialog). Scrolls so long notes fit on small screens.
 *
 * @param destination     the fully-resolved place to display.
 * @param onToggleVisited invoked when the Visited button is tapped.
 * @param onDelete        invoked (after confirmation) to remove this place.
 * @param onBack          invoked to pop back to the list.
 * @param modifier        optional layout modifier supplied by the caller.
 */
@Composable
fun DetailScreen(
    destination: Destination,
    onToggleVisited: () -> Unit,
    onDelete: () -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // Local UI state: whether the delete-confirmation dialog is open. This is
    // SCREEN state (not app state), so it correctly lives here in a remember.
    var showDeleteDialog by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())          // scroll if content is taller than the screen
            .padding(16.dp),
    ) {
        // Big emoji + headline.
        Text(text = destination.emoji, fontSize = 64.sp)
        Spacer(Modifier.height(8.dp))
        Text(destination.name, style = MaterialTheme.typography.headlineMedium)
        Text(
            "${destination.country} • ${destination.continent}",
            style = MaterialTheme.typography.titleSmall,
        )
        Spacer(Modifier.height(16.dp))

        // Excitement rating as stars, and the best time to go.
        Text("Excitement: ${priorityStars(destination.priority)}", style = MaterialTheme.typography.bodyMedium)
        Spacer(Modifier.height(8.dp))
        Text("Best season", style = MaterialTheme.typography.labelLarge)
        Text(destination.bestSeason, style = MaterialTheme.typography.bodyMedium)
        Spacer(Modifier.height(16.dp))

        // The longer notes.
        Text(destination.notes, style = MaterialTheme.typography.bodyLarge)
        Spacer(Modifier.height(24.dp))

        // Primary action: toggle visited. A tonal button reads as medium-emphasis.
        FilledTonalButton(onClick = onToggleVisited, modifier = Modifier.fillMaxWidth()) {
            Text(if (destination.visited) "Mark as not visited" else "Mark as visited")
        }
        Spacer(Modifier.height(8.dp))
        // Secondary action: go back (the TopAppBar arrow and System Back do this too).
        OutlinedButton(onClick = onBack, modifier = Modifier.fillMaxWidth()) {
            Text("Back to list")
        }
        Spacer(Modifier.height(8.dp))
        // Destructive action: open a confirm dialog before actually deleting.
        TextButton(onClick = { showDeleteDialog = true }, modifier = Modifier.fillMaxWidth()) {
            Text("Remove from list")
        }
    }

    // The confirm dialog. It only enters composition while showDeleteDialog is
    // true. "Remove" calls onDelete (which pops + removes); both buttons close it.
    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },          // tap-outside / Back closes it
            title = { Text("Remove ${destination.name}?") },
            text = { Text("This takes it off your Wanderlist. You can always add it again later.") },
            confirmButton = {
                TextButton(onClick = {
                    showDeleteDialog = false
                    onDelete()
                }) { Text("Remove") }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) { Text("Cancel") }
            },
        )
    }
}

// Feeds every starter Destination to the detail preview — one render per place.
class DestinationPreviewProvider : PreviewParameterProvider<Destination> {
    override val values: Sequence<Destination> = initialDestinations.asSequence()
}

// The detail screen, once per place (covers visited and not-visited button text).
@Preview(name = "Detail", showBackground = true, widthDp = 320, heightDp = 560)
@Composable
fun DetailScreenPreview(
    @PreviewParameter(DestinationPreviewProvider::class) destination: Destination,
) {
    ExampleProjectTheme {
        DetailScreen(
            destination = destination,
            onToggleVisited = {},
            onDelete = {},
            onBack = {},
        )
    }
}
