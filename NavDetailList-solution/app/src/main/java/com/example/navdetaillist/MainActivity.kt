package com.example.navdetaillist

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.clickable                // makes a row tappable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn          // scrolling list
import androidx.compose.foundation.lazy.items               // iterate a List inside a LazyColumn
import androidx.compose.material3.Button
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
// Navigation 3 — modern, Compose-first navigation (single Activity, no Intents).
import androidx.navigation3.runtime.NavKey
import androidx.navigation3.runtime.entryProvider
import androidx.navigation3.runtime.rememberNavBackStack
import androidx.navigation3.ui.NavDisplay
import com.example.navdetaillist.ui.theme.NavDetailListTheme
import kotlinx.serialization.Serializable

// ===========================================================================
// DATA
// A tiny in-memory data source. In a real app this would come from a database
// or network; here a hardcoded list is enough to demonstrate list -> detail.
// ===========================================================================

data class Item(val id: Int, val title: String, val blurb: String, val rating: Int)  // B3: new `rating` field.

private val sampleItems = listOf(
    Item(1, "Mercury", "The smallest planet and the closest to the Sun.", 3),
    Item(2, "Venus", "The hottest planet, wrapped in thick clouds of acid.", 2),
    Item(3, "Earth", "The only planet known to support life — so far.", 5),
    Item(4, "Mars", "The red planet, a frequent target for rovers.", 4),
    Item(5, "Jupiter", "The largest planet, a gas giant with a great red spot.", 5),
    Item(6, "Saturn", "The ringed gas giant, second largest in the system.", 5),  // B3: new entry.
)

// Look an item up by its id. The Detail screen receives only the id and resolves
// the full item here — the id is the small piece of data that travels in the key.
private fun itemById(id: Int): Item = sampleItems.first { it.id == id }

// ===========================================================================
// NAVIGATION KEYS
// Each screen is identified by a key. The key also carries that screen's arguments.
// ListKey has none; DetailKey carries the id of the tapped item.
// ===========================================================================

@Serializable
data object ListKey : NavKey                                // the list screen (no arguments)

@Serializable
data class DetailKey(val itemId: Int) : NavKey             // the detail screen; itemId = which item was tapped

/**
 * MainActivity — the app's single Activity. It hosts the Nav3 back stack and swaps
 * between the list screen and the detail screen.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            NavDetailListTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    AppNavigation(modifier = Modifier.padding(innerPadding))
                }
            }
        }
    }
}

/**
 * AppNavigation — owns the back stack and maps each key to its screen.
 */
@Composable
fun AppNavigation(modifier: Modifier = Modifier) {
    // Back stack starts on the list screen.
    val backStack = rememberNavBackStack(ListKey)

    NavDisplay(
        backStack = backStack,
        modifier = modifier,
        onBack = { backStack.removeLastOrNull() },          // back = pop the top key
        // entryProvider is a DSL (a small "language" for one job): it builds the
        // map of "which key type -> which screen". You call entry<...> once per
        // screen inside the { } block, and Nav3 runs the block whose key type
        // matches the key currently on top of the back stack.
        //
        // How to read one  entry<KeyType> { key -> SomeScreen(...) }  line:
        //   • entry          — a Nav3 builder function (from
        //                      androidx.navigation3.runtime) that registers ONE
        //                      screen for ONE key type.
        //   • <KeyType>      — a GENERIC TYPE ARGUMENT, in angle brackets (a TYPE
        //                      slot, not a value in parentheses): the key type this
        //                      block handles. Nav3 matches it against the top key.
        //   • { key -> ... } — the @Composable CONTENT shown while that key is on
        //                      top. The lambda is handed the key instance, so a
        //                      data-class key can read its arguments (e.g. key.itemId).
        //                      A data-OBJECT key carries no data, so its block can
        //                      omit the `key ->` parameter.
        //
        // WHEN does an entry block RUN? entry<...> { } only REGISTERS a screen here
        // (like adding a `case` to a switch) — the { } body does NOT run yet. NavDisplay
        // runs the body whose key type matches the key currently on TOP of the back
        // stack: when you push that key (navigate forward), when you pop back to it, and
        // on recomposition while it is showing. A key in the stack but not on top is kept
        // (state preserved) but not drawn; popping it off removes its screen from
        // composition. So pushing a key turns its screen on and popping turns it off —
        // and `key` is the exact instance on top, so the same block runs with different
        // data per instance (e.g. ItemsKey(1) vs ItemsKey(5)).
        entryProvider = entryProvider {
            entry<ListKey> {
                ListScreen(
                    items = sampleItems,
                    // Tapping a row pushes a DetailKey carrying THAT item's id = navigate forward.
                    // THE JUMP — how a tap reaches the next screen: this line does NOT name a
                    // screen, it just ADDS A KEY to the back stack. NavDisplay then matches that
                    // key by its TYPE to the matching entry<...> { } block above and runs it; the
                    // id inside the key only chooses WHICH data that screen shows, not WHICH screen
                    // — so every key of this type lands on the same entry block.
                    onOpen = { id -> backStack.add(DetailKey(id)) }
                )
            }
            entry<DetailKey> { key ->
                // key.itemId is the argument; resolve it to the full item to display.
                DetailScreen(
                    item = itemById(key.itemId),
                    onBack = { backStack.removeLastOrNull() },
                    // B4: open the NEXT item's detail (wrapping last -> first) by PUSHING
                    // another DetailKey onto the stack.
                    onNext = {
                        val idx = sampleItems.indexOfFirst { it.id == key.itemId }
                        val next = sampleItems[(idx + 1) % sampleItems.size]   // % wraps around
                        backStack.add(DetailKey(next.id))
                    },
                )
            }
        }
    )
}

