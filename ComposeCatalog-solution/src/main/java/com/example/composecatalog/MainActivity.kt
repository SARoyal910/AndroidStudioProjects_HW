// =============================================================================
// MainActivity.kt
//
// CONCEPT: THE JETPACK COMPOSE COMPONENT CATALOG ("what widget do I use?").
//
// This file is a TEACHING ARTIFACT and a REFERENCE. Where ComposeModernUI taught
// *how* Compose works (state hoisting, recomposition, previews) on a tiny screen,
// this project is a guided tour of the COMPONENTS THEMSELVES — one scrolling
// screen that shows, in order, the building blocks you reach for every day:
//
//   • Text            — drawing strings: typography roles, color, weight, italic,
//                        alignment, maxLines + ellipsis, underline.
//   • Buttons         — Button, FilledTonalButton, ElevatedButton, OutlinedButton,
//                        TextButton, IconButton (filled vs outlined emphasis).
//   • Floating action — FloatingActionButton, SmallFAB, ExtendedFAB.
//   • Selection       — Checkbox, RadioButton (a group), Switch.
//   • Sliders         — continuous Slider, stepped Slider, RangeSlider.
//   • Text input      — TextField, OutlinedTextField (label, placeholder, leading
//                        icon, single line, password masking, number keyboard).
//   • Containers      — Surface, Card, ElevatedCard, OutlinedCard.
//   • Layout primitives— Column, Row, Box, Spacer, HorizontalDivider.
//   • Icon & Image    — Icon (a tinted vector glyph) and Image (a bitmap/vector).
//   • Progress        — CircularProgressIndicator, LinearProgressIndicator
//                        (both indeterminate "spinner" and determinate "0–100%").
//   • Chips & badges  — AssistChip, FilterChip, SuggestionChip, BadgedBox + Badge.
//   • Dialogs         — AlertDialog opened from a button.
//   • Horizontal lists— LazyRow (a sideways-scrolling strip of cards).
//   • Scaffold chrome — TopAppBar, FloatingActionButton, Snackbar (this very
//                        screen is built inside a Scaffold).
//
// HOW TO READ IT:
//   Each component group is wrapped in a small reusable `ComponentSection` so the
//   screen reads like a labelled exhibit: a TITLE, a one-line WHAT-IT-IS, then the
//   live component(s). Scroll top-to-bottom and you have seen the whole toolbox.
//
// A NOTE ON STATE:
//   The interactive controls (Checkbox/Switch/Slider/TextField/dialog) keep their
//   value in a local `remember { mutableStateOf(...) }` right here in the screen,
//   so each demo is self-contained. The deeper lesson on WHERE state should live
//   (hoisting it into a stateless child or a ViewModel) is the job of the
//   ComposeModernUI and NavViewModelState projects — here we focus on the widgets.
// =============================================================================

// The package declaration — mirrors the folder path under src/main/java/.
package com.example.composecatalog

// --- Android framework imports ------------------------------------------------
import android.os.Bundle                                     // savedInstanceState type passed to onCreate
import androidx.activity.ComponentActivity                   // base Activity class that can host a Compose UI
import androidx.activity.compose.setContent                  // installs a Compose UI tree as the Activity's content
import androidx.activity.enableEdgeToEdge                    // lets the app draw behind the system status/nav bars

