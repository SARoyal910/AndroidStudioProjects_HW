// =============================================================================
// TaskDatabase.kt  —  THE ROOM DATABASE (ties the Entity + DAO into a real DB file)
//
// CONCEPT: BASIC STORAGE with Room — the database holder + singleton.
// This abstract class is the single connection point to the underlying SQLite file
// on disk. Room generates the concrete TaskDatabase_Impl at build time (KSP), which
// is why the class and taskDao() are `abstract` — YOU never implement them.
//
// ──────────────────────────────────────────────────────────────────────────────
// THIS FILE IS DONE FOR YOU — read it as your Room REFERENCE; you do not edit it.
// ──────────────────────────────────────────────────────────────────────────────
//
// WHAT TO INSPECT HERE:
//   • @Database(entities=[Task::class], version=1, exportSchema=false)
//        — lists every table (entity) and the schema version. exportSchema=false
//          avoids needing a schema-JSON output directory for this teaching sample.
//   • abstract fun taskDao()  — Room implements this to return the generated DAO.
//   • getInstance()           — a thread-safe SINGLETON built with Room.databaseBuilder.
//        Creating more than one database instance for the same file is wasteful and
//        can corrupt state, so we cache exactly one.
// =============================================================================
package com.example.hw6tasklist.data

import android.content.Context              // needed by Room.databaseBuilder to locate app storage
import androidx.room.Database               // marks this class as the Room database + lists its tables
import androidx.room.Room                   // factory used to build the database instance
import androidx.room.RoomDatabase           // base class every Room database extends

/**
 * The app's Room database. Holds the single "tasks" table and exposes its DAO.
 *
 * It is `abstract`: Room GENERATES the real subclass (TaskDatabase_Impl) at compile
 * time. The @Database annotation tells Room which entities (tables) belong to this
 * database and the schema version (bump it + add a Migration when the schema changes).
 */
@Database(
    entities = [Task::class],               // <-- every table in this DB; here just Task
    version = 1,                            // schema version; increment when columns change
    exportSchema = false,                   // <-- skip writing schema JSON (no schema dir needed for the demo)
)
abstract class TaskDatabase : RoomDatabase() {

    /**
     * Room implements this to return the generated [TaskDao]. You call
     * `db.taskDao()` to get the object whose annotated methods run real SQL.
     */
    abstract fun taskDao(): TaskDao         // <-- Room fills this in with TaskDao_Impl

    // -----------------------------------------------------------------------
    // SINGLETON — exactly ONE database instance per process.
    // -----------------------------------------------------------------------
    companion object {
        // @Volatile: writes to INSTANCE are immediately visible to all threads,
        // so the double-checked locking below is correct under concurrency.
        @Volatile private var INSTANCE: TaskDatabase? = null

        /**
         * Return the shared [TaskDatabase], creating it on first use.
         *
         * Uses double-checked locking so two threads racing on startup can't each
         * build their own database instance for the same file.
         */
        fun getInstance(context: Context): TaskDatabase =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,             // applicationContext => no Activity leak
                    TaskDatabase::class.java,               // the database class to implement
                    "tasks.db",                             // the SQLite FILE name on disk
                ).build().also { INSTANCE = it }            // cache the instance for next time
            }
    }
}
