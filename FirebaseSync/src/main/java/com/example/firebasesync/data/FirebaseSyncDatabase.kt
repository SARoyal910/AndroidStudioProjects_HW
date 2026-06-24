// =============================================================================
// FirebaseSyncDatabase.kt  —  the Room DATABASE holder + singleton
//
// CONCEPT: the abstract @Database ties the Note entity + the SyncState converter to one
// on-disk SQLite file (firebasesync.db) and is built once as a thread-safe singleton. This
// local file is the app's SINGLE SOURCE OF TRUTH — the UI reads it, and the sync engine
// reconciles it with the cloud.
// =============================================================================
package com.example.firebasesync.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters

@Database(entities = [Note::class], version = 1, exportSchema = false)
@TypeConverters(Converters::class)
abstract class FirebaseSyncDatabase : RoomDatabase() {

    abstract fun noteDao(): NoteDao

    companion object {
        @Volatile private var INSTANCE: FirebaseSyncDatabase? = null

        fun getInstance(context: Context): FirebaseSyncDatabase =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    FirebaseSyncDatabase::class.java,
                    "firebasesync.db",
                ).build().also { INSTANCE = it }
            }
    }
}