// --- Compose foundation: scrolling, layout, shapes, drawing -------------------
import androidx.compose.foundation.Image                     // draws a bitmap/vector painter (NOT theme-tinted like Icon)
import androidx.compose.foundation.background                // modifier: paint a solid color/shape behind content
import androidx.compose.foundation.layout.Arrangement        // controls spacing BETWEEN children in a Row/Column
import androidx.compose.foundation.layout.Box                // a layout that stacks/overlaps children on the z-axis
import androidx.compose.foundation.layout.Column             // a layout that stacks children VERTICALLY
import androidx.compose.foundation.layout.Row                // a layout that places children HORIZONTALLY
import androidx.compose.foundation.layout.Spacer             // an empty element used to insert a fixed-size gap
import androidx.compose.foundation.layout.fillMaxSize        // modifier: take ALL available width AND height
import androidx.compose.foundation.layout.fillMaxWidth       // modifier: take ALL available width
import androidx.compose.foundation.layout.height             // modifier: force a specific height
import androidx.compose.foundation.layout.padding            // modifier: add empty space AROUND content
import androidx.compose.foundation.layout.size               // modifier: force a specific width AND height
import androidx.compose.foundation.layout.width              // modifier: force a specific width
import androidx.compose.foundation.lazy.LazyRow              // a horizontally-scrolling list that composes visible items
import androidx.compose.foundation.lazy.items                // emits one item per element of a List in a LazyRow/Column
import androidx.compose.foundation.rememberScrollState       // remembers how far a scrollable has been scrolled
import androidx.compose.foundation.shape.CircleShape         // a fully-rounded (pill/circle) shape
import androidx.compose.foundation.text.KeyboardOptions      // configures the on-screen keyboard for a text field
import androidx.compose.foundation.verticalScroll            // modifier: make a Column scroll vertically

// --- Material 3 vector icons --------------------------------------------------
import androidx.compose.material.icons.Icons                 // the icon namespace (Icons.Default.* == Icons.Filled.*)
import androidx.compose.material.icons.filled.Add            // stock "+" icon
import androidx.compose.material.icons.filled.Check          // stock checkmark icon
import androidx.compose.material.icons.filled.Email          // stock envelope icon
import androidx.compose.material.icons.filled.Favorite       // stock heart icon
import androidx.compose.material.icons.filled.Notifications  // stock bell icon
import androidx.compose.material.icons.filled.Search         // stock magnifier icon
import androidx.compose.material.icons.filled.Settings       // stock gear icon
import androidx.compose.material.icons.filled.Star           // stock star icon

// --- Material 3 components ----------------------------------------------------
import androidx.compose.material3.AlertDialog                // a modal dialog with title/text/confirm/dismiss
import androidx.compose.material3.AssistChip                 // a compact action chip ("Add to calendar")
import androidx.compose.material3.Badge                      // a tiny status bubble (a count or dot)
import androidx.compose.material3.BadgedBox                  // wraps content and anchors a Badge to its corner
import androidx.compose.material3.Button                     // a filled, high-emphasis tappable button
import androidx.compose.material3.Card                       // a surface with rounded corners + slight elevation
import androidx.compose.material3.Checkbox                   // a square on/off control (multi-select)
import androidx.compose.material3.CircularProgressIndicator  // a spinning / determinate ring progress indicator
import androidx.compose.material3.ElevatedButton             // a button that sits on a raised, shadowed surface
import androidx.compose.material3.ElevatedCard               // a Card variant with a stronger shadow
import androidx.compose.material3.ExperimentalMaterial3Api   // opt-in marker for still-evolving M3 APIs (TopAppBar)
import androidx.compose.material3.ExtendedFloatingActionButton // a FAB with an icon AND a text label
import androidx.compose.material3.FilledTonalButton          // a medium-emphasis button (tinted, not fully filled)
import androidx.compose.material3.FilterChip                 // a toggleable chip that represents a filter
import androidx.compose.material3.FloatingActionButton       // the round, elevated primary-action button
import androidx.compose.material3.HorizontalDivider          // a thin horizontal rule between sections
import androidx.compose.material3.Icon                       // draws a (theme-tinted) vector glyph
import androidx.compose.material3.IconButton                 // a tappable, ripple-bearing wrapper around an Icon
import androidx.compose.material3.LinearProgressIndicator    // a horizontal bar progress indicator
import androidx.compose.material3.MaterialTheme              // entry point to the theme's colorScheme + typography
import androidx.compose.material3.OutlinedButton             // a medium-emphasis button with just an outline
import androidx.compose.material3.OutlinedCard               // a Card variant drawn with an outline, no shadow
import androidx.compose.material3.OutlinedTextField          // a text input with an outlined box
import androidx.compose.material3.RadioButton                // a round single-select control (one of a group)
import androidx.compose.material3.RangeSlider                // a slider with TWO thumbs selecting a min..max range
import androidx.compose.material3.Scaffold                   // standard screen frame (top bar, FAB, snackbar, insets)
import androidx.compose.material3.SmallFloatingActionButton  // a smaller variant of the FAB
import androidx.compose.material3.Slider                     // a draggable control for picking a value in a range
import androidx.compose.material3.SnackbarHost               // the host that displays Snackbars on screen
import androidx.compose.material3.SnackbarHostState          // the state object you call showSnackbar() on
import androidx.compose.material3.SuggestionChip             // a chip that offers a suggested value
import androidx.compose.material3.Surface                    // the most basic themed background container
import androidx.compose.material3.Switch                     // a sliding on/off toggle
import androidx.compose.material3.Text                       // draws a string using a typography style + color
import androidx.compose.material3.TextButton                 // a low-emphasis, text-only button
import androidx.compose.material3.TextField                  // a filled (underlined) text input
import androidx.compose.material3.TopAppBar                  // the bar across the top of the screen (title/actions)

