# Storage Journey

A small, **heavily commented** Jetpack Compose teaching app that exists to answer one
question in detail: **how does a piece of data actually get into storage?**

You type a line of text, tap **Save to storage**, and the app follows that *single
element* through every layer it passes on the way to disk — and back to the screen. The
running app draws a live **Journey panel** that lists the numbered, color-coded steps the
data just took, and the companion page
[`how-an-item-reaches-storage.html`](how-an-item-reaches-storage.html) shows that exact
trip as **blocks of real code, in order, from build wiring to app teardown**.

> 🕹️ **Interactive explainer:** open [`storage-journey-explorer.html`](storage-journey-explorer.html) —
> a live simulator that runs the same pipeline in your browser (save an item, watch it travel the layers,
> see the journey log and SQLite table update), plus a clickable architecture map, code explorer, a
> reactive-`Flow` demo, a persistence playground, a glossary, and a quiz.
>
> 📖 **Step-by-step walkthrough:** open [`how-an-item-reaches-storage.html`](how-an-item-reaches-storage.html)
> in a browser — every step of the storage process as a code block pulled from this project.

Unlike its siblings, this project uses **only Room** (no DataStore, no files) on purpose:
one element, one store, start to finish, so the journey is easy to follow.

## The journey (and where each leg lives)

| # | Layer | What happens | File |
|---|---|---|---|
| 1 | **UI** | The Save button captures the typed text and calls the ViewModel | `MainActivity.kt` |
| 2 | **ViewModel** | Stamps `createdAt`, builds the `StoredItem`, launches a coroutine | `StorageJourneyViewModel.kt` |
| 3 | **Repository** | The one storage boundary; hands the element to the DAO | `data/ItemRepository.kt` |
| 4 | **Room · SQLite** | `@Insert` runs a real `INSERT`, SQLite assigns an id, commits the row to `journey.db` | `data/ItemDao.kt`, `data/ItemDatabase.kt` |
| 5 | **Flow → UI** | Room re-runs the reactive query, the `StateFlow` updates, the screen recomposes | `StorageJourneyViewModel.kt`, `MainActivity.kt` |

The narration itself is an observable trace in `journey/JourneyLog.kt` — the same reactive
`Flow` → Compose pattern Room uses for the data, applied to the story of the trip.

## Key files

```
src/main/java/com/example/storagejourney/
  data/
    StoredItem.kt              @Entity — the element that travels into storage (one row)
    ItemDao.kt                 @Dao — insert (write) + observeItems(): Flow (reactive read)
    ItemDatabase.kt            @Database singleton — builds journey.db
    ItemRepository.kt          the storage component's front door; records the Repo + Room legs
  journey/
    JourneyLog.kt              observable, Android-free trace the UI renders
  StorageJourneyViewModel.kt   wires it together; addItem() reads top-to-bottom as the write path
  MainActivity.kt              one screen: input + saved list (with SQLite ids) + Journey panel
src/test/java/.../journey/JourneyLogTest.kt   JVM unit tests for the trace recorder
how-an-item-reaches-storage.html              the step-by-step code walkthrough
```

## What to inspect

- **The reactive read (`ItemDao.kt`)** — `observeItems()` returns `Flow<List<StoredItem>>`.
  Room re-runs the query and re-emits **every time the table changes**, so you never write a
  manual "reload the list" call. That is the return trip of the journey.
- **The write path as prose (`StorageJourneyViewModel.kt`)** — read `addItem()` top to bottom:
  it resets the trace, records the UI and ViewModel legs, then launches the suspend save.
- **The storage boundary (`ItemRepository.kt`)** — the one place the app talks to Room, and
  the honest spot to record the Repository and Room legs (you can watch the new id come back).
- **Room + KSP wiring (`build.gradle.kts`)** — the `com.google.devtools.ksp` plugin plus
  `ksp(libs.androidx.room.compiler)` is what generates `ItemDatabase_Impl` / `ItemDao_Impl` at
  build time. The KSP version (`2.2.10-2.0.2`) is pinned to the Kotlin version (`2.2.10`).
- **Inspect the database live** — run the app, then in Android Studio open
  **View ▸ Tool Windows ▸ App Inspection ▸ Database Inspector**, select `journey.db`, and
  watch the `items` table gain a row the instant you tap Save. Kill and relaunch the app: the
  rows are still there, and the Journey panel's first entry is a lone green **Flow** step —
  Room reading them back off disk with no save in sight.

## Tech stack

Jetpack Compose · Material 3 · Room `2.7.2` via **KSP** · lifecycle-viewmodel/runtime-compose ·
Kotlin `2.2.10` · AGP `9.2.1` · `compileSdk 37` / `minSdk 24` · Compose BOM `2026.02.01`.

## Run

From inside `StorageJourney/` (uses the Android Studio JBR / JDK 21 for CLI builds):

```bash
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
  ./gradlew :compileDebugKotlin     # type-check + run Room's KSP code generation
./gradlew :testDebugUnitTest        # run the JourneyLog JVM unit tests
./gradlew installDebug              # build & install on a running device/emulator
```

Save a few items, then fully close and reopen the app — everything you stored is still there,
because it was written to `journey.db`, not just held in memory.

## Where this sits in the storage curriculum

This is the **depth-on-one-round-trip** project. For **breadth** (Room relations + Preferences
DataStore + typed DataStore + files), see [`StorageShowcase`](../StorageShowcase) and its
[walkthrough](../StorageShowcase/how-storageshowcase-works.html). Not sure which storage API to
reach for? Start with [`STORAGE_GUIDE.md`](../STORAGE_GUIDE.md).
