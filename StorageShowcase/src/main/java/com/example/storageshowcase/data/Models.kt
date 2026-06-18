// =============================================================================
// Models.kt  —  Room ENTITIES + the relation POJO + the priority enum
//
// CONCEPT: STRUCTURED data with Room. Two tables with a real relationship:
//   • Category (parent)   — a folder a note belongs to.
//   • Note (child)        — references its Category via a FOREIGN KEY.
//   • CategoryWithNotes   — a @Relation read object (one category + its many notes).
// This is the relational half of the storage curriculum (see also Converters.kt
// for the @TypeConverter that lets a Note store a List<String> and an enum).
// =============================================================================
package com.example.storageshowcase.data

import androidx.room.Embedded
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import androidx.room.Relation

/** Importance of a note. Persisted by NAME (not ordinal) via a @TypeConverter. */
enum class Priority { LOW, NORMAL, HIGH }

/**
 * A folder/category — ONE ROW in the "categories" table, the PARENT side of the relation.
 */
@Entity(
    tableName = "categories",
    // unique name so OnConflictStrategy.IGNORE makes "create the default category"
    // idempotent — re-inserting "Inbox" on every launch is silently skipped.
    indices = [Index(value = ["name"], unique = true)],
)
data class Category(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
)

/**
 * A persisted note — ONE ROW in the "notes" table, the CHILD side of the relation.
 *
 * The [ForeignKey] enforces referential integrity at the SQLite level: a Note's
 * [categoryId] must match an existing Category id, and `onDelete = CASCADE` means
 * deleting a Category automatically deletes its notes. A foreign-key child column
 * SHOULD be indexed (Room warns otherwise) — without the index, every parent
 * delete/update does a full table scan of "notes" — so we add @Index("categoryId").
 */
@Entity(
    tableName = "notes",
    foreignKeys = [
        ForeignKey(
            entity = Category::class,
            parentColumns = ["id"],
            childColumns = ["categoryId"],
            onDelete = ForeignKey.CASCADE,
        )
    ],
    indices = [Index("categoryId"), Index("title")],
)
data class Note(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val body: String,
    val done: Boolean = false,                 // INTEGER 0/1
    val categoryId: Long,                      // FK -> categories.id (indexed)
    val priority: Priority = Priority.NORMAL,  // enum -> TEXT via Converters
    val tags: List<String> = emptyList(),      // List -> JSON TEXT via Converters
    val createdAt: Long = 0L,                  // epoch millis (INTEGER); set by the ViewModel
)

/**
 * A relation read object: one [Category] plus the list of [Note]s pointing at it.
 *
 * Room fills [notes] by running a second query matching `notes.categoryId == categories.id`.
 * DAO functions returning this must be annotated @Transaction so the parent row and its
 * children are read as one consistent snapshot.
 */
data class CategoryWithNotes(
    @Embedded val category: Category,
    @Relation(parentColumn = "id", entityColumn = "categoryId")
    val notes: List<Note>,
)
