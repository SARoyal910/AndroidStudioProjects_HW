// =============================================================================
// MainActivity.kt  —  rendering LOADING / SUCCESS / ERROR from a StateFlow
//
// CONCEPT THIS PROJECT TEACHES: NETWORKING + JSON PARSING with Retrofit +
// kotlinx.serialization, against a REAL, FREE API (Open-Meteo — no key, no sign-up),
// surfaced as explicit LOADING / SUCCESS / ERROR UI states. This file is the UI layer;
// the data layer is split across these companions:
//   • Weather.kt           — the City list, the nested ForecastResponseDto/CurrentDto,
//                            the flat Weather domain model, and the toWeather() mapper.
//   • WeatherApi.kt        — the Retrofit interface (@GET + @Query) and Retrofit setup.
//   • WeatherRepository.kt — REAL (network) vs FAKE (offline) + the switch.
//   • WeatherViewModel.kt  — WeatherUiState sealed interface + StateFlow + load logic.
//
// WHAT THE STUDENT SHOULD INSPECT IN THIS FILE:
//   1. WeatherScreen() — obtains the ViewModel and collects its StateFlow with
//      collectAsStateWithLifecycle() (lifecycle-aware observation), and shows a row of
//      city chips that each trigger a fresh load.
//   2. WeatherContent() — a STATELESS overload that just renders a given WeatherUiState.
//      A `when` over the sealed state draws the spinner / card / error+Retry.
//   3. The @Preview functions preview WeatherContent with HAND-MADE states (never a
//      real ViewModel) — see the comment on why.
// =============================================================================

// Package declaration: ties this file to the app's namespace + directory layout.
package com.example.networkparsing

// --- Android framework imports ------------------------------------------------
import android.os.Bundle                                    // savedInstanceState type passed to onCreate
import androidx.activity.ComponentActivity                  // base Activity class with Compose support
import androidx.activity.compose.setContent                 // bridges an Activity to a Compose UI tree
import androidx.activity.enableEdgeToEdge                    // lets the app draw behind the system bars

// --- Compose layout / foundation imports -------------------------------------
import androidx.compose.foundation.horizontalScroll         // lets the city-chip Row scroll sideways
import androidx.compose.foundation.layout.Arrangement       // controls spacing between children in a row/column
import androidx.compose.foundation.layout.Column            // stacks children vertically
import androidx.compose.foundation.layout.Row               // lays children out horizontally
import androidx.compose.foundation.layout.Spacer            // empty box used to add fixed gaps
import androidx.compose.foundation.layout.fillMaxSize       // modifier: take all available width AND height
import androidx.compose.foundation.layout.fillMaxWidth      // modifier: take all available width
import androidx.compose.foundation.layout.height            // modifier: force a specific height
import androidx.compose.foundation.layout.padding           // modifier: add space around content
import androidx.compose.foundation.rememberScrollState      // remembers how far the chip Row is scrolled

// --- Material 3 component imports ---------------------------------------------
import androidx.compose.material3.Button                    // filled, tappable button (Retry)
import androidx.compose.material3.Card                      // surface with elevation for the weather panel
import androidx.compose.material3.CircularProgressIndicator // the spinner shown during Loading
import androidx.compose.material3.FilterChip                // a selectable chip — one per city
import androidx.compose.material3.MaterialTheme             // access to the current theme's colors/typography
import androidx.compose.material3.Scaffold                  // standard screen frame (handles insets, bars, etc.)
import androidx.compose.material3.Text                      // draws text

// --- Compose runtime / layout imports ----------------------------------------
import androidx.compose.runtime.Composable                  // marks a function as emitting UI
import androidx.compose.runtime.getValue                    // enables `val x by …` delegation for State
import androidx.compose.ui.Alignment                        // align children (e.g. center the spinner)
import androidx.compose.ui.Modifier                         // the "how to lay out / decorate" object
import androidx.compose.ui.text.font.FontWeight             // bold weights for the temperature
import androidx.compose.ui.tooling.preview.Preview          // enables @Preview rendering in Android Studio
import androidx.compose.ui.unit.dp                          // density-independent pixel unit (e.g. 16.dp)

// --- ViewModel + lifecycle-aware state collection ----------------------------
import androidx.lifecycle.compose.collectAsStateWithLifecycle // observe a StateFlow safely w.r.t. lifecycle
import androidx.lifecycle.viewmodel.compose.viewModel          // obtain a ViewModel from inside a @Composable

// --- App theme ---------------------------------------------------------------
import com.example.networkparsing.ui.theme.NetworkParsingTheme // our app's Material theme wrapper (see Theme.kt)

/**
 * MainActivity — the app's single Activity and the entry point Android launches.
 * It installs the Compose UI and shows the weather screen inside the app theme.
 */
