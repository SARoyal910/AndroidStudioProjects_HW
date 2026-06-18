// =============================================================================
// StorageDatabase.kt  —  the Room DATABASE holder + singleton + a real MIGRATION
//
// CONCEPT: the abstract @Database ties the entities + DAO to one SQLite file.
//   • @TypeConverters(Converters::class) registers the List/enum converters.
//   • version = 2 + MIGRATION_1_2 demonstrates evolving a shipped schema: a v1
//     install (notes had no `tags` column) is upgraded with an ALTER TABLE. A
//     FRESH install is created at v2 directly, so the migration only runs for
//     users upgrading from v1 — but shipping it is mandatory: with no migration
//     path Room throws IllegalStateException ("A migration from 1 to 2 was
//     required but not found") and the app crashes on launch.
// =============================================================================
package com.example.storageshowcase.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

@Database(
    entities = [Note::class, Category::class],
    version = 2,
    exportSchema = false,
)
@TypeConverters(Converters::class)
abstract class StorageDatabase : RoomDatabase() {

    abstract fun noteDao(): NoteDao

    companion object {
        @Volatile private var INSTANCE: StorageDatabase? = null

        /**
         * v1 -> v2: add the `tags` column to the notes table. SQLite's ALTER TABLE
         * ADD COLUMN requires a default for a NOT NULL column; we store an empty
         * JSON array so existing rows decode to an empty tag list.
         */
        val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("ALTER TABLE notes ADD COLUMN tags TEXT NOT NULL DEFAULT '[]'")
            }
        }

        fun getInstance(context: Context): StorageDatabase =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    StorageDatabase::class.java,
                    "storage.db",
                )
                    .addMigrations(MIGRATION_1_2)   // wired for v1 -> v2 upgraders
                    .build()
                    .also { INSTANCE = it }
            }
    }
}