/** List screen: a scrolling list of items; tapping one calls onOpen with its id. */
@Composable
fun ListScreen(
    items: List<Item>,
    onOpen: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyColumn(modifier = modifier.fillMaxSize()) {
        items(items) { item ->                              // draw one row per item
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    // OS vs COMPOSE vs YOUR CODE — what a tap really is:
                    //   • Android (the OS) only reports a raw touch at a pixel (x, y); it knows
                    //     nothing about rows, items, names, or ids.
                    //   • Compose hit-tests that pixel to find WHICH composable sits there (this
                    //     one) and invokes its click lambda.
                    //   • YOUR code gives the tap its MEANING: the click lambda passes the exact
                    //     value you wired here (e.g. this row's id). "What was selected" is meaning
                    //     your code attaches to a raw touch — the OS never knows about it.
                    .clickable { onOpen(item.id) }          // whole row is tappable -> navigate
                    .padding(16.dp)
            ) {
                Text(text = item.title, style = MaterialTheme.typography.titleMedium)
                Text(text = item.blurb, style = MaterialTheme.typography.bodyMedium)
                Text(text = "★ ${item.rating}/5", style = MaterialTheme.typography.bodySmall)  // B3: rating on each row
            }
            HorizontalDivider()                             // thin line between rows
        }
    }
}

/** Detail screen: shows the item resolved from the id in the key, plus a Back button. */
@Composable
fun DetailScreen(
    item: Item,
    onBack: () -> Unit,
    onNext: () -> Unit,                                     // B4: open the next item's detail
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier.fillMaxSize().padding(16.dp)) {
        Text(text = item.title, style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(8.dp))
        Text(text = item.blurb, style = MaterialTheme.typography.bodyLarge)
        Spacer(modifier = Modifier.height(8.dp))
        Text(text = "Rating: ${item.rating}/5", style = MaterialTheme.typography.bodyMedium)  // B3: rating on detail
        Spacer(modifier = Modifier.height(24.dp))
        Button(onClick = onNext) {                          // B4: navigate sideways to the next item
            Text("Next")
        }
        Spacer(modifier = Modifier.height(8.dp))
        Button(onClick = onBack) {                          // pop back to the list
            Text("Back to list")
        }
    }
}

@Preview(showBackground = true)
@Composable
fun ListScreenPreview() {
    NavDetailListTheme {
        ListScreen(items = sampleItems, onOpen = {})
    }
}

@Preview(showBackground = true)
@Composable
fun DetailScreenPreview() {
    NavDetailListTheme {
        DetailScreen(item = sampleItems.first(), onBack = {}, onNext = {})  // B4: preview supplies a no-op onNext
    }
}
