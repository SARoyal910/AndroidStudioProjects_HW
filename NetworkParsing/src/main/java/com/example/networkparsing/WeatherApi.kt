// =============================================================================
// WeatherApi.kt  —  RETROFIT: turning a Kotlin interface into a real HTTP call
//
// CONCEPT THIS FILE TEACHES: with Retrofit you DESCRIBE the network endpoint as an
// annotated interface method; Retrofit generates the actual HTTP code at runtime.
// You never write sockets or build URLs by hand — you declare "GET v1/forecast with
// these query parameters returns a ForecastResponseDto" and call a suspend fun.
//
// THE ENDPOINT (Open-Meteo "Forecast" — FREE, no API key, no sign-up):
//   GET https://api.open-meteo.com/v1/forecast
//        ?latitude=28.54&longitude=-81.38
//        &current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m
//
// WHAT THE STUDENT SHOULD INSPECT HERE:
//   1. @GET("v1/forecast") — the relative path appended to the Retrofit baseUrl.
//   2. @Query(...) — each annotated parameter becomes one ?key=value in the URL.
//   3. `suspend fun` — the call is a coroutine; it suspends instead of blocking a thread.
//   4. provideWeatherApi() — how Retrofit is assembled: baseUrl + the JSON converter.
//   5. There is NO API key parameter — Open-Meteo is open and free for this use.
// =============================================================================

// Package declaration: ties this file to the app's namespace + directory layout.
package com.example.networkparsing

// Tells Retrofit/OkHttp which media type the response body is, when wiring the converter.
import okhttp3.MediaType.Companion.toMediaType
// The configurable JSON engine from kotlinx.serialization (we set ignoreUnknownKeys).
import kotlinx.serialization.json.Json
// Retrofit's builder — assembles a working client from baseUrl + converter.
import retrofit2.Retrofit
// The bridge that lets Retrofit decode bodies using kotlinx.serialization instead of Gson/Moshi.
import retrofit2.converter.kotlinx.serialization.asConverterFactory
// The HTTP-GET annotation: marks fetchForecast() as an HTTP GET request.
import retrofit2.http.GET
// The query-parameter annotation: each @Query becomes one ?name=value in the URL.
import retrofit2.http.Query

// ===========================================================================
// API SURFACE  —  the endpoint(s) this app talks to, described as an interface
// ===========================================================================

/**
 * WeatherApi — the Retrofit description of the remote endpoint. Retrofit creates a
 * concrete implementation of this interface at runtime (see [provideWeatherApi]).
 *
 * There is exactly one call here: fetch the current weather for a latitude/longitude.
 */
interface WeatherApi {

    /**
     * GET {baseUrl}v1/forecast?latitude=…&longitude=…&current=… → one forecast JSON
     * object, decoded into a [ForecastResponseDto].
     *
     * Each `@Query` parameter is appended to the URL as `?name=value`:
     *   • latitude / longitude — WHERE to get the weather (Open-Meteo is coordinate-based).
     *   • current — a comma-separated list of the live readings we want. Defaulted so
     *     callers rarely pass it; it asks for temperature, humidity, "feels like", the
     *     WMO weather code, and wind speed.
     *
     * `suspend` means callers await it from a coroutine; Retrofit runs the network I/O
     * off the main thread and resumes you with the parsed object. No callbacks, no threads.
     */
    @GET("v1/forecast")                        // <-- THE concept: relative path -> HTTP GET
    suspend fun fetchForecast(
        @Query("latitude") latitude: Double,   // becomes ?latitude=28.5384
        @Query("longitude") longitude: Double, // becomes &longitude=-81.3789
        @Query("current") current: String =    // becomes &current=temperature_2m,relative_humidity_2m,…
            "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    ): ForecastResponseDto                       // the JSON object -> ForecastResponseDto, parsed for you
}

// ===========================================================================
// RETROFIT ASSEMBLY  —  baseUrl + the kotlinx.serialization JSON converter
// ===========================================================================

// The configured JSON parser shared by the converter.
//   ignoreUnknownKeys = true  -> the real API returns MANY fields we don't model
//   (latitude, longitude, timezone, current_units, elevation, …). Ignoring them means
//   decoding keeps working instead of throwing. The #1 real-world robustness setting.
private val json = Json { ignoreUnknownKeys = true }

/**
 * Build a ready-to-use [WeatherApi] backed by Retrofit.
 *
 * Wiring, step by step:
 *   • baseUrl — the root every @GET path is appended to. MUST end in "/".
 *   • addConverterFactory — installs the kotlinx.serialization converter so response
 *     bodies are decoded by [json] into our @Serializable DTOs.
 *   • create(WeatherApi::class.java) — Retrofit generates the implementation of WeatherApi.
 */
fun provideWeatherApi(): WeatherApi =
    Retrofit.Builder()
        // The Open-Meteo API host. Trailing "/" is required by Retrofit.
        .baseUrl("https://api.open-meteo.com/")
        // Plug kotlinx.serialization into Retrofit as the JSON (de)serializer.
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()                               // finalize the Retrofit instance
        .create(WeatherApi::class.java)        // generate the WeatherApi implementation
