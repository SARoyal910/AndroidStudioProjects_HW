// =============================================================================
// ExampleUnitTest.kt  —  local JVM unit tests for the parsing + offline data layer
//
// These run on the development machine (no device, no network). They verify the two
// pure, testable pieces of the concept:
//   1. NoteDto.toNote() correctly maps the network shape to the domain shape.
//   2. The offline FakeNoteRepository parses its hardcoded JSON into real Notes.
// runTest { } (from kotlinx-coroutines-test) lets us call the suspend getNotes().
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
 * Local unit test suite for the NetworkParsing data layer.
 */
@OptIn(ExperimentalCoroutinesApi::class)
class ExampleUnitTest {

    /** Sanity check kept from the template — confirms the test toolchain compiles/runs. */
    @Test
    fun addition_isCorrect() {
        assertEquals(4, 2 + 2)
    }

    /** The DTO -> domain mapper copies the kept fields and drops userId. */
    @Test
    fun noteDto_toNote_mapsFields() {
        val dto = NoteDto(userId = 7, id = 42, title = "Hello", body = "World")
        val note = dto.toNote()
        assertEquals(42, note.id)
        assertEquals("Hello", note.title)
        assertEquals("World", note.body)
        // (Note has no userId field at all — that's the decoupling we want.)
    }

    /** The offline fake parses its hardcoded JSON into a non-empty list of Notes. */
    @Test
    fun fakeRepository_returnsParsedNotes() = runTest {
        val repo = FakeNoteRepository()
        val notes = repo.getNotes()
        assertTrue("fake repo should return notes", notes.isNotEmpty())
        assertEquals("Offline note one", notes.first().title)
    }

    /** provideNoteRepository(useFake = true) yields the offline implementation. */
    @Test
    fun provideRepository_defaultsToFake() {
        assertTrue(provideNoteRepository(useFake = true) is FakeNoteRepository)
        assertTrue(provideNoteRepository(useFake = false) is RealNoteRepository)
    }

    /** Extra server fields are ignored because the Json parser uses ignoreUnknownKeys. */
    @Test
    fun json_withExtraUnknownField_stillDecodes() {
        val json = Json { ignoreUnknownKeys = true }
        val dto = json.decodeFromString<NoteDto>(
            """
            {
              "userId": 1,
              "id": 99,
              "title": "Extra field example",
              "body": "The parser should ignore likes.",
              "likes": 12
            }
            """.trimIndent()
        )

        val note = dto.toNote()

        assertEquals(99, note.id)
        assertEquals("Extra field example", note.title)
        assertEquals("The parser should ignore likes.", note.body)
    }

    /** Wrong types are not ignored; they are real parse failures. */
    @Test
    fun json_withWrongRequiredType_throwsSerializationException() {
        val json = Json { ignoreUnknownKeys = true }

        try {
            json.decodeFromString<NoteDto>(
                """
                {
                  "userId": 1,
                  "id": 99,
                  "title": 404,
                  "body": "Title should have been a string."
                }
                """.trimIndent()
            )
            fail("Expected wrong title type to throw")
        } catch (expected: SerializationException) {
            assertTrue(expected.message.orEmpty().isNotBlank())
        }
    }

    /** Missing required fields are also real parse failures. */
    @Test
    fun json_missingRequiredField_throwsSerializationException() {
        val json = Json { ignoreUnknownKeys = true }

        try {
            json.decodeFromString<NoteDto>(
                """
                {
                  "userId": 1,
                  "id": 99,
                  "body": "Title is missing."
                }
                """.trimIndent()
            )
            fail("Expected missing title to throw")
        } catch (expected: SerializationException) {
            assertTrue(expected.message.orEmpty().contains("title", ignoreCase = true))
        }
    }

    /** The ViewModel starts at Loading and then publishes Success when the repo returns notes. */
    @Test
    fun viewModel_loadNotes_successPublishesSuccessState() = runTest {
        val dispatcher = StandardTestDispatcher(testScheduler)
        Dispatchers.setMain(dispatcher)
        try {
            val repo = object : NoteRepository {
                override suspend fun getNotes(): List<Note> =
                    listOf(Note(id = 1, title = "Loaded", body = "From a test repository"))
            }
            val viewModel = NotesViewModel(repository = repo)

            assertTrue(viewModel.uiState.value is NotesUiState.Loading)
            advanceUntilIdle()

            val state = viewModel.uiState.value
            assertTrue(state is NotesUiState.Success)
            assertEquals("Loaded", (state as NotesUiState.Success).notes.first().title)
        } finally {
            Dispatchers.resetMain()
        }
    }

    /** The ViewModel converts repository exceptions into Error state instead of throwing. */
    @Test
    fun viewModel_loadNotes_failurePublishesErrorState() = runTest {
        val dispatcher = StandardTestDispatcher(testScheduler)
        Dispatchers.setMain(dispatcher)
        try {
            val repo = object : NoteRepository {
                override suspend fun getNotes(): List<Note> {
                    error("network unavailable")
                }
            }
            val viewModel = NotesViewModel(repository = repo)

            assertTrue(viewModel.uiState.value is NotesUiState.Loading)
            advanceUntilIdle()

            val state = viewModel.uiState.value
            assertTrue(state is NotesUiState.Error)
            assertTrue((state as NotesUiState.Error).message.contains("network unavailable"))
        } finally {
            Dispatchers.resetMain()
        }
    }
}
