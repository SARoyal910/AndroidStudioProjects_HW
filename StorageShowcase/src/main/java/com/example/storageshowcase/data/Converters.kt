// =============================================================================
// Converters.kt  —  @TypeConverter pairs for non-primitive columns
//
// CONCEPT: SQLite stores only TEXT / INTEGER / REAL / BLOB / NULL. Anything richer
// needs a @TypeConverter: a pair of functions Room calls to turn your type into a
// supported one and back. Registered on the @Database via @TypeConverters.
//   • List<String>  <->  a JSON TEXT string (kotlinx.serialization)
//   • Priority enum <->  its NAME as TEXT (never the ordinal — reordering the enum
//                        would silently corrupt stored values)
// =============================================================================
package com.example.storageshowcase.data

import androidx.room.TypeConverter
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class Converters {

    // --- List<String> <-> JSON TEXT --------------------------------------
    @TypeConverter
    fun fromTags(tags: List<String>): String = Json.encodeToString(tags)

    @TypeConverter
    fun toTags(json: String): List<String> =
        if (json.isBlank()) emptyList() else Json.decodeFromString(json)

    // --- Priority enum <-> TEXT (store the NAME) -------------------------
    @TypeConverter
    fun fromPriority(p: Priority): String = p.name

    @TypeConverter
    fun toPriority(value: String): Priority =
        runCatching { Priority.valueOf(value) }.getOrDefault(Priority.NORMAL)
}
