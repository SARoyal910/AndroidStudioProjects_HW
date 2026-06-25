// =============================================================================
// WeatherRepository.kt  —  REPOSITORY: one source of truth, REAL vs FAKE
//
// CONCEPT THIS FILE TEACHES: the rest of the app should not care WHERE the weather
// comes from. It asks a WeatherRepository for the weather; behind that interface sits
// either a REAL implementation (hits Open-Meteo via Retrofit) or a FAKE one (returns a
// hardcoded, already-parsed sample after a tiny delay). Swapping them is a ONE-LINE
// change, which is what lets the app and its unit tests run completely OFFLINE.
//
// Because Open-Meteo is FREE and needs NO API key, the REAL repository is the default —
// the app just works live. The FAKE exists for unit tests and for demoing offline.
//
// WHAT THE STUDENT SHOULD INSPECT HERE:
//   1. The WeatherRepository interface — the single method getWeather(city): Weather.
//   2. RealWeatherRepository — calls the API with the city's coordinates, then maps DTO -> Weather.
//   3. FakeWeatherRepository — no network; parses a hardcoded JSON sample after delay().
//   4. provideWeatherRepository(useFake = …) — THE SWITCH between online and offline.
// =============================================================================

// Package declaration: ties this file to the app's namespace + directory layout.
package com.example.networkparsing

// delay(): a non-blocking pause used by the fake to imitate network latency.
import kotlinx.coroutines.delay
// Decodes a hardcoded JSON string into a ForecastResponseDto so the fake exercises real parsing.
import kotlinx.serialization.json.Json
// The decodeFromString<T>() extension used to parse the hardcoded JSON below.
import kotlinx.serialization.decodeFromString

// ===========================================================================
// REPOSITORY CONTRACT  —  what callers (the ViewModel) depend on
// ===========================================================================

/**
 * WeatherRepository — the abstraction the ViewModel talks to. It hides whether the
 * weather arrives from the network or from memory.
 */
interface WeatherRepository {
    /**
     * Return the current [Weather] for [city]. `suspend` because the real implementation
     * does network I/O; the fake also suspends (via delay) so both share one signature.
     * May THROW on failure (no network, timeout, bad JSON) — the ViewModel catches that
     * and turns it into an Error UI state.
     */
    suspend fun getWeather(city: City): Weather
}

// ===========================================================================
// REAL IMPLEMENTATION  —  network -> parse -> map
// ===========================================================================

/**
 * RealWeatherRepository — fetches the weather over HTTPS using [WeatherApi] (passing the
 * city's coordinates), then converts the network [ForecastResponseDto] into a domain
 * [Weather]. Requires the INTERNET permission and a live connection — but NO API key.
 *
 * @property api the Retrofit-backed API (defaults to a freshly built one).
 */
class RealWeatherRepository(
    private val api: WeatherApi = provideWeatherApi(),
) : WeatherRepository {

    override suspend fun getWeather(city: City): Weather {
        // 1) NETWORK + PARSE: Retrofit performs the GET (appending latitude/longitude/current
        //    as query params) and decodes the JSON object into a ForecastResponseDto. If the
        //    network is down or times out, this line throws.
        val dto: ForecastResponseDto = api.fetchForecast(
            latitude = city.latitude,
            longitude = city.longitude,
        )
        // 2) MAP: flatten the nested network DTO (plus the city we asked about) into a Weather.
        return dto.toWeather(city)             // <-- nested DTO -> flat domain, the parsing payoff
    }
}

// ===========================================================================
// FAKE IMPLEMENTATION  —  offline, deterministic, but STILL parses JSON
// ===========================================================================

// A hardcoded JSON payload shaped EXACTLY like a real Open-Meteo response (trimmed to the
// fields we model). Using real JSON (instead of building DTOs by hand) means the fake still
// demonstrates the decode-from-JSON step — it just skips the network.
private val FAKE_FORECAST_JSON = """
    {
      "latitude": 28.5,
      "longitude": -81.375,
      "timezone": "GMT",
      "current": {
        "time": "2026-06-25T12:00",
        "temperature_2m": 24.7,
        "relative_humidity_2m": 70,
        "apparent_temperature": 25.1,
        "weather_code": 3,
        "wind_speed_10m": 14.0
      }
    }
""".trimIndent()

/**
 * FakeWeatherRepository — returns the same parsed weather every time, after a short
 * [delay] to imitate a slow network so you can actually SEE the Loading spinner. Never
 * touches the network, so it works in airplane mode and in unit tests that have no
 * internet. It still echoes back the [city] you asked for, exactly like the real one.
 */
class FakeWeatherRepository : WeatherRepository {

    // Reuse the robust JSON config (ignore unknown keys) for the hardcoded payload.
    private val json = Json { ignoreUnknownKeys = true }

    override suspend fun getWeather(city: City): Weather {
        // Imitate network latency so the Loading spinner is visible for ~600ms.
        delay(600)
        // Parse the hardcoded JSON into a DTO (same path the real one uses), then map.
        val dto: ForecastResponseDto = json.decodeFromString(FAKE_FORECAST_JSON)
        return dto.toWeather(city)
    }
}

// ===========================================================================
// THE SWITCH  —  pick REAL (online) or FAKE (offline) in exactly one place
// ===========================================================================

/**
 * Factory that returns the repository the app should use.
 *
 * @param useFake when TRUE, returns the offline [FakeWeatherRepository] so the app and
 *   unit tests run with NO internet. The DEFAULT is FALSE — because Open-Meteo is free
 *   and keyless, the app fetches REAL, live weather out of the box. Flip this to true to
 *   force the offline fake (e.g. to demo the app with no network).
 *
 *   ┌──────────────────────────────────────────────────────────────────────────┐
 *   │  No API key, no sign-up: the REAL repository is the default. Set           │
 *   │  useFake = true to run fully offline against the hardcoded sample.         │
 *   └──────────────────────────────────────────────────────────────────────────┘
 */
fun provideWeatherRepository(useFake: Boolean = false): WeatherRepository =
    if (useFake) FakeWeatherRepository()       // offline: works with no internet
    else RealWeatherRepository()               // live (default): requires INTERNET, no key
