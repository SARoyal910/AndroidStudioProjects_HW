# Network Parsing

A single-screen Jetpack Compose app that fetches **real, live weather** from a public API
([Open-Meteo](https://open-meteo.com/)) and renders explicit **Loading / Success / Error**
states. It teaches the end-to-end "talk to a network, parse JSON, show it safely" flow using
**Retrofit** + **kotlinx.serialization** + a **ViewModel** exposing a `StateFlow`.

> 📖 New here? Start with the step-by-step, click-to-run guide:
> **[`using-the-weather-api.html`](./using-the-weather-api.html)** — it explains the API in
> plain English, lets you build and **fire a real request from the browser**, and shows
> exactly how the JSON becomes the screen. Then dig deeper with the two interactive
> explainers: **[`network-parsing-explorer.html`](./network-parsing-explorer.html)** (a live
> simulator, code explorer, practice + quiz) and
> **[`how-a-note-is-fetched.html`](./how-a-note-is-fetched.html)** (the request traced
> step-by-step through the code).

The API is **free, needs no API key, and no sign-up**, so the app fetches real data the
moment you run it.

## Learning goal

Learn how an Android app does **networking and JSON parsing**, and how to surface the
result as clear UI states:

- **DTO vs domain model** — keep the nested JSON wire shape (`ForecastResponseDto` /
  `CurrentDto`, `@Serializable`) separate from the flat shape the app uses (`Weather`), and
  convert in one mapper.
- **`@SerialName`** — the JSON keys are snake_case (`temperature_2m`); the Kotlin properties
  are camelCase (`temperature`). `@SerialName` bridges each one.
- **Retrofit + `suspend` + `@Query`** — describe an endpoint as an annotated interface method
  (`@GET("v1/forecast") suspend fun fetchForecast(@Query("latitude") …)`) and let Retrofit
  generate the HTTP call; it runs off the main thread and returns parsed objects.
- **The UiState pattern** — model the screen as a sealed `WeatherUiState`
  (`Loading` / `Success(weather)` / `Error(message)`) exposed via `StateFlow`, so the UI is a
  pure function of state.
- **Error handling** — a single `try/catch` in the ViewModel turns any failure (no network,
  bad JSON, timeout) into an `Error` state instead of a crash.
- **Real vs Fake switch** — a repository interface with a network-backed `Real` impl and an
  in-memory `Fake` impl, swapped by one flag so the app and tests run offline.

## Key files

- `src/main/java/com/example/networkparsing/Weather.kt` — the `City` list (with coordinates),
  the `@Serializable` DTOs (`ForecastResponseDto`, `CurrentDto`), the flat `Weather` domain
  model, the `toWeather()` mapper, and `wmoDescription()` (decodes the numeric weather code).
- `src/main/java/com/example/networkparsing/WeatherApi.kt` — the Retrofit `WeatherApi`
  interface (`@GET("v1/forecast")` + `@Query`) and `provideWeatherApi()` (baseUrl + the
  kotlinx.serialization converter).
- `src/main/java/com/example/networkparsing/WeatherRepository.kt` — the `WeatherRepository`
  interface plus `RealWeatherRepository` (network) and `FakeWeatherRepository` (offline), and
  `provideWeatherRepository(useFake = …)` — **the switch**.
- `src/main/java/com/example/networkparsing/WeatherViewModel.kt` — `WeatherUiState` sealed
  interface and the ViewModel that loads weather into a `StateFlow`.
- `src/main/java/com/example/networkparsing/MainActivity.kt` — the Compose UI: `WeatherScreen`
  (collects the StateFlow, shows the city chips) and the stateless `WeatherContent` that
  renders each state, plus `@Preview`s.
- `src/test/java/com/example/networkparsing/ExampleUnitTest.kt` — unit tests for the mapper,
  the WMO decoder, snake_case decoding, the offline fake, and the ViewModel.
- `src/main/AndroidManifest.xml` — declares the `INTERNET` permission (required for the live call).
- `using-the-weather-api.html` — the interactive, plain-English guide to the API.

## What to inspect

- **`Weather.kt`**: notice `@Serializable` on the DTOs, that the nested JSON (`current: { … }`)
  becomes a nested DTO, and that `@SerialName("temperature_2m")` bridges the snake_case key to
  `temperature`. The `toWeather()` mapper flattens the nested DTO into the UI-ready `Weather`
  and turns the numeric `weather_code` into text — the single network-shape → app-shape boundary.
- **`WeatherApi.kt`**: `@GET("v1/forecast")`, the `suspend` function, the `@Query` params
  (`latitude`/`longitude`/`current`), and how Retrofit is built with
  `Json { ignoreUnknownKeys = true }` so the many fields we don't model never break parsing.
- **`WeatherViewModel.kt`**: the private `MutableStateFlow` vs the public read-only `StateFlow`,
  and the `try/catch` in `loadWeather()` that maps failures to `Error`.
- **`MainActivity.kt`**: `collectAsStateWithLifecycle()`, the exhaustive `when` over the sealed
  `WeatherUiState`, and the city chips. The previews drive the **stateless** `WeatherContent`
  with hand-made states — never a real ViewModel.

## Run it

The app runs **live by default** (`provideWeatherRepository(useFake = false)`), so on a
device/emulator **with a network connection** you immediately see real weather — no key, no
config. Tap a city chip to load it.

To run completely **offline** (e.g. on a device with no network, or for a deterministic demo),
pass `useFake = true` to `provideWeatherRepository(...)`; the fake parses a hardcoded JSON
sample after a short delay so you still see the Loading → Success flow. The unit tests use the
fake directly, so they need no internet.

The live endpoint (open it in any browser to see the raw JSON):

```
https://api.open-meteo.com/v1/forecast?latitude=28.54&longitude=-81.38&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m
```

Build from the project root:

```bash
./gradlew assembleDebug --console=plain --stacktrace
./gradlew testDebugUnitTest
```
