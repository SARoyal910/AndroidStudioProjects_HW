# Android Challenges for Network Parsing

Use these as optional student implementation tasks after the HTML lesson.

## Challenge 1: Add an Empty State

**Goal:** If the repository returns an empty list, show a friendly empty screen instead of a blank list.

**Hints:**
- Add `data object Empty : NotesUiState`.
- In `loadNotes()`, publish `Empty` when `notes.isEmpty()`.
- Add a new `when` branch in `NotesContent()`.
- Add a preview for Empty.
- Add a unit test for the ViewModel empty-list path.

**Acceptance check:** A repository returning `emptyList()` produces `NotesUiState.Empty`.

## Challenge 2: Add Pull-to-Refresh or a Refresh Button

**Goal:** Let the user reload notes from the success screen.

**Hints:**
- Reuse `viewModel::loadNotes`.
- Do not create a second loading function.
- Decide whether the list should remain visible while refreshing or switch back to `Loading`.

**Acceptance check:** Refresh uses the same ViewModel path as Retry.

## Challenge 3: Add a New Server Field

**Goal:** Show a new field from the API, such as `userId`, without leaking DTOs into UI code.

**Hints:**
- Add the field to the domain `Note` only if the UI really needs it.
- Update `toNote()`.
- Update tests for the mapper.

**Acceptance check:** UI still receives `Note`, not `NoteDto`.

## Challenge 4: Add a Second Endpoint

**Goal:** Add another Retrofit call, such as fetching a single post by id.

**Hints:**
- Add another method to `NoteApi`.
- Add another method to `NoteRepository`.
- Keep parsing and mapping at the repository boundary.

**Acceptance check:** ViewModel does not know Retrofit exists.

## Challenge 5: Make Error Messages Friendlier

**Goal:** Convert technical exceptions into student/user-friendly messages.

**Hints:**
- Keep the catch boundary in the ViewModel.
- Add a small helper that maps known exception types to clearer text.
- Keep logging/debug detail separate from UI text.

**Acceptance check:** `UnknownHostException` shows a no-internet message, while parse failures show a data-format message.

## Challenge 6: Test the State Machine

**Goal:** Add local unit tests for Loading -> Success, Loading -> Empty, and Loading -> Error.

**Hints:**
- Use `StandardTestDispatcher`.
- Use `Dispatchers.setMain(...)` and `Dispatchers.resetMain()`.
- Inject tiny fake repositories into `NotesViewModel`.

**Acceptance check:** Each test asserts the final `uiState.value`.