// --- Compose runtime / state --------------------------------------------------
import androidx.compose.runtime.Composable                   // marks a function as one that EMITS UI
import androidx.compose.runtime.getValue                     // enables `by` delegate READS of a State<T>
import androidx.compose.runtime.mutableStateOf               // creates observable state Compose can watch
import androidx.compose.runtime.remember                     // remembers a value ACROSS recomposition
import androidx.compose.runtime.rememberCoroutineScope       // a coroutine scope tied to this composable's lifetime
import androidx.compose.runtime.setValue                     // enables `by` delegate WRITES to a MutableState<T>

// --- Compose UI / tooling -----------------------------------------------------
import androidx.compose.ui.Alignment                         // describes how to align children (e.g. CenterVertically)
import androidx.compose.ui.Modifier                          // the "how to size / decorate / position" object
import androidx.compose.ui.draw.clip                         // modifier: clip content to a shape (rounded corners…)
import androidx.compose.ui.res.painterResource               // loads a drawable resource as a Painter (for Image/Icon)
import androidx.compose.ui.text.font.FontStyle               // Normal vs Italic
import androidx.compose.ui.text.font.FontWeight              // Normal, Medium, Bold, …
import androidx.compose.ui.text.input.KeyboardType           // which keyboard to show (Text, Number, Password…)
import androidx.compose.ui.text.input.PasswordVisualTransformation // masks typed characters as dots
import androidx.compose.ui.text.style.TextAlign              // Start, Center, End, Justify
import androidx.compose.ui.text.style.TextDecoration         // Underline, LineThrough
import androidx.compose.ui.text.style.TextOverflow           // what to do when text doesn't fit (Ellipsis…)
import androidx.compose.ui.tooling.preview.Preview           // enables @Preview rendering in Android Studio
import androidx.compose.ui.unit.dp                           // density-independent pixel unit (e.g. 16.dp)

// --- Coroutines (only to show a Snackbar from the FAB tap) --------------------
import kotlinx.coroutines.launch                             // starts a coroutine on a scope (showSnackbar is suspend)

// --- App theme ----------------------------------------------------------------
import com.example.composecatalog.ui.theme.ComposeCatalogTheme // our Material 3 theme wrapper (see ui/theme/Theme.kt)

// ===========================================================================
// REUSABLE EXHIBIT FRAME (COMPOSITION: writing your OWN slot-based composable)
// ---------------------------------------------------------------------------
// Every component group below is shown inside this small wrapper so the screen
// reads like a museum of labelled exhibits. It is itself a tiny demonstration of
// the "slot" pattern: the caller passes the demo UI as a trailing `content`
// lambda, and ComponentSection draws the title + caption around it.
//
// COMPOSITION — this is the heart of how Compose UIs are built:
//   • NESTING: a Compose UI is a TREE; a container takes its children in a { }
//     lambda. The whole CatalogScreen below is one big nested tree — a Scaffold
//     wrapping a scrolling Column that holds ~13 ComponentSections, each of which
//     nests Rows, Columns, and the demo component inside it.
//   • EXTRACTING + REUSING: instead of repeating the title/caption/divider markup
//     13 times, we EXTRACTED it into one @Composable, `ComponentSection`, and CALL
//     it 13 times. Composition reuses UI by FUNCTION CALL, not inheritance.
//   • SLOTS: `ComponentSection` accepts a `content: @Composable () -> Unit`
//     parameter and renders it between the title and the divider. That is the
//     SAME mechanism the built-ins use — Card { }, Button { }, Scaffold { } all
//     take your UI as a content-lambda slot. Here you are writing one yourself.
// ===========================================================================

