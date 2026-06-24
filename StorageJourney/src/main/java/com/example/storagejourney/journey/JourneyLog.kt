// =============================================================================
// JourneyLog.kt  —  THE NARRATOR (an observable trace of the storage journey)
//
// WHY THIS FILE EXISTS: every other storage demo hides the trip a piece of data takes
// into the database. This project makes it VISIBLE. As one element is saved, each layer
// records a short line here ("UI captured the text", "Room wrote row #7", ...). The
// screen renders those lines as a numbered, timestamped list, so you can literally watch
// the element travel UI -> ViewModel -> Repository -> Room -> Flow -> back to the UI.
//
// HOW IT WORKS: JourneyLog holds the steps in a MutableStateFlow (a reactive value that
// re-emits whenever it changes). The ViewModel exposes that Flow, the UI collects it, and
// every recorded step recomposes the journey panel. It is the SAME reactive pattern Room
// uses for the data itself — applied here to the narration of the trip.
//
// This class deliberately has NO Android dependencies (no Context, no android.* imports),
// which is exactly what lets us unit-test it on the JVM — see JourneyLogTest.kt.
// =============================================================================
package com.example.storagejourney.journey

import kotlinx.coroutines.flow.MutableStateFlow   // a writable reactive value-holder
import kotlinx.coroutines.flow.StateFlow          // the read-only view the UI collects
import kotlinx.coroutines.flow.asStateFlow        // expose the mutable flow as read-only
import kotlinx.coroutines.flow.update             // atomic read-modify-write on a StateFlow

// ---------------------------------------------------------------------------
// MODEL
// ---------------------------------------------------------------------------

/**
 * Which LAYER a step belongs to. Used purely for grouping + color-coding in the UI so the
 * five stages of the journey are visually distinct.
 *
 * An `enum class` is a fixed set of named constants. Giving the enum a constructor
 * parameter (`val label: String`) lets each constant carry data — here a short human name
 * shown as a chip next to the step.
 */
enum class JourneyStage(val label: String) {
    UI("UI"),                   // the Compose screen: where the user's text is captured
    VIEWMODEL("ViewModel"),     // the state holder: launches the coroutine for the write
    REPOSITORY("Repository"),   // the storage component's front door (wraps the DAO)
    ROOM("Room · SQLite"),      // the engine: the actual write to the .db file on disk
    FLOW("Flow · UI"),          // the return trip: Room re-emits, the screen recomposes
}

/**
 * One recorded moment in the journey.
 *
 * @property stage            which layer logged this (drives the color/label chip).
 * @property message          the human-readable description shown to the user.
 * @property sinceStartMillis milliseconds elapsed since the journey was reset() — lets the
 *                            UI show "+0 ms", "+3 ms", ... so the ordering and timing of the
 *                            layers is obvious. (Position in the list gives the step number.)
 */
data class JourneyStep(
    val stage: JourneyStage,
    val message: String,
    val sinceStartMillis: Long,
)

// ---------------------------------------------------------------------------
// THE LOG
// ---------------------------------------------------------------------------

/**
 * A tiny, thread-safe, observable recorder for the storage journey.
 *
 * @param now a clock function returning "current time in millis". Defaults to the real
 *            system clock, but the unit test injects a fake clock so timings are
 *            deterministic. (`System::currentTimeMillis`-style function references keep this
 *            class free of any Android dependency.)
 */
class JourneyLog(private val now: () -> Long = { System.currentTimeMillis() }) {

    // The instant the current journey began. In THIS app every record() runs on the MAIN
    // thread: viewModelScope uses Dispatchers.Main.immediate, and even the suspend dao.insert
    // resumes back on Main (Room runs only the disk write off-thread, deep inside insert).
    // So @Volatile is not strictly required here — it is cheap insurance: if you later move
    // the save coroutine to Dispatchers.IO, a reset() on Main stays visible to a record() on IO.
    @Volatile private var startMillis: Long = now()

    // The backing, writable stream of steps. Private so only this class can mutate it.
    private val _steps = MutableStateFlow<List<JourneyStep>>(emptyList())

    /** The steps as a read-only reactive stream. The ViewModel re-exposes this to the UI. */
    val steps: StateFlow<List<JourneyStep>> = _steps.asStateFlow()

    /**
     * Begin a fresh journey: stamp the start time and clear any previous steps. Called at
     * the very start of "save an item" so the panel shows only THIS element's trip.
     */
    fun reset() {
        startMillis = now()
        _steps.value = emptyList()
    }

    /**
     * Append one step to the journey.
     *
     * `update { old -> old + step }` is an ATOMIC read-modify-write: it reads the current
     * list, builds a new list with the step appended, and stores it in one safe operation
     * (retrying if another thread changed it in between). In this app every record() runs on
     * the main thread, so a plain `_steps.value = _steps.value + step` would also work today;
     * using `update` keeps the class correct even if you later move writes to a background
     * dispatcher. (`old + step` makes a NEW list — StateFlow only re-emits when the value differs.)
     */
    fun record(stage: JourneyStage, message: String) {
        val elapsed = now() - startMillis
        _steps.update { old -> old + JourneyStep(stage, message, elapsed) }
    }
}
