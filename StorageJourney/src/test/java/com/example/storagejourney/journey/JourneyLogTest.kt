// =============================================================================
// JourneyLogTest.kt  —  JVM UNIT TESTS for the journey trace recorder
//
// Why this can be a plain JVM test (no emulator): JourneyLog has NO Android dependency.
// It only uses a MutableStateFlow and an injectable clock, so we can construct it, drive a
// FAKE clock, and read back `steps.value` synchronously — record()/reset() mutate the
// StateFlow on the calling thread, so the new value is visible immediately.
//
// Run with:  ./gradlew :testDebugUnitTest
// =============================================================================
package com.example.storagejourney.journey

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class JourneyLogTest {

    @Test
    fun starts_empty() {
        // A brand-new log has no steps yet.
        assertTrue(JourneyLog().steps.value.isEmpty())
    }

    @Test
    fun records_steps_in_order_with_elapsed_time() {
        // A fake clock we advance by hand so timings are deterministic.
        var clock = 1_000L
        val log = JourneyLog(now = { clock })

        log.reset()                       // stamps startMillis = 1000
        clock = 1_003L
        log.record(JourneyStage.UI, "captured text")          // elapsed 3 ms
        clock = 1_010L
        log.record(JourneyStage.ROOM, "wrote row")            // elapsed 10 ms

        val steps = log.steps.value
        assertEquals(2, steps.size)

        // Order is preserved, and each step carries its stage + message.
        assertEquals(JourneyStage.UI, steps[0].stage)
        assertEquals("captured text", steps[0].message)
        assertEquals(3L, steps[0].sinceStartMillis)

        assertEquals(JourneyStage.ROOM, steps[1].stage)
        assertEquals("wrote row", steps[1].message)
        assertEquals(10L, steps[1].sinceStartMillis)
    }

    @Test
    fun reset_clears_steps_and_restamps_the_start() {
        var clock = 0L
        val log = JourneyLog(now = { clock })

        clock = 5L
        log.record(JourneyStage.UI, "first trip")
        assertEquals(1, log.steps.value.size)

        // Resetting empties the list AND moves the start time to "now" (100).
        clock = 100L
        log.reset()
        assertTrue(log.steps.value.isEmpty())

        // The next step's elapsed time is measured from the reset (100), not from 0.
        clock = 102L
        log.record(JourneyStage.FLOW, "second trip")
        assertEquals(2L, log.steps.value[0].sinceStartMillis)
    }

    @Test
    fun stage_labels_are_human_readable() {
        // The chip labels the UI shows come straight from the enum.
        assertEquals("UI", JourneyStage.UI.label)
        assertEquals("ViewModel", JourneyStage.VIEWMODEL.label)
        assertEquals("Repository", JourneyStage.REPOSITORY.label)
        assertEquals("Room · SQLite", JourneyStage.ROOM.label)
        assertEquals("Flow · UI", JourneyStage.FLOW.label)
    }
}
