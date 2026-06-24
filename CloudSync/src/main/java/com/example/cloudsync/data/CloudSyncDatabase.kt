// =============================================================================
// CloudSyncDatabase.kt  —  the Room DATABASE holder + singleton
//
// CONCEPT: the abstract @Database ties the Note entity + the SyncState converter to one
// on-disk SQLite file (cloudsync.db) and is built once as a thread-safe singleton. This
// local file is the app's SINGLE SOURCE OF TRUTH — the UI reads it, and the sync engine
// reconciles it with the cloud.
// =============================================================================
package com.example.cloudsync.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters

@Database(entities = [Note::class], version = 1, exportSchema = false)
@TypeConverters(Converters::class)
abstract class CloudSyncDatabase : RoomDatabase() {

    abstract fun noteDao(): NoteDao

    companion object {
        @Volatile private var INSTANCE: CloudSyncDatabase? = null

        fun getInstance(context: Context): CloudSyncDatabase =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    CloudSyncDatabase::class.java,
                    "cloudsync.db",
                ).build().also { INSTANCE = it }
            }
    }
}
