// =============================================================================
// ui/screens/ExploreScreen.kt  —  Tab 0, the list
//
// One file per screen is a common Android convention: a screen and the small
// pieces it's built from (here DestinationCard) live together, along with the
// @Preview that renders it. Screens are STATELESS — they take data + callbacks
// and never own app state — so they can be previewed and reused freely.
// =============================================================================
package com.example.exampleproject.ui.screens

import androidx.compose.foundation.clickable                // makes any composable tappable
import androidx.compose.foundation.layout.Arrangement       // controls spacing BETWEEN children (e.g. spacedBy)
import androidx.compose.foundation.layout.Box               // overlaps/centers a single child
import androidx.compose.foundation.layout.Column            // stacks children vertically
import androidx.compose.foundation.layout.PaddingValues     // padding AROUND a LazyColumn's content
import androidx.compose.foundation.layout.Row               // lays children out horizontally
import androidx.compose.foundation.layout.Spacer            // empty box used to add fixed gaps
import androidx.compose.foundation.layout.fillMaxSize       // modifier: take all available width AND height
import androidx.compose.foundation.layout.fillMaxWidth      // modifier: take all available width
import androidx.compose.foundation.layout.height            // modifier: force a specific height
import androidx.compose.foundation.layout.padding           // modifier: add space around content
import androidx.compose.foundation.layout.width             // modifier: force a specific width
import androidx.compose.foundation.lazy.LazyColumn          // scrolling list (only renders visible rows)
import androidx.compose.foundation.lazy.items               // iterate a List inside a LazyColumn
import androidx.compose.material3.Card                      // a surface container with elevation/rounded corners
import androidx.compose.material3.FilterChip                // a toggleable "chip" (the visited toggle)
import androidx.compose.material3.HorizontalDivider         // thin horizontal separator line
import androidx.compose.material3.LinearProgressIndicator   // a horizontal progress bar (completion %)
import androidx.compose.material3.MaterialTheme             // access to the current theme's colors/typography
import androidx.compose.material3.Text                      // draws text
import androidx.compose.runtime.Composable                  // marks a function as emitting UI
import androidx.compose.ui.Alignment                        // how to align children (e.g. center vertically)
import androidx.compose.ui.Modifier                         // the "how to lay out / decorate" object
import androidx.compose.ui.text.style.TextAlign             // horizontal text alignment
import androidx.compose.ui.tooling.preview.Preview          // enables @Preview rendering in Android Studio
import androidx.compose.ui.unit.dp                          // density-independent pixel unit (e.g. 16.dp)
import androidx.compose.ui.unit.sp                          // scalable-pixel unit (used for the emoji glyph size)
import com.example.exampleproject.data.Destination          // the data model this screen renders
import com.example.exampleproject.data.initialDestinations  // sample data for the @Preview
import com.example.exampleproject.ui.theme.ExampleProjectTheme // wraps the @Preview

/**
 * ExploreScreen (Explore tab, root) — a progress header above a scrolling list of
 * place cards. Tapping a card drills into its detail; the chip on each card flips
 * that place's visited status inline.
 *
 * Stateless: it renders the [destinations] it's given and reports events via
 * [onOpen] / [onToggleVisited]. It owns no app state.
 *
 * @param destinations    the places to show.
 * @param onOpen          invoked with a place's id when its card is tapped.
 * @param onToggleVisited invoked with a place's id when its status chip is tapped.
 * @param modifier        optional layout modifier supplied by the caller.
 */
@Composable
fun ExploreScreen(
    destinations: List<Destination>,
    onOpen: (Int) -> Unit,
    onToggleVisited: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier.fillMaxSize()) {
        // --- Progress header (does not scroll) ---
        // Derived values: counting the list in composition recomposes correctly
        // whenever the list changes. fraction guards against divide-by-zero.
        val total = destinations.size
        val visited = destinations.count { it.visited }
        val fraction = if (total == 0) 0f else visited.toFloat() / total

        Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
            Text("Places visited", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(8.dp))
            // The lambda form of progress is the current, non-deprecated API.
            LinearProgressIndicator(
                progress = { fraction },
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(4.dp))
            Text(
                "$visited of $total",
                style = MaterialTheme.typography.bodyMedium,
            )
        }
        HorizontalDivider()

        // --- The list (or an empty state if every place was deleted) ---
        if (destinations.isEmpty()) {
            // A friendly empty state — what the user sees with nothing on the list.
            Box(modifier = Modifier.fillMaxSize().padding(32.dp), contentAlignment = Alignment.Center) {
                Text(
                    "No places yet.\nTap the ＋ button to add one!",
                    style = MaterialTheme.typography.bodyLarge,
                    textAlign = TextAlign.Center,
                )
            }
        } else {
            // LazyColumn only composes the rows currently visible, so long lists
            // stay fast. `key = { it.id }` gives each row a STABLE identity so
            // Compose can reuse/reorder them efficiently as the list changes.
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                items(destinations, key = { it.id }) { destination ->
                    DestinationCard(
                        destination = destination,
                        onOpen = { onOpen(destination.id) },
                        onToggleVisited = { onToggleVisited(destination.id) },
                    )
                }
            }
        }
    }
}

/**
 * DestinationCard — one row in the Explore list: an emoji, the name/country/blurb,
 * and a FilterChip that toggles visited status. Tapping the card body opens the
 * detail; tapping the chip flips visited without leaving the list.
 *
 * @param destination     the place to render.
 * @param onOpen          invoked when the card body is tapped.
 * @param onToggleVisited invoked when the status chip is tapped.
 * @param modifier        optional layout modifier supplied by the caller.
 */
@Composable
fun DestinationCard(
    destination: Destination,
    onOpen: () -> Unit,
    onToggleVisited: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // The whole card is tappable (-> open detail). We use a plain Card plus a
    // .clickable modifier rather than the experimental clickable-Card overload.
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onOpen() },
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            // The emoji "photo" on the left.
            Text(text = destination.emoji, fontSize = 34.sp)
            Spacer(Modifier.width(16.dp))
            // The text block takes all the remaining width (weight = 1f) so the
            // chip is pushed to the far right.
            Column(modifier = Modifier.weight(1f)) {
                Text(destination.name, style = MaterialTheme.typography.titleMedium)
                Text(
                    "${destination.country} • ${destination.continent}",
                    style = MaterialTheme.typography.labelMedium,
                )
                Spacer(Modifier.height(4.dp))
                Text(destination.blurb, style = MaterialTheme.typography.bodyMedium)
            }
            Spacer(Modifier.width(12.dp))
            // A FilterChip whose SELECTED state mirrors `visited`. Tapping it flips
            // the status; the `selected` flag drives its filled/outlined look.
            FilterChip(
                selected = destination.visited,
                onClick = onToggleVisited,
                label = { Text(if (destination.visited) "Visited" else "To go") },
            )
        }
    }
}

// The Explore list, fed the starter data.
@Preview(name = "Explore", showBackground = true, widthDp = 320, heightDp = 560)
@Composable
fun ExploreScreenPreview() {
    ExampleProjectTheme {
        ExploreScreen(destinations = initialDestinations, onOpen = {}, onToggleVisited = {})
    }
}