class MainActivity : ComponentActivity() {
    // onCreate runs once when the Activity is first created; we install Compose here.
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)                 // always call through to the framework first
        enableEdgeToEdge()                                 // draw under the status/navigation bars
        setContent {                                       // everything inside is the Compose UI
            NetworkParsingTheme {                          // apply colors/typography/dark-light
                // Scaffold gives us innerPadding (the space the system bars occupy) so
                // content is not drawn underneath the bars.
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    WeatherScreen(modifier = Modifier.padding(innerPadding))
                }
            }
        }
    }
}

// ===========================================================================
// UI  —  STATEFUL screen: gets the ViewModel, observes its StateFlow
// ===========================================================================

/**
 * WeatherScreen — the STATEFUL entry composable. It:
 *   1. obtains a [WeatherViewModel] (which starts loading in its init block),
 *   2. observes the ViewModel's StateFlow lifecycle-awarely,
 *   3. shows a row of city chips that each trigger a fresh load, and
 *   4. delegates ALL drawing to the stateless [WeatherContent].
 *
 * @param modifier layout modifier supplied by the caller (e.g. Scaffold insets).
 * @param viewModel the screen's ViewModel; defaulted so callers rarely pass it.
 */
@Composable
fun WeatherScreen(
    modifier: Modifier = Modifier,
    viewModel: WeatherViewModel = viewModel(),             // ViewModel survives recomposition/rotation
) {
    // collectAsStateWithLifecycle() observes the StateFlow but PAUSES collection when
    // the screen is not visible (STOPPED), unlike a plain collectAsState(). This is the
    // lifecycle-safe way to read a StateFlow in Compose: it SUBSCRIBES, wraps the latest
    // value in Compose State (so this composable RECOMPOSES on each emit), and `by`
    // unwraps .value so `uiState` reads as the plain value.
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    Column(modifier = modifier.fillMaxSize()) {
        // A scrollable row of city chips; tapping one loads that city's weather.
        CityChips(
            selected = viewModel.city,
            onSelect = { city -> viewModel.loadWeather(city) },
        )
        // Hand the current state + the retry callback to the stateless renderer.
        WeatherContent(
            uiState = uiState,
            onRetry = { viewModel.loadWeather() },         // Retry simply re-runs the load
        )
    }
}

/**
 * CityChips — a horizontally scrolling Row of [FilterChip]s, one per [PRESET_CITIES]
 * entry. Stateless: it reports the tapped city upward via [onSelect] and highlights
 * whichever one matches [selected].
 */
@Composable
private fun CityChips(selected: City, onSelect: (City) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())       // scroll sideways if the chips overflow
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        PRESET_CITIES.forEach { city ->
            FilterChip(
                selected = city == selected,               // highlight the active city
                onClick = { onSelect(city) },              // report the tap upward
                label = { Text(city.name) },
            )
        }
    }
}

/**
 * WeatherContent — the STATELESS renderer. Given a [WeatherUiState] it draws the matching
 * UI; given [onRetry] it knows what the error screen's button should do. It holds NO
 * state and creates NO ViewModel, which is exactly why @Previews can drive it directly.
 *
 * @param uiState which of Loading/Success/Error to render.
 * @param onRetry invoked when the user taps Retry on the error state.
 */
@Composable
fun WeatherContent(
    uiState: WeatherUiState,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // THE concept made visible: one exhaustive `when` over the sealed state. Because
    // WeatherUiState is sealed, the compiler guarantees every case is handled — you
    // physically cannot forget Loading, Success, or Error.
    when (uiState) {
        // LOADING — center a spinner in the available space.
        is WeatherUiState.Loading -> LoadingState(modifier)

        // SUCCESS — render the parsed weather in a card.
        is WeatherUiState.Success -> WeatherCard(weather = uiState.weather, modifier = modifier)

        // ERROR — show the message plus a Retry button wired to onRetry.
        is WeatherUiState.Error -> ErrorState(
            message = uiState.message,
            onRetry = onRetry,
            modifier = modifier,
        )
    }
}

/**
 * LoadingState — a centered [CircularProgressIndicator] shown while the request runs.
 */
@Composable
private fun LoadingState(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,          // vertically center the spinner
    ) {
        CircularProgressIndicator()                        // <-- the Loading UI
        Spacer(modifier = Modifier.height(16.dp))
        Text(text = "Loading weather…", style = MaterialTheme.typography.bodyMedium)
    }
}

/**
 * WeatherCard — renders the SUCCESS state: the city, a big temperature, the condition,
 * and a few detail cells. Every value here is already flattened/rounded by the mapper.
 *
 * @param weather the parsed, UI-ready weather to display.
 */
