// =============================================================================
// ui/screens/AddDestinationScreen.kt  —  Tab 1, the form
//
// A FORM for creating a new place. It demonstrates the common Compose input
// controls (text fields, chips, a slider, a switch), simple validation, and
// keyboard/IME handling. All form state lives LOCALLY here; on submit it hands
// the finished values UP via [onAdd] — the host (WanderlistApp) is what actually
// adds the place to the shared list.
// =============================================================================
package com.example.exampleproject.ui.screens

import androidx.compose.foundation.horizontalScroll         // lets a Row scroll sideways (the continent chips)
import androidx.compose.foundation.layout.Arrangement       // controls spacing BETWEEN children (e.g. spacedBy)
import androidx.compose.foundation.layout.Column            // stacks children vertically
import androidx.compose.foundation.layout.Row               // lays children out horizontally
import androidx.compose.foundation.layout.Spacer            // empty box used to add fixed gaps
import androidx.compose.foundation.layout.fillMaxSize       // modifier: take all available width AND height
import androidx.compose.foundation.layout.fillMaxWidth      // modifier: take all available width
import androidx.compose.foundation.layout.height            // modifier: force a specific height
import androidx.compose.foundation.layout.padding           // modifier: add space around content
import androidx.compose.foundation.rememberScrollState      // remembers how far a scroll container is scrolled
import androidx.compose.foundation.text.KeyboardActions     // what the IME action button (Next / Done) actually does
import androidx.compose.foundation.text.KeyboardOptions     // configures the on-screen keyboard's action button
import androidx.compose.foundation.verticalScroll           // makes a Column scroll vertically
import androidx.compose.material3.Button                    // filled, high-emphasis button
import androidx.compose.material3.FilterChip                // a toggleable "chip" (single-select continent group)
import androidx.compose.material3.MaterialTheme             // access to the current theme's colors/typography
import androidx.compose.material3.OutlinedTextField         // a single-line text input with an outline + label
import androidx.compose.material3.Slider                    // a draggable value selector (the excitement 1–5)
import androidx.compose.material3.Switch                    // an on/off toggle (already-visited)
import androidx.compose.material3.Text                      // draws text
import androidx.compose.runtime.Composable                  // marks a function as emitting UI
import androidx.compose.runtime.getValue                    // property-delegate read for State<T> (the `by` getter)
import androidx.compose.runtime.mutableFloatStateOf         // observable Float state (the slider value)
import androidx.compose.runtime.mutableStateOf              // observable state holder for any type
import androidx.compose.runtime.remember                    // keeps a value across recompositions
import androidx.compose.runtime.setValue                    // property-delegate write for MutableState<T>
import androidx.compose.ui.Alignment                        // how to align children (e.g. center vertically)
import androidx.compose.ui.Modifier                         // the "how to lay out / decorate" object
import androidx.compose.ui.focus.FocusRequester             // a handle used to move keyboard focus to a field
import androidx.compose.ui.focus.focusRequester             // modifier that attaches a FocusRequester to a field
import androidx.compose.ui.platform.LocalFocusManager       // lets us clear focus (dismiss the keyboard) on Done
import androidx.compose.ui.text.input.ImeAction             // which action button the keyboard shows (Next / Done)
import androidx.compose.ui.tooling.preview.Preview          // enables @Preview rendering in Android Studio
import androidx.compose.ui.unit.dp                          // density-independent pixel unit (e.g. 16.dp)
import com.example.exampleproject.data.CONTINENTS           // continent options for the @Preview
import com.example.exampleproject.data.priorityStars        // formats the slider's 1–5 value as stars
import com.example.exampleproject.ui.theme.ExampleProjectTheme // wraps the @Preview
import kotlin.math.roundToInt                               // rounds the slider's Float to a whole 1–5 value

/**
 * AddDestinationScreen (Add tab) — a FORM for creating a new place. Demonstrates
 * the common Compose input controls and a tiny bit of validation: the Add button
 * stays disabled until both text fields have content.
 *
 * All form state lives LOCALLY here in remembers. Submitting hands the values up
 * via [onAdd]; the caller adds the place and resets the screen by switching tabs.
 *
 * @param continents the continent options shown as single-select chips.
 * @param onAdd       invoked with (name, country, continent, priority, visited)
 *                    when the user taps Add.
 * @param modifier    optional layout modifier supplied by the caller.
 */
