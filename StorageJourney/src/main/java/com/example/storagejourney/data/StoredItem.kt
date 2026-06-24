// =============================================================================
// StoredItem.kt  —  THE ELEMENT THAT TRAVELS INTO STORAGE (one Room table row)
//
// THE WHOLE APP IN ONE SENTENCE: follow a single piece of data — one StoredItem —
// from the text field, through every layer, onto the disk, and back to the screen.
// THIS file is that piece of data: the "element" the title of the project refers to.
//
// CONCEPT: a Room @Entity is a Kotlin class that Room turns into a SQLite TABLE at
// COMPILE TIME (via KSP — see build.gradle.kts). You never write "CREATE TABLE ..."
// SQL by hand; you describe the shape of one row as an annotated data class and Room
// generates all the SQLite plumbing.
//
// HOW TO READ THE ANNOTATIONS BELOW:
//   • @Entity(tableName = "items")  — "this class IS a table named items".
//   • @PrimaryKey(autoGenerate = true) — the unique row id; passing 0 on insert tells
//        SQLite "you pick the next id for me" (auto-increment).
//   • each plain constructor property — becomes one COLUMN in the table.
//
// Compare this file with ItemDao.kt (the read/write methods) and ItemDatabase.kt
// (the database holder). Those three files are the entire "storage component".
// =============================================================================
package com.example.storagejourney.data

import androidx.room.Entity      // marks a class as a Room table (one instance == one row)
import androidx.room.PrimaryKey  // marks the field that uniquely identifies each row

// ---------------------------------------------------------------------------
// DATA  (the row)
// ---------------------------------------------------------------------------

/**
 * One saved element — a SINGLE ROW in the SQLite "items" table.
 *
 * `data class` is a Kotlin class that auto-generates `equals`, `hashCode`, `toString`,
 * and `copy` from its constructor properties. That `copy` matters later: when we want
 * a tweaked version of a row (e.g. for an update) we call `item.copy(...)` instead of
 * rebuilding it by hand.
 *
 * Room reads the annotations on this class and, at build time, generates the code to
 * read this object out of and write it into SQLite — no hand-written SQL required.
 *
 * @property id        primary key. Defaults to 0; with autoGenerate=true, passing 0 on
 *                     insert means "SQLite, assign the next id". After the row is saved,
 *                     the real id comes back (see ItemDao.insert returning Long).
 * @property label     the text the user typed (a TEXT column). This is the payload that
 *                     travels all the way from the OutlinedTextField to disk.
 * @property createdAt the moment this row was created, as epoch milliseconds
 *                     (System.currentTimeMillis()). Stored as an INTEGER column. We set
 *                     it in the ViewModel so the row carries its own "saved at" timestamp.
 */
@Entity(tableName = "items")                 // <-- THE concept: this class IS a table named "items"
data class StoredItem(
    @PrimaryKey(autoGenerate = true)         // <-- unique row id; SQLite auto-increments it
    val id: Long = 0,                        // default 0 => "let Room/SQLite pick the id on insert"
    val label: String,                       // becomes a TEXT column "label" (the user's text)
    val createdAt: Long,                     // becomes an INTEGER column "createdAt" (epoch millis)
)
