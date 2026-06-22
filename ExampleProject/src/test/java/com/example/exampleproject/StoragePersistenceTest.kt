package com.example.exampleproject

import com.example.exampleproject.data.Destination
import com.example.exampleproject.data.initialDestinations
import com.example.exampleproject.data.priorityStars
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Test

/**
 * Host-JVM unit tests for the STORAGE contract.
 *
 * LocalDestinationStore and CloudDestinationStore both persist the list by turning
 * it into a JSON string and back. That JSON round-trip is the one piece of storage
 * logic we can test WITHOUT an Android device (no Context, no disk) — so we test it
 * directly here against the same `Json` the stores use. If this passes, saving and
 * loading preserve the data; the stores just decide WHERE the string is kept.
 */
class StoragePersistenceTest {

    @Test
    fun roundTrip_preservesEveryPlace() {
        // Encode the starter list, then decode it back.
        val json = Json.encodeToString(initialDestinations)
        val restored = Json.decodeFromString<List<Destination>>(json)

        // Nothing should be lost or reordered: the decoded list equals the original.
        // (Destination is a data class, so `==` compares every field.)
        assertEquals(initialDestinations, restored)
    }

    @Test
    fun roundTrip_preservesEditedFields() {
        // Flip one place's `visited` flag, the most common edit in the app.
        val edited = initialDestinations.map { it.copy(visited = true) }

        val restored = Json.decodeFromString<List<Destination>>(Json.encodeToString(edited))

        // Every place comes back marked visited — the edit survived the round-trip.
        assertEquals(edited.size, restored.count { it.visited })
    }

    @Test
    fun emptyList_roundTripsToEmptyList() {
        // Resetting/clearing can leave an empty list; it must round-trip cleanly too.
        val restored = Json.decodeFromString<List<Destination>>(Json.encodeToString(emptyList<Destination>()))
        assertEquals(emptyList<Destination>(), restored)
    }

    @Test
    fun priorityStars_formatsFilledAndEmpty() {
        // A pure formatting helper used on the list/detail screens.
        assertEquals("★★★★☆", priorityStars(4))
        assertEquals("★★★★★", priorityStars(5))
        assertEquals("☆☆☆☆☆", priorityStars(0))
    }
}