@Composable
private fun WeatherCard(weather: Weather, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Card(modifier = Modifier.fillMaxWidth()) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                // City + country, e.g. "Orlando, US"
                Text(
                    text = if (weather.country.isBlank()) weather.city else "${weather.city}, ${weather.country}",
                    style = MaterialTheme.typography.headlineSmall,
                )
                // A big weather emoji chosen from the WMO code.
                Text(text = weatherEmoji(weather.weatherCode), style = MaterialTheme.typography.displayMedium)
                // The big temperature number.
                Text(
                    text = "${weather.temperatureC}°C",
                    style = MaterialTheme.typography.displaySmall,
                    fontWeight = FontWeight.Bold,
                )
                // The human-readable condition, e.g. "partly cloudy".
                Text(text = weather.description, style = MaterialTheme.typography.bodyLarge)
                Spacer(modifier = Modifier.height(8.dp))
                // A small details row: feels-like, humidity, wind.
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                ) {
                    DetailCell(label = "Feels like", value = "${weather.feelsLikeC}°")
                    DetailCell(label = "Humidity", value = "${weather.humidityPercent}%")
                    DetailCell(label = "Wind", value = "${weather.windKmh} km/h")
                }
            }
        }
    }
}

/** One label/value pair in the details row of the weather card. */
@Composable
private fun DetailCell(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = value, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Text(text = label, style = MaterialTheme.typography.labelMedium)
    }
}

/** Map a WMO weather code to an emoji (purely cosmetic; see wmoDescription for the text). */
private fun weatherEmoji(code: Int): String = when (code) {
    0, 1 -> "☀️"                       // clear / mainly clear
    2 -> "⛅"                          // partly cloudy
    3 -> "☁️"                          // overcast
    45, 48 -> "🌫️"                     // fog
    in 51..67 -> "🌧️"                  // drizzle / rain / freezing rain
    in 71..77 -> "❄️"                  // snow
    in 80..82 -> "🌦️"                  // rain showers
    85, 86 -> "🌨️"                     // snow showers
    in 95..99 -> "⛈️"                  // thunderstorm
    else -> "🌡️"
}

/**
 * ErrorState — renders the ERROR state: the failure [message] and a Retry button.
 *
 * @param message the human-readable error from [WeatherUiState.Error].
 * @param onRetry invoked when Retry is tapped (re-runs the load).
 */
@Composable
private fun ErrorState(
    message: String,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            text = "Couldn't load the weather",
            style = MaterialTheme.typography.titleMedium,
        )
        Spacer(modifier = Modifier.height(8.dp))
        // The actual reason, surfaced from the caught exception's message.
        Text(text = message, style = MaterialTheme.typography.bodyMedium)
        Spacer(modifier = Modifier.height(24.dp))
        // Retry: re-triggers loadWeather() in the ViewModel.
        Button(onClick = onRetry) {                        // <-- the Retry affordance
            Text("Retry")
        }
    }
}

// ===========================================================================
// PREVIEWS  —  render EACH state without a network or a real ViewModel
//
// IMPORTANT: previews drive the STATELESS WeatherContent with HAND-SUPPLIED state. We
// never construct a WeatherViewModel in a @Preview because a ViewModel would try to run
// a coroutine / hit the repository, which the design pane cannot do. Passing a literal
// WeatherUiState renders each state instantly and deterministically.
// ===========================================================================

// A sample weather used by the Success preview.
private val previewWeather = Weather(
    city = "Orlando", country = "US", temperatureC = 31, feelsLikeC = 34,
    description = "partly cloudy", humidityPercent = 58, windKmh = 12, weatherCode = 2,
)

// SUCCESS state preview — the weather card.
@Preview(name = "Success", showBackground = true, widthDp = 360, heightDp = 600)
@Composable
fun WeatherContentSuccessPreview() {
    NetworkParsingTheme {
        WeatherContent(
            uiState = WeatherUiState.Success(previewWeather), // hand-made Success state
            onRetry = {},                                     // no-op: previews don't navigate
        )
    }
}

// LOADING state preview — the centered spinner.
@Preview(name = "Loading", showBackground = true, widthDp = 360, heightDp = 600)
@Composable
fun WeatherContentLoadingPreview() {
    NetworkParsingTheme {
        WeatherContent(
            uiState = WeatherUiState.Loading,                 // hand-made Loading state
            onRetry = {},
        )
    }
}

// ERROR state preview — message + Retry button.
@Preview(name = "Error", showBackground = true, widthDp = 360, heightDp = 600)
@Composable
fun WeatherContentErrorPreview() {
    NetworkParsingTheme {
        WeatherContent(
            uiState = WeatherUiState.Error("Unable to resolve host \"api.open-meteo.com\""), // hand-made Error
            onRetry = {},
        )
    }
}
