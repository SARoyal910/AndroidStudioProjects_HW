// =============================================================================
// Weather.kt  —  DTO  vs  DOMAIN MODEL  (the parsing boundary)
//
// CONCEPT THIS FILE TEACHES: real APIs return NESTED JSON, and the wire keys rarely
// match what your UI wants. Keep the shape the *network* speaks (the DTOs — one class
// per nested object) SEPARATE from the FLAT shape your *app* speaks (the domain model),
// and convert between them in ONE place (a mapper). This is the heart of "JSON parsing":
// Open-Meteo sends a nested JSON object, kotlinx.serialization turns it into a
// ForecastResponseDto, and the mapper flattens that into a clean Weather the app uses.
//
// THE API (Open-Meteo — FREE, no API key, no sign-up):
//   GET https://api.open-meteo.com/v1/forecast
//        ?latitude=28.54&longitude=-81.38
//        &current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m
//   Open-Meteo is LATITUDE/LONGITUDE based, so each city we offer carries its own
//   coordinates (see the City list below) — no key, no geocoding step needed.
//
// WHAT THE STUDENT SHOULD INSPECT HERE:
//   1. @Serializable on the DTOs — this is what makes JSON decoding possible.
//   2. @SerialName — the JSON keys are snake_case ("temperature_2m"); the Kotlin
//      properties are camelCase. @SerialName bridges each one.
//   3. Nested JSON → nested DTOs: ForecastResponseDto holds a CurrentDto.
//   4. Weather (the domain model) is a PLAIN, FLAT data class; toWeather() flattens
//      the DTO and turns the numeric weather_code into a human description.
// =============================================================================

// Package declaration: ties this file to the app's namespace + directory layout.
package com.example.networkparsing

// kotlinx.serialization markers: @Serializable triggers the compiler plugin to
// GENERATE a (de)serializer; @SerialName renames a property to match a JSON key.
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
// roundToInt(): turns the API's Double temps/speeds into clean whole numbers.
import kotlin.math.roundToInt

// ===========================================================================
// CITY  —  a place the user can pick (Open-Meteo needs coordinates, not a name)
//
// Open-Meteo's forecast endpoint takes a latitude + longitude, not a city name, so we
// pair each offered city with its coordinates here. (Open-Meteo also has a free
// geocoding API to turn a typed name into coordinates — see the "try this" in the
// setup guide — but a fixed list keeps this first lesson simple.)
// ===========================================================================

/** One selectable place: a display name, a country code, and its coordinates. */
data class City(
    val name: String,
    val country: String,
    val latitude: Double,
    val longitude: Double,
)

/** The cities the app offers as chips. Each carries the coordinates Open-Meteo needs. */
val PRESET_CITIES: List<City> = listOf(
    City("Orlando", "US", 28.5384, -81.3789),
    City("New York", "US", 40.7128, -74.0060),
    City("London", "UK", 51.5072, -0.1276),
    City("Tokyo", "JP", 35.6762, 139.6503),
    City("Sydney", "AU", -33.8688, 151.2093),
    City("Cairo", "EG", 30.0444, 31.2357),
)

// ===========================================================================
// DATA TRANSFER OBJECTS (DTOs)  —  the exact NESTED shape of the JSON the API returns
//
// Sample JSON from the forecast URL above:
//   {
//     "latitude": 28.5, "longitude": -81.375, "timezone": "GMT",
//     "current": {
//       "time": "2026-06-25T12:00",
//       "temperature_2m": 30.4,
//       "relative_humidity_2m": 62,
//       "apparent_temperature": 33.1,
//       "weather_code": 2,
//       "wind_speed_10m": 12.4
//     }
//   }
//
// We only model the "current" block. ignoreUnknownKeys (set in WeatherApi.kt) drops
// the many fields we don't need (latitude, timezone, current_units, …).
// ===========================================================================

/**
 * ForecastResponseDto — the WHOLE JSON object the `/v1/forecast` endpoint returns (only
 * the part we use). It exists ONLY to be decoded; it is the "network shape".
 *
 * @property current the nested "current" object holding the live readings.
 */
