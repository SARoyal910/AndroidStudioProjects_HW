// =============================================================================
// MainActivity.kt  —  the ENTRY POINT (and a map of the project)
//
// "Wanderlist" is a multi-screen sample app (a travel bucket list, two mini-games,
// and a storage demo) that pulls together what the course has covered — Jetpack
// Compose + Navigation 3 + persistence. Your list AND your theme choice are saved
// on the device, so they're still there the next time you open the app. Unlike the
// single-concept demos, the code here is split across SEVERAL files by concern,
// to show how a real app is organized. Not everything goes in one file!
//
// ─────────────────────────────────────────────────────────────────────────────
// HOW THE CODE IS ORGANIZED (start here, then follow the arrows)
// ─────────────────────────────────────────────────────────────────────────────
//   MainActivity.kt            ← you are here: the Activity, and the dark-theme
//                                state that wraps the whole app in a theme.
//
//   data/
//     Destination.kt           ← the DATA layer: the Destination model, the
//                                starter list, and a formatting helper. No UI.
//     storage/                 ← persistence: DestinationStore (the interface) +
//                                Local (device) and Cloud (simulated) for the LIST,
//                                plus SettingsStore for the dark-theme preference.
//
//   navigation/
//     NavKeys.kt               ← the seven @Serializable NavKeys (one per screen).
//     WanderlistApp.kt         ← the NAV HOST and the heart of the app: the
//                                hoisted state, one back stack per tab, the
//                                Scaffold (top bar / bottom tabs / FAB / snackbar),
//                                and the entryProvider that maps keys → screens.
//
//   ui/
//     screens/
//       ExploreScreen.kt       ← Tab 0: the list (+ DestinationCard).
//       DetailScreen.kt        ← reached by tapping a place (drill-down).
//       PlayMenuScreen.kt      ← Tab 1: a menu → the two games.
//       FlashcardScreen.kt     ←   game: a tap-to-flip flashcard deck.
//       GuessScreen.kt         ←   game: tap-to-guess (coordinate hit-testing).
//       AddDestinationScreen.kt← Tab 2: the form.
//       StatsScreen.kt         ← Tab 3: aggregates, dark-mode + the Storage card.
//     theme/                   ← Color.kt / Theme.kt / Type.kt (the Material theme).
//
// The dependency direction is one-way and clean: ui/screens depend on data;
// navigation wires the screens together; MainActivity just launches it all.
// Screens never reach "up" into navigation — they only take data + callbacks.
// =============================================================================
package com.example.exampleproject

import android.os.Bundle                                    // savedInstanceState type passed to onCreate
import androidx.activity.ComponentActivity                  // base Activity class with Compose support
import androidx.activity.compose.setContent                 // bridges an Activity to a Compose UI tree
import androidx.activity.enableEdgeToEdge                    // lets the app draw behind the system bars
import androidx.compose.runtime.getValue                    // property-delegate read for State<T> (the `by` getter)
import androidx.compose.runtime.mutableStateOf              // observable state holder (the dark-theme flag)
import androidx.compose.runtime.remember                    // keeps the SettingsStore across recompositions
import androidx.compose.runtime.saveable.rememberSaveable   // remembers state ACROSS rotation / process death
import androidx.compose.runtime.setValue                    // property-delegate write for MutableState<T>
import androidx.compose.ui.platform.LocalContext            // the Android Context (needed to open SettingsStore)
import com.example.exampleproject.data.storage.SettingsStore // persists the dark-theme preference on device
import com.example.exampleproject.navigation.WanderlistApp  // the nav host (navigation/WanderlistApp.kt)
import com.example.exampleproject.ui.theme.ExampleProjectTheme // the Material theme wrapper (ui/theme/Theme.kt)

/**
 * MainActivity — the app's single Activity and the entry point Android launches.
 *
 * In a Nav3 app you typically have exactly one Activity; it hosts the Compose UI
 * and the navigation back stacks, and Compose (not the Activity system) swaps
 * between screens.
 *
 * The ONE piece of state that lives here, above everything else, is the
 * DARK-THEME flag. It must sit OUTSIDE the theme it controls — the theme reads
 * `darkTheme`, so the state has to be created before (and above)
 * ExampleProjectTheme. Flipping it recomposes the whole app under a new scheme.
 *
 * That flag is also PERSISTED (via SettingsStore): we seed it from the saved value
 * at startup and write every change back, so the user's theme choice survives a
 * full app restart — not just a rotation.
 */
class MainActivity : ComponentActivity() {
    // onCreate runs once when the Activity is first created. This is where we
    // install the Compose UI tree as the Activity's content.
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)                 // always call through to the framework first
        enableEdgeToEdge()                                 // draw under the status/navigation bars for a modern look
        setContent {                                       // everything inside is the Compose UI
            // The on-device settings store. `remember` keeps the one instance across
            // recompositions; LocalContext gives it the Context it needs.
            val context = LocalContext.current
            val settingsStore = remember { SettingsStore(context) }

            // The app-wide dark-mode flag, SEEDED from the persisted value: reading
            // settingsStore.darkTheme here is a single, cheap, synchronous prefs read
            // at startup. rememberSaveable then keeps it across rotation; every toggle
            // below also writes it back to disk, so it survives a full app restart too.
            var darkTheme by rememberSaveable { mutableStateOf(settingsStore.darkTheme) }

            // Apply our app theme. We pass dynamicColor = false so the in-app
            // dark-mode switch produces an obvious, device-independent color flip
            // for the demo. (Set it to true to see wallpaper-based dynamic color
            // on Android 12+ instead — see ui/theme/Theme.kt.)
            ExampleProjectTheme(darkTheme = darkTheme, dynamicColor = false) {
                // The whole app is WanderlistApp (navigation/WanderlistApp.kt). We
                // hand it the current theme flag and a callback to flip it — classic
                // state hoisting: the STATE lives here, the SWITCH that changes it
                // lives down in StatsScreen. The callback flips the flag AND persists
                // it, keeping the in-memory state and the saved setting in lock-step.
                WanderlistApp(
                    darkTheme = darkTheme,
                    onToggleDarkTheme = {
                        darkTheme = !darkTheme
                        settingsStore.darkTheme = darkTheme   // persist the new choice
                    },
                )
            }
        }
    }
}
