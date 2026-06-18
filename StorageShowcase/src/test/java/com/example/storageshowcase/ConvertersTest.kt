// JVM unit test (no device): the @TypeConverter pairs round-trip correctly.
package com.example.storageshowcase

import com.example.storageshowcase.data.Converters
import com.example.storageshowcase.data.Priority
import org.junit.Assert.assertEquals
import org.junit.Test

class ConvertersTest {
    private val c = Converters()

    @Test fun tags_roundTrip() {
        val tags = listOf("home", "urgent", "with,comma")
        assertEquals(tags, c.toTags(c.fromTags(tags)))
    }

    @Test fun tags_emptyAndBlank() {
        assertEquals(emptyList<String>(), c.toTags(c.fromTags(emptyList())))
        assertEquals(emptyList<String>(), c.toTags(""))
    }

    @Test fun priority_roundTripByName() {
        Priority.entries.forEach { p -> assertEquals(p, c.toPriority(c.fromPriority(p))) }
        // unknown text falls back to NORMAL (never crashes)
        assertEquals(Priority.NORMAL, c.toPriority("NOPE"))
    }
}
