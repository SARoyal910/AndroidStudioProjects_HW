// =============================================================================
// ExampleUnitTest.kt  —  local JVM unit tests for the parsing + offline data layer
//
// These run on the development machine (no device, no network). They verify the pure,
// testable pieces of the concept:
//   1. ForecastResponseDto.toWeather() flattens the nested DTO into the domain shape.
//   2. wmoDescription() decodes Open-Meteo's numeric weather_code into text.
//   3. The offline FakeWeatherRepository parses its hardcoded JSON into a real Weather.
//   4. The ViewModel turns success into Success and failures into Error (never crashes).
// runTest { } (from kotlinx-coroutines-test) lets us call the suspend getWeather().
// =============================================================================

package com.example.networkparsing

import org.junit.Test                                       // marks a method as a test case
import org.junit.Assert.*                                   // assertEquals / assertTrue / ...
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest                      // runs suspend code in a test
import kotlinx.coroutines.test.setMain
import kotlinx.serialization.SerializationException
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json

/**
 * Local unit test suite for the NetworkParsing (weather) data layer.
 */
@OptIn(ExperimentalCoroutinesApi::class)
class ExampleUnitTest {

    private val json = Json { ignoreUnknownKeys = true }
    private val orlando = City("Orlando", "US", 28.5384, -81.3789)

    /** Sanity check kept from the template — confirms the test toolchain compiles/runs. */
    @Test
    fun addition_isCorrect() {
        assertEquals(4, 2 + 2)
    }

    /** The mapper flattens the nested DTO and rounds the Doubles into the domain Weather. */
    @Test
    fun forecastDto_toWeather_flattensAndRounds() {
        val dto = ForecastResponseDto(
            current = CurrentDto(
                time = "2026-06-25T12:00",
                temperature = 30.4,
                feelsLike = 33.6,
                humidity = 62,
                weatherCode = 2,
                windSpeed = 11.7,
            )
        )

        val weather = dto.toWeather(orlando)

        assertEquals("Orlando", weather.city)          // city/country come from the City we asked about
        assertEquals("US", weather.country)
        assertEquals(30, weather.temperatureC)         // 30.4 -> 30
        assertEquals(34, weather.feelsLikeC)           // 33.6 -> 34
        assertEquals("partly cloudy", weather.description) // weather_code 2 decoded
        assertEquals(62, weather.humidityPercent)
        assertEquals(12, weather.windKmh)              // 11.7 -> 12
        assertEquals(2, weather.weatherCode)
    }

    /** wmoDescription maps the documented WMO codes to text (and is total via the else branch). */
    @Test
    fun wmoDescription_decodesKnownCodes() {
        assertEquals("clear sky", wmoDescription(0))
        assertEquals("overcast", wmoDescription(3))
        assertEquals("rain", wmoDescription(63))
        assertEquals("thunderstorm", wmoDescription(95))
        assertTrue(wmoDescription(12345).startsWith("unknown")) // unmapped -> safe fallback
    }

    /** The @Serializable DTO decodes a real Open-Meteo response shape, including @SerialName keys. */
    @Test
    fun currentDto_decodesSnakeCaseKeys() {
        val dto = json.decodeFromString<ForecastResponseDto>(
            """
            {
              "latitude": 28.5,
              "current": {
                "time": "2026-06-25T12:00",
                "temperature_2m": 24.7,
                "apparent_temperature": 25.1,
                "relative_humidity_2m": 70,
                "weather_code": 3,
                "wind_speed_10m": 14.0
              }
            }
            """.trimIndent()
        )

        assertEquals(24.7, dto.current.temperature, 0.001) // temperature_2m -> temperature
        assertEquals(70, dto.current.humidity)             // relative_humidity_2m -> humidity
        assertEquals(3, dto.current.weatherCode)           // weather_code -> weatherCode
    }

    /** The offline fake parses its hardcoded JSON and echoes back the requested city. */
    @Test
    fun fakeRepository_returnsParsedWeather() = runTest {
        val repo = FakeWeatherRepository()
        val weather = repo.getWeather(orlando)
        assertEquals("Orlando", weather.city)
        assertTrue("a real temperature should be parsed", weather.temperatureC != 0 || weather.humidityPercent > 0)
    }

    /** The switch returns the offline fake or the live real implementation as asked. */
    @Test
    fun provideRepository_switch() {
        assertTrue(provideWeatherRepository(useFake = true) is FakeWeatherRepository)
        assertTrue(provideWeatherRepository(useFake = false) is RealWeatherRepository)
    }

    /** Extra server fields are ignored because the Json parser uses ignoreUnknownKeys. */
    @Test
    fun json_withExtraUnknownField_stillDecodes() {
        val dto = json.decodeFromString<ForecastResponseDto>(
            """
            {
              "current": {
                "time": "2026-06-25T12:00",
                "temperature_2m": 20.0,
                "apparent_temperature": 19.0,
                "relative_humidity_2m": 50,
                "weather_code": 0,
                "wind_speed_10m": 5.0,
                "surface_pressure": 1012.3
              }
            }
            """.trimIndent()
        )
        assertEquals(0, dto.current.weatherCode)           // unmodeled "surface_pressure" is ignored
    }

    /** Missing required fields are real parse failures (not silently defaulted). */
    @Test
    fun json_missingRequiredField_throwsSerializationException() {
        try {
            json.decodeFromString<ForecastResponseDto>(
                """
                {
                  "current": {
                    "time": "2026-06-25T12:00",
                    "apparent_temperature": 19.0,
                    "relative_humidity_2m": 50,
                    "weather_code": 0,
                    "wind_speed_10m": 5.0
                  }
                }
                """.trimIndent()
            )
            fail("Expected the missing temperature_2m to throw")
        } catch (expected: SerializationException) {
            assertTrue(expected.message.orEmpty().isNotBlank())
        }
    }

    /** The ViewModel starts at Loading and then publishes Success when the repo returns weather. */
    @Test
    fun viewModel_loadWeather_successPublishesSuccessState() = runTest {
        val dispatcher = StandardTestDispatcher(testScheduler)
        Dispatchers.setMain(dispatcher)
        try {
            val repo = object : WeatherRepository {
                override suspend fun getWeather(city: City): Weather =
                    Weather(city.name, city.country, 25, 26, "clear sky", 40, 8, 0)
            }
            val viewModel = WeatherViewModel(repository = repo)

            assertTrue(viewModel.uiState.value is WeatherUiState.Loading)
            advanceUntilIdle()

            val state = viewModel.uiState.value
            assertTrue(state is WeatherUiState.Success)
            assertEquals("Orlando", (state as WeatherUiState.Success).weather.city)
        } finally {
            Dispatchers.resetMain()
        }
    }

    /** The ViewModel converts repository exceptions into Error state instead of throwing. */
    @Test
    fun viewModel_loadWeather_failurePublishesErrorState() = runTest {
        val dispatcher = StandardTestDispatcher(testScheduler)
        Dispatchers.setMain(dispatcher)
        try {
            val repo = object : WeatherRepository {
                override suspend fun getWeather(city: City): Weather {
                    error("network unavailable")
                }
            }
            val viewModel = WeatherViewModel(repository = repo)

            assertTrue(viewModel.uiState.value is WeatherUiState.Loading)
            advanceUntilIdle()

            val state = viewModel.uiState.value
            assertTrue(state is WeatherUiState.Error)
            assertTrue((state as WeatherUiState.Error).message.contains("network unavailable"))
        } finally {
            Dispatchers.resetMain()
        }
    }
}