/**
 * ComponentSection — a titled, captioned frame around one component demo.
 *
 * @param title   the component's name (e.g. "Text", "Button").
 * @param caption a one-line plain-English description of what it is / when to use.
 * @param content the live demo UI, supplied by the caller as a trailing lambda
 *                (this is the "content slot" pattern Compose uses everywhere).
 */
@Composable
fun ComponentSection(
    title: String,
    caption: String,
    content: @Composable () -> Unit,                         // CONTENT SLOT: arbitrary UI the caller passes in
) {
    // A Column groups the heading, caption, and demo body into one vertical block.
    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 10.dp)) {
        // The component name, styled with a theme typography role (not a hardcoded size).
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,    // emphasized headline role
            color = MaterialTheme.colorScheme.primary,       // semantic accent color from the theme
        )
        // The one-line explanation, in the calmer body role and a muted color.
        Text(
            text = caption,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(bottom = 8.dp),      // small gap before the demo body
        )
        // Finally, render whatever demo UI the caller handed us.
        content()
    }
    // A thin rule visually separates one exhibit from the next.
    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
}

// ===========================================================================
// THE CATALOG SCREEN
// ---------------------------------------------------------------------------
// One vertically-scrolling screen that walks through every component group.
// It is annotated @OptIn(ExperimentalMaterial3Api::class) because TopAppBar is
// still an evolving (experimental) Material 3 API; the opt-in is Compose saying
// "yes, I understand this signature may change in a future release".
// ===========================================================================

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CatalogScreen(modifier: Modifier = Modifier) {

    // --- State owned by this screen for the interactive demos ----------------
    // Each control reads from and writes to one of these. `remember` keeps the
    // value across recompositions; we use plain remember (not rememberSaveable)
    // because this is a transient demo, not data worth surviving rotation.
    var checkboxChecked by remember { mutableStateOf(true) }     // Checkbox demo
    var switchOn by remember { mutableStateOf(true) }            // Switch demo
    var radioChoice by remember { mutableStateOf("Compose") }    // RadioButton group demo
    var sliderValue by remember { mutableStateOf(0.4f) }         // continuous Slider (0f..1f)
    var steppedValue by remember { mutableStateOf(3f) }          // stepped Slider (0f..5f)
    var rangeValue by remember { mutableStateOf(20f..80f) }      // RangeSlider (a ClosedFloatingPointRange)
    var nameText by remember { mutableStateOf("") }              // TextField demo
    var passwordText by remember { mutableStateOf("") }          // password OutlinedTextField demo
    var filterSelected by remember { mutableStateOf(false) }     // FilterChip demo
    var showDialog by remember { mutableStateOf(false) }         // AlertDialog open/closed

    // SnackbarHostState + a coroutine scope so the FAB can pop a Snackbar.
    // showSnackbar() is a `suspend` function, so it must be launched in a scope.
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    // Scaffold supplies the standard screen skeleton: a slot for the top app bar,
    // a slot for the floating action button, a snackbar host, and `innerPadding`
    // (the space taken by those bars + system insets) so content isn't covered.
    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            // TopAppBar — the title bar across the top. `title` is a content slot.
            TopAppBar(title = { Text("Compose Catalog") })
        },
        floatingActionButton = {
            // The round primary action. Tapping it launches a coroutine that asks
            // the SnackbarHostState to show a transient message at the bottom.
            FloatingActionButton(
                onClick = { scope.launch { snackbarHostState.showSnackbar("Hello from the FAB!") } }
            ) {
                Icon(imageVector = Icons.Default.Add, contentDescription = "Add")
            }
        },
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) }, // where Snackbars appear
    ) { innerPadding ->

        // The scrolling body. `verticalScroll` makes the Column scroll when its
        // content is taller than the screen; `rememberScrollState` keeps the
        // scroll position across recompositions. We apply `innerPadding` first so
        // the content starts below the app bar, then our own 16.dp frame.
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp),
        ) {

            // ===================================================================
            // 1 · TEXT — drawing strings with the type scale, color, and styling.
            // ===================================================================
            ComponentSection("Text", "Draws a string. Style it with the theme's type scale and color roles.") {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    // `style` pulls a named role from MaterialTheme.typography rather
                    // than hardcoding a size, so the whole app restyles in one place.
                    Text("headlineSmall role", style = MaterialTheme.typography.headlineSmall)
                    Text("bodyMedium role", style = MaterialTheme.typography.bodyMedium)
                    // You can also override individual properties directly on Text:
                    Text("Bold + primary color", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    Text("Italic", fontStyle = FontStyle.Italic)
                    Text("Underlined", textDecoration = TextDecoration.Underline)
                    Text("Centered in the width", textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
                    // maxLines + overflow truncates long text with an ellipsis (…).
                    Text(
                        "This sentence is intentionally far too long to fit on a single line, so it is clipped with an ellipsis.",
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
            }

            // ===================================================================
            // 2 · BUTTONS — the same tap, five levels of visual emphasis.
            // ===================================================================
            ComponentSection("Buttons", "Same action, different emphasis: filled → tonal → elevated → outlined → text.") {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    // A Row lays the high/medium emphasis buttons side by side.
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        // Button = highest emphasis (filled). onClick is REQUIRED; the
                        // label goes in the trailing content slot.
                        Button(onClick = {}) { Text("Filled") }
                        // FilledTonalButton = medium emphasis (a softer tint).
                        FilledTonalButton(onClick = {}) { Text("Tonal") }
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        // ElevatedButton = filled-ish but with a shadow.
                        ElevatedButton(onClick = {}) { Text("Elevated") }
                        // OutlinedButton = medium emphasis, just an outline.
                        OutlinedButton(onClick = {}) { Text("Outlined") }
                        // TextButton = lowest emphasis, text only (for "Cancel" etc.).
                        TextButton(onClick = {}) { Text("Text") }
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                        // A button with a leading Icon — Icon + Spacer + Text in the slot.
                        Button(onClick = {}) {
                            Icon(Icons.Default.Favorite, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text("Like")
                        }
                        // `enabled = false` greys the button out and ignores taps.
                        Button(onClick = {}, enabled = false) { Text("Disabled") }
                        // IconButton — a tappable icon (toolbar / app-bar actions).
                        IconButton(onClick = {}) { Icon(Icons.Default.Search, contentDescription = "Search") }
                    }
                }
            }

            // ===================================================================
            // 3 · FLOATING ACTION BUTTONS — the round primary-action button.
            // ===================================================================
            ComponentSection("Floating action buttons", "The round, elevated button for a screen's single most important action.") {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    // Standard FAB.
                    FloatingActionButton(onClick = {}) { Icon(Icons.Default.Add, contentDescription = "Add") }
                    // Smaller variant for denser layouts.
                    SmallFloatingActionButton(onClick = {}) { Icon(Icons.Default.Star, contentDescription = "Star") }
                    // Extended FAB carries an icon AND a label.
                    ExtendedFloatingActionButton(onClick = {}) {
                        Icon(Icons.Default.Email, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Compose")
                    }
                }
            }

            // ===================================================================
            // 4 · SELECTION CONTROLS — Checkbox, RadioButton group, Switch.
            // ===================================================================
            ComponentSection("Selection controls", "Checkbox (multi-select), RadioButton (one of a group), and Switch (on/off).") {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    // Checkbox: `checked` is the current value, `onCheckedChange` reports flips.
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(checked = checkboxChecked, onCheckedChange = { checkboxChecked = it })
                        Text(if (checkboxChecked) "Checked" else "Unchecked")
                    }
                    // RadioButton group: exactly one option may be selected at a time.
                    // We render one row per option; selecting one updates `radioChoice`.
                    listOf("Compose", "Views", "Flutter").forEach { option ->
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            RadioButton(
                                selected = (radioChoice == option),   // selected iff this row matches the choice
                                onClick = { radioChoice = option },    // pick this option
                            )
                            Text(option)
                        }
                    }
                    // Switch: the sliding on/off toggle.
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Switch(checked = switchOn, onCheckedChange = { switchOn = it })
                        Spacer(Modifier.width(8.dp))
                        Text(if (switchOn) "On" else "Off")
                    }
                }
            }

            // ===================================================================
            // 5 · SLIDERS — pick a number by dragging.
            // ===================================================================
            ComponentSection("Sliders", "Drag to choose a value: continuous, snapped to steps, or a two-thumb range.") {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    // Continuous Slider over the default 0f..1f range.
                    Text("Continuous: ${(sliderValue * 100).toInt()}%")
                    Slider(value = sliderValue, onValueChange = { sliderValue = it })
                    // Stepped Slider: valueRange + steps snaps the thumb to discrete stops.
                    // steps = 4 creates 4 stops BETWEEN the ends => 6 selectable values (0..5).
                    Text("Stepped (0–5): ${steppedValue.toInt()}")
                    Slider(
                        value = steppedValue,
                        onValueChange = { steppedValue = it },
                        valueRange = 0f..5f,
                        steps = 4,
                    )
                    // RangeSlider: TWO thumbs select a min..max sub-range.
                    Text("Range: ${rangeValue.start.toInt()}–${rangeValue.endInclusive.toInt()}")
                    RangeSlider(value = rangeValue, onValueChange = { rangeValue = it }, valueRange = 0f..100f)
                }
            }

            // ===================================================================
            // 6 · TEXT INPUT — the two text fields and their key parameters.
            // ===================================================================
            ComponentSection("Text fields", "Collect typed input. value + onValueChange make it 'hoisted' (the screen owns the text).") {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    // TextField (filled style): label floats up when focused/filled,
                    // leadingIcon adds a glyph, singleLine prevents newlines.
                    TextField(
                        value = nameText,
                        onValueChange = { nameText = it },
                        label = { Text("Name") },
                        leadingIcon = { Icon(Icons.Default.Email, contentDescription = null) },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                    )
                    // OutlinedTextField (boxed style): here as a password field —
                    // PasswordVisualTransformation masks characters as dots, and
                    // KeyboardOptions asks for the password keyboard.
                    OutlinedTextField(
                        value = passwordText,
                        onValueChange = { passwordText = it },
                        label = { Text("Password") },
                        placeholder = { Text("at least 8 characters") },
                        singleLine = true,
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
            }

            // ===================================================================
            // 7 · CONTAINERS — Surface, Card, ElevatedCard, OutlinedCard.
            // ===================================================================
            ComponentSection("Containers", "Group content on a themed background: Surface (plain), and three Card styles.") {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    // Surface is the most basic themed background. tonalElevation tints
                    // it slightly to imply elevation (used by many M3 components internally).
                    Surface(tonalElevation = 2.dp, modifier = Modifier.fillMaxWidth()) {
                        Text("Surface", modifier = Modifier.padding(12.dp))
                    }
                    // Card = rounded surface with a subtle shadow; great for list items.
                    Card(modifier = Modifier.fillMaxWidth()) {
                        Text("Card", modifier = Modifier.padding(12.dp))
                    }
                    // ElevatedCard = a stronger shadow for more separation.
                    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                        Text("ElevatedCard", modifier = Modifier.padding(12.dp))
                    }
                    // OutlinedCard = an outline instead of a shadow (flatter look).
                    OutlinedCard(modifier = Modifier.fillMaxWidth()) {
                        Text("OutlinedCard", modifier = Modifier.padding(12.dp))
                    }
                }
            }

            // ===================================================================
            // 8 · LAYOUT PRIMITIVES — Column, Row, Box, Spacer, Divider.
            // (ComposeModifiers explores arrangement/alignment/weight in depth.)
            // ===================================================================
            ComponentSection("Layout primitives", "Column stacks vertically, Row horizontally, Box overlaps; Spacer adds gaps.") {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    // Row: three colored squares placed left-to-right with even gaps.
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Box(Modifier.size(36.dp).background(MaterialTheme.colorScheme.primary))
                        Box(Modifier.size(36.dp).background(MaterialTheme.colorScheme.secondary))
                        Box(Modifier.size(36.dp).background(MaterialTheme.colorScheme.tertiary))
                    }
                    // Box: children OVERLAP on the z-axis. A label is centered on top
                    // of a filled background box via the Box's contentAlignment.
                    Box(
                        modifier = Modifier.fillMaxWidth().height(56.dp).background(MaterialTheme.colorScheme.surfaceVariant),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text("Centered inside a Box")
                    }
                    // Spacer + a divider: a Spacer is just empty space of a fixed size.
                    Spacer(Modifier.height(4.dp))
                    HorizontalDivider()
                }
            }

            // ===================================================================
            // 9 · ICON & IMAGE — vector glyph vs. a drawable picture.
            // ===================================================================
            ComponentSection("Icon & Image", "Icon draws a small, theme-tinted vector glyph; Image draws a picture as-is.") {
                Row(horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    // Icon: a vector glyph that is TINTED by `tint` (defaults to the
                    // current content color). Always provide contentDescription for a11y.
                    Icon(Icons.Default.Favorite, contentDescription = "Favorite", tint = MaterialTheme.colorScheme.error)
                    Icon(Icons.Default.Settings, contentDescription = "Settings")
                    Icon(Icons.Default.Notifications, contentDescription = "Alerts", tint = MaterialTheme.colorScheme.primary)
                    // Image: draws a Painter (here the app's launcher foreground vector)
                    // at its own colors. We clip it to a circle to show the clip modifier.
                    Image(
                        painter = painterResource(id = R.drawable.ic_launcher_foreground),
                        contentDescription = "App art",
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primaryContainer),
                    )
                }
            }

            // ===================================================================
            // 10 · PROGRESS INDICATORS — spinners and bars.
            // ===================================================================
            ComponentSection("Progress indicators", "Show ongoing work: a spinner (indeterminate) or a filled fraction (determinate).") {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        // Indeterminate circular spinner (no progress value => spins forever).
                        CircularProgressIndicator()
                        // Determinate ring: `progress` is a lambda returning 0f..1f. The lambda
                        // defers the read to DRAW time, so updating it re-draws without recomposing.
                        CircularProgressIndicator(progress = { 0.66f })
                    }
                    // Determinate horizontal bar at 40%.
                    LinearProgressIndicator(progress = { 0.4f }, modifier = Modifier.fillMaxWidth())
                    // Indeterminate bar (an animated stripe), used when % is unknown.
                    LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
                }
            }

            // ===================================================================
            // 11 · CHIPS & BADGES — compact actions/filters and tiny status bubbles.
            // ===================================================================
            ComponentSection("Chips & badges", "Chips are small, tappable pills; a Badge is a tiny count/dot pinned to a corner.") {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                        // AssistChip: a one-off action, optionally with a leading icon.
                        AssistChip(
                            onClick = {},
                            label = { Text("Assist") },
                            leadingIcon = { Icon(Icons.Default.Star, contentDescription = null, modifier = Modifier.size(18.dp)) },
                        )
                        // SuggestionChip: a suggested value the user can accept.
                        SuggestionChip(onClick = {}, label = { Text("Suggestion") })
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        // FilterChip: toggles between selected/unselected; when selected we
                        // show a leading checkmark. This is the one interactive chip here.
                        FilterChip(
                            selected = filterSelected,
                            onClick = { filterSelected = !filterSelected },
                            label = { Text("Filter") },
                            leadingIcon = if (filterSelected) {
                                { Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp)) }
                            } else null,
                        )
                        // BadgedBox: anchors a Badge (here showing "8") to the top-right
                        // corner of whatever content it wraps — classic notification bell.
                        BadgedBox(badge = { Badge { Text("8") } }) {
                            Icon(Icons.Default.Notifications, contentDescription = "Notifications")
                        }
                    }
                }
            }

            // ===================================================================
            // 12 · DIALOG — an AlertDialog opened from a button.
            // ===================================================================
            ComponentSection("Dialog", "A modal AlertDialog: it floats above the screen until confirmed or dismissed.") {
                // The button flips state to OPEN the dialog. The dialog itself is only
                // in the composition WHILE showDialog is true — a common Compose idiom.
                Button(onClick = { showDialog = true }) { Text("Show dialog") }
                if (showDialog) {
                    AlertDialog(
                        onDismissRequest = { showDialog = false },   // tap outside / back press
                        title = { Text("Delete note?") },
                        text = { Text("This cannot be undone.") },
                        confirmButton = { TextButton(onClick = { showDialog = false }) { Text("Delete") } },
                        dismissButton = { TextButton(onClick = { showDialog = false }) { Text("Cancel") } },
                    )
                }
            }

            // ===================================================================
            // 13 · HORIZONTAL LIST — LazyRow (a sideways-scrolling strip).
            // (ComposeLists covers LazyColumn / grids / keys in depth.)
            // ===================================================================
            ComponentSection("Horizontal list (LazyRow)", "Like LazyColumn but sideways: only the visible cards are composed.") {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    // `items(List)` emits one composable per element. We pass a stable
                    // `key` so Compose can track each card efficiently as the list scrolls.
                    items((1..12).toList(), key = { it }) { n ->
                        Card(modifier = Modifier.size(width = 88.dp, height = 64.dp)) {
                            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                Text("Item $n", style = MaterialTheme.typography.bodyMedium)
                            }
                        }
                    }
                }
            }

            // A final spacer so the last exhibit isn't flush against the screen edge.
            Spacer(Modifier.height(24.dp))
        }
    }
}

