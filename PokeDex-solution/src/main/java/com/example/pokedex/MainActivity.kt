// =============================================================================
// MainActivity.kt  —  the single Activity + the NAVIGATION 3 host
//
// CONCEPT THIS FILE TEACHES: a Nav3 app has ONE Activity that holds a back stack
// of "keys"; Compose swaps the screen whenever the top key changes. No Fragments,
// no Intents, no XML nav graph. This is the NavListDetail pattern with a Pokémon
// domain: a ListKey (no args) and a DetailKey that carries the tapped name.
//
// WHAT TO INSPECT:
//   • @Serializable keys implementing NavKey  — the destinations (+ their args).
//   • rememberNavBackStack(ListKey)           — the back stack, seeded at the list.
//   • NavDisplay { entryProvider { entry<…> } } — maps each key type to a screen.
//   • backStack.add(DetailKey(name))          — navigating forward = pushing a key.
//   • onBack = { backStack.removeLastOrNull() } — Back = popping the top key.
// =============================================================================

package com.example.pokedex

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
// --- Navigation 3 (exactly the imports NavListDetail / NavViewModelState use) ---
import androidx.navigation3.runtime.NavKey                  // marker every nav key implements
import androidx.navigation3.runtime.entryProvider           // DSL mapping each key type to a screen
import androidx.navigation3.runtime.rememberNavBackStack    // creates + remembers the back stack
import androidx.navigation3.ui.NavDisplay                   // renders the key on top of the stack
import com.example.pokedex.ui.DetailScreen
import com.example.pokedex.ui.ListScreen
import com.example.pokedex.ui.theme.PokeDexTheme
import kotlinx.serialization.Serializable                   // Nav3 keys must be @Serializable

// ===========================================================================
// NAVIGATION KEYS  —  one per screen; a key names a destination AND its arguments
// ===========================================================================

/** The list screen. `data object` = a singleton: there is only one list screen. */
@Serializable
data object ListKey : NavKey

/** The detail screen. `data class` because each one differs by WHICH Pokémon. */
@Serializable
data class DetailKey(val name: String) : NavKey             // the tapped Pokémon's name rides in the key

// ===========================================================================
// ACTIVITY  —  installs the Compose UI; hosts the nav back stack
// ===========================================================================

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()                                  // draw under the system bars
        setContent {
            PokeDexTheme {
                AppNavigation()
            }
        }
    }
}

/**
 * AppNavigation — owns the back stack and maps each key to its screen.
 *
 * The screens obtain their own ViewModels internally, so this host only has to
 * wire navigation: tapping a list row pushes a DetailKey; Back pops it.
 */
@Composable
fun AppNavigation() {
    // The back stack, seeded with the list screen and remembered across recomposition.
    val backStack = rememberNavBackStack(ListKey)

    NavDisplay(
        backStack = backStack,
        onBack = { backStack.removeLastOrNull() },          // Back = pop the top key
        entryProvider = entryProvider {
            // When ListKey is on top, show the list. A tap pushes a DetailKey.
            entry<ListKey> {
                ListScreen(onOpen = { name -> backStack.add(DetailKey(name)) })
            }
            // When a DetailKey is on top, show that Pokémon. `key` carries the name.
            entry<DetailKey> { key ->
                DetailScreen(
                    name = key.name,
                    onBack = { backStack.removeLastOrNull() },
                )
            }
        },
    )
}