@Composable
fun AddDestinationScreen(
    continents: List<String>,
    onAdd: (name: String, country: String, continent: String, priority: Int, visited: Boolean) -> Unit,
    modifier: Modifier = Modifier,
) {
    // --- Local form state (screen state, so plain remember is correct here) ---
    var name by remember { mutableStateOf("") }
    var country by remember { mutableStateOf("") }
    var continent by remember { mutableStateOf(continents.first()) }
    var priority by remember { mutableFloatStateOf(3f) }      // slider works in Float; we round to Int on submit
    var alreadyVisited by remember { mutableStateOf(false) }

    // Validation rule: require a name and a country before allowing Add.
    val canAdd = name.isNotBlank() && country.isNotBlank()

    // Keyboard/IME helpers: countryFocus lets the "Next" key on the name field jump
    // to the Country field; focusManager lets "Done" on the last field dismiss the keyboard.
    val countryFocus = remember { FocusRequester() }
    val focusManager = LocalFocusManager.current

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
    ) {
        Text("Add a place", style = MaterialTheme.typography.headlineSmall)
        Spacer(Modifier.height(16.dp))

        // Text inputs. `value` + `onValueChange` is the hoisted-state pattern: the
        // field shows whatever `name` holds and reports edits back into it.
        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Place name") },
            singleLine = true,
            // Show a "Next" action on the keyboard; tapping it advances focus to Country.
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
            keyboardActions = KeyboardActions(onNext = { countryFocus.requestFocus() }),
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
            value = country,
            onValueChange = { country = it },
            label = { Text("Country") },
            singleLine = true,
            // Show a "Done" action; tapping it dismisses the keyboard. The
            // focusRequester below is the target the name field's "Next" jumps to.
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
            keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() }),
            modifier = Modifier.fillMaxWidth().focusRequester(countryFocus),
        )
        Spacer(Modifier.height(16.dp))

        // Continent: a horizontally-scrolling Row of single-select FilterChips.
        // Selecting one sets `continent`; the chips' `selected` flag shows which.
        Text("Continent", style = MaterialTheme.typography.labelLarge)
        Spacer(Modifier.height(8.dp))
        Row(
            modifier = Modifier.horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            continents.forEach { option ->
                FilterChip(
                    selected = continent == option,
                    onClick = { continent = option },
                    label = { Text(option) },
                )
            }
        }
        Spacer(Modifier.height(16.dp))

        // Excitement: a 1–5 Slider. valueRange sets the ends; steps = 3 puts 3
        // stops (2, 3, 4) BETWEEN the ends, giving five snap positions total.
        Text("Excitement: ${priorityStars(priority.roundToInt())}", style = MaterialTheme.typography.labelLarge)
        Slider(
            value = priority,
            onValueChange = { priority = it },
            valueRange = 1f..5f,
            steps = 3,
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(8.dp))

        // A Switch in a Row: a label on the left (weight pushes the switch right).
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("I've already been here", modifier = Modifier.weight(1f))
            Switch(checked = alreadyVisited, onCheckedChange = { alreadyVisited = it })
        }
        Spacer(Modifier.height(24.dp))

        // Submit. `enabled = canAdd` greys the button out until the form is valid —
        // a clean way to communicate "fill these in first" without an error message.
        Button(
            onClick = { onAdd(name, country, continent, priority.roundToInt(), alreadyVisited) },
            enabled = canAdd,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Add to Wanderlist")
        }
    }
}

// The Add form (its initial, empty state).
@Preview(name = "Add", showBackground = true, widthDp = 320, heightDp = 560)
@Composable
fun AddDestinationScreenPreview() {
    ExampleProjectTheme {
        AddDestinationScreen(continents = CONTINENTS, onAdd = { _, _, _, _, _ -> })
    }
}