@Serializable                                  // <-- THE concept: makes this class JSON-decodable
data class ForecastResponseDto(
    val current: CurrentDto,                   // matches JSON "current": { … } (a nested object)
)

/**
 * CurrentDto — the JSON "current" object. Every key is snake_case on the wire, so each
 * property uses @SerialName to bridge to a camelCase Kotlin name.
 */
@Serializable
data class CurrentDto(
    val time: String,                                              // "2026-06-25T12:00"
    @SerialName("temperature_2m") val temperature: Double,         // air temp at 2m, °C
    @SerialName("apparent_temperature") val feelsLike: Double,     // "feels like", °C
    @SerialName("relative_humidity_2m") val humidity: Int,         // %
    @SerialName("weather_code") val weatherCode: Int,              // WMO code (0=clear, 3=overcast, …)
    @SerialName("wind_speed_10m") val windSpeed: Double,           // wind at 10m, km/h (Open-Meteo default)
)

// ===========================================================================
// DOMAIN MODEL  —  the clean, FLAT shape the rest of the app actually uses
//
// A PLAIN data class: no @Serializable, no nesting, no cryptic weather_code — just
// UI-ready values. Decoupling it from the DTOs means the UI/ViewModel never depend on
// Open-Meteo's exact wire format; only the DTOs + the mapper below would change.
// ===========================================================================

/**
 * Weather — the app's own, FLAT representation of "the weather right now". Built FROM a
 * [ForecastResponseDto] (plus the [City] we asked about) by [toWeather].
 */
data class Weather(
    val city: String,                          // from the City we requested
    val country: String,                       // from the City we requested
    val temperatureC: Int,                     // current.temperature, rounded
    val feelsLikeC: Int,                       // current.feelsLike, rounded
    val description: String,                   // current.weatherCode turned into text
    val humidityPercent: Int,                  // current.humidity
    val windKmh: Int,                          // current.windSpeed, rounded
    val weatherCode: Int,                      // the raw WMO code (drives the emoji)
)

// ===========================================================================
// MAPPER  —  the SINGLE place the NESTED network-shape becomes the FLAT app-shape
// ===========================================================================

/**
 * Convert one [ForecastResponseDto] (plus the [city] we requested it for) into a clean,
 * flat domain [Weather]. This is the only function that "knows" how the shapes line up:
 * it reaches into the nested `current` object, rounds the Doubles, and turns the numeric
 * WMO weather_code into a human-readable description via [wmoDescription].
 */
fun ForecastResponseDto.toWeather(city: City): Weather =
    Weather(
        city = city.name,                              // we already know the place we asked about
        country = city.country,
        temperatureC = current.temperature.roundToInt(),   // 30.4 -> 30
        feelsLikeC = current.feelsLike.roundToInt(),       // reach into "current", round
        description = wmoDescription(current.weatherCode),  // 2 -> "partly cloudy"
        humidityPercent = current.humidity,               // straight through
        windKmh = current.windSpeed.roundToInt(),          // already km/h, just round
        weatherCode = current.weatherCode,                // kept so the UI can pick an emoji
    )

/**
 * wmoDescription — map a WMO weather interpretation code (what Open-Meteo returns in
 * `weather_code`) to a short human-readable phrase. This is the kind of "decode the
 * server's enum" logic that belongs in the mapping layer, not the UI.
 */
fun wmoDescription(code: Int): String = when (code) {
    0 -> "clear sky"
    1 -> "mainly clear"
    2 -> "partly cloudy"
    3 -> "overcast"
    45, 48 -> "fog"
    51, 53, 55 -> "drizzle"
    56, 57 -> "freezing drizzle"
    61, 63, 65 -> "rain"
    66, 67 -> "freezing rain"
    71, 73, 75 -> "snow"
    77 -> "snow grains"
    80, 81, 82 -> "rain showers"
    85, 86 -> "snow showers"
    95 -> "thunderstorm"
    96, 99 -> "thunderstorm with hail"
    else -> "unknown ($code)"
}
