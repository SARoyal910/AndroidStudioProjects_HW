// =============================================================================
// Converters.kt  —  @TypeConverter for the SyncState enum
//
// CONCEPT: SQLite stores only TEXT/INTEGER/REAL/BLOB/NULL, so Room needs a converter
// pair to persist the SyncState enum. We store its NAME ("PENDING"), never its ordinal —
// reordering the enum later would otherwise silently corrupt stored values. Registered
// on the @Database via @TypeConverters.
// =============================================================================
package com.example.cloudsync.data

import androidx.room.TypeConverter

class Converters {

    @TypeConverter
    fun fromSyncState(state: SyncState): String = state.name        // store the NAME

    @TypeConverter
    fun toSyncState(value: String): SyncState =
        runCatching { SyncState.valueOf(value) }.getOrDefault(SyncState.SYNCED)   // never crash on a bad value
}
