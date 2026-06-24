// =============================================================================
// Task.kt  —  THE ROOM ENTITY (one database table, described as a Kotlin class)
//
// CONCEPT: BASIC STORAGE with Room.
// Room is Android's official SQLite object-mapping library. Instead of writing raw
// SQL "CREATE TABLE" statements, you describe a TABLE as an annotated Kotlin data
// class. Room reads these annotations AT COMPILE TIME (via KSP — see build.gradle.kts)
// and generates all the SQLite plumbing for you.
//
// ──────────────────────────────────────────────────────────────────────────────
// THIS FILE IS DONE FOR YOU — it is your Room REFERENCE. Read it carefully; you do
// not edit it. The matching pieces are TaskDao.kt (the queries) and TaskDatabase.kt
// (the wiring). Together those three files are the whole Room data layer.
// ──────────────────────────────────────────────────────────────────────────────
//
// WHAT TO INSPECT HERE:
//   • @Entity            — marks this class as a database table named "tasks".
//   • @PrimaryKey        — the unique row id; autoGenerate=true lets SQLite assign it.
//   • The plain fields   — each becomes a COLUMN in the "tasks" table.
// =============================================================================
package com.example.hw6tasklist.data

import androidx.room.Entity      // marks a class as a Room table (one row == one object)
import androidx.room.PrimaryKey  // marks the field that uniquely identifies each row

/**
 * A single persisted task — ONE ROW in the SQLite "tasks" table.
 *
 * Room turns this annotated data class into a real table at compile time: each
 * constructor property below becomes a COLUMN, and each Task instance becomes a ROW.
 * Because it is annotated [@Entity], Room knows how to read it out of and write it
 * into SQLite without any hand-written SQL.
 *
 * @property id        primary key. Defaults to 0; with autoGenerate=true, passing 0
 *                     on insert tells SQLite "assign the next id for me". A real,
 *                     already-saved task has a non-zero id — that is how the app
 *                     tells "new task" (id == 0) from "edit existing" (id != 0).
 * @property title     the task's short headline (a TEXT column).
 * @property notes     longer free-text details (a TEXT column).
 * @property done      whether the task is checked off (stored as INTEGER 0/1).
 * @property priority  importance as a small INTEGER: 0 = Low, 1 = Normal, 2 = High.
 *                     (We deliberately store a plain Int — no enum + TypeConverter —
 *                     to keep this "basic Room": Room can persist Int directly.)
 * @property createdAt when the task was created, as epoch milliseconds (INTEGER).
 *                     Used to sort newest-first; defaulted at construction time.
 */
@Entity(tableName = "tasks")                 // <-- THE concept: this class IS a table named "tasks"
data class Task(
    @PrimaryKey(autoGenerate = true)         // <-- unique row id; SQLite auto-increments it
    val id: Long = 0,                        // default 0 => "let Room/SQLite pick the id on insert"
    val title: String,                       // becomes a TEXT column "title"
    val notes: String = "",                  // becomes a TEXT column "notes"
    val done: Boolean = false,               // becomes an INTEGER column "done" (0 = false, 1 = true)
    val priority: Int = 1,                    // becomes an INTEGER column "priority" (0=Low,1=Normal,2=High)
    val createdAt: Long = System.currentTimeMillis(), // INTEGER column; epoch millis at creation time
)
