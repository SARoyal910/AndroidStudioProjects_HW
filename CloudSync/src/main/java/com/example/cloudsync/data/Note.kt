// =============================================================================
// Note.kt  —  the ENTITY (local row) + the DTO (cloud wire shape) + the mappers
//
// CONCEPT THIS FILE TEACHES: offline-first storage is a NORMAL Room entity PLUS a
// little sync bookkeeping. Each row carries:
//   • a CLIENT-generated id (so a note created OFFLINE already has an identity before
//     the server ever sees it),
//   • an updatedAt timestamp (the clock used for last-write-wins conflict resolution),
//   • a syncState (has this row been pushed to the cloud yet?), and
//   • a deleted "tombstone" flag (a delete you can still PUSH while offline — you can't
//     upload a row you've already removed).
// The DTO is the shape the cloud speaks; mappers convert between the two, exactly like
// the NetworkParsing demo's DTO/domain split.
// =============================================================================
package com.example.cloudsync.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

/**
 * Per-row sync status — the bookkeeping offline-first adds on top of a plain entity.
 *   • SYNCED  — the local row matches the cloud.
 *   • PENDING — created/edited/deleted locally and NOT yet pushed (the "outbox").
 *   • FAILED  — a push was attempted and failed (shown to the user; retried by WorkManager).
 * Persisted by NAME via a @TypeConverter (see Converters.kt), never the ordinal.
 */
enum class SyncState { SYNCED, PENDING, FAILED }

/**
 * Note — ONE ROW in the local "notes" table, and the single thing the UI ever reads.
 *
 * @property id        a client-generated UUID string (assigned the instant the note is
 *   created, online or offline — this is what lets an offline row be pushed later).
 * @property title     the note headline.
 * @property body      the note text.
 * @property updatedAt epoch millis of the last local change; the comparator for LWW.
 * @property syncState SYNCED / PENDING / FAILED (the outbox marker).
 * @property deleted   a soft-delete tombstone: hidden from the UI, kept until the cloud
 *   confirms the delete, then hard-deleted locally.
 */
@Entity(tableName = "notes")
data class Note(
    @PrimaryKey val id: String,
    val title: String,
    val body: String,
    val updatedAt: Long,
    val syncState: SyncState = SyncState.PENDING,
    val deleted: Boolean = false,
)

/**
 * NoteDto — the cloud's wire shape: the JSON object the backend stores and returns.
 * It deliberately has NO syncState (that's a local-only concern) but DOES carry
 * `deleted` so a tombstone can be replicated to other devices.
 */
@Serializable
data class NoteDto(
    val id: String,
    val title: String,
    val body: String,
    val updatedAt: Long,
    val deleted: Boolean = false,
)

// --- mappers: the single boundary between "local shape" and "cloud shape" ---------

/** Local row → the shape we PUSH to the cloud. */
fun Note.toDto(): NoteDto = NoteDto(id, title, body, updatedAt, deleted)

/** Cloud row → a local row. Rows that arrive from the cloud are, by definition, SYNCED. */
fun NoteDto.toEntity(state: SyncState = SyncState.SYNCED): Note =
    Note(id = id, title = title, body = body, updatedAt = updatedAt, syncState = state, deleted = deleted)