/**
 * MainActivity — the app's single Activity and Android's entry point.
 *
 * In onCreate it installs the Compose UI, applies the app's Material 3 theme, and
 * renders the [CatalogScreen]. There is exactly one screen and no navigation: the
 * whole point is to scroll through the component catalog.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)                   // always call through to the framework first
        enableEdgeToEdge()                                   // draw under the system bars for a modern look
        setContent {                                         // everything inside is the Compose UI tree
            ComposeCatalogTheme {                            // apply our Material 3 colors + typography
                // HW4 SOLUTIONS: show the homework tasks (T1–T3, T7–T10) instead of the
                // original catalog. The reference CatalogScreen() above is still defined and
                // @Preview-able if you want to compare. See Hw4Solutions.kt for the answers.
                Hw4CatalogSolutionsApp()
            }
        }
    }
}

// ===========================================================================
// @Preview functions — render the catalog in Android Studio's design pane.
// ---------------------------------------------------------------------------
// Because CatalogScreen owns its (transient) state with `remember`, the whole
// screen can be previewed directly — no fake data or ViewModel needed. A tall
// preview frame lets you scroll a good chunk of the catalog in the design pane.
// ===========================================================================

@Preview(name = "Catalog", showBackground = true, widthDp = 360, heightDp = 1400)
@Composable
fun CatalogScreenPreview() {
    ComposeCatalogTheme {
        CatalogScreen()
    }
}

// A second, smaller preview of just the reusable ComponentSection frame, proving
// you can preview a single building block in isolation with hand-supplied content.
@Preview(name = "ComponentSection", showBackground = true, widthDp = 360)
@Composable
fun ComponentSectionPreview() {
    ComposeCatalogTheme {
        ComponentSection(title = "Example", caption = "This is how one labelled exhibit looks.") {
            Button(onClick = {}) { Text("A button in the slot") }
        }
    }
}
