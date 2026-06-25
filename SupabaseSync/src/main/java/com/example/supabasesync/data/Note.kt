// =============================================================================
// Note.kt  —  the ENTITY (local row) + the DTO (cloud row shape) + the mappers
//
// CONCEPT THIS FILE TEACHES: offline-first storage is a NORMAL Room entity PLUS a
// little sync bookkeeping. Each row carries:
//   • a CLIENT-generated id (so a note created OFFLINE already has an identity before
//     the server ever sees it),
//   • an updatedAt timestamp (the clock used for last-write-wins conflict resolution),
//   • a syncState (has this row been pushed to the cloud yet?), and
//   • a deleted "tombstone" flag (a delete you can still PUSH while offline — you can't
//     upload a row you've already removed).
// The DTO is the shape the cloud speaks; mappers convert between the two. Here the cloud is
// a Postgres table, so the DTO is one ROW of the `notes` table (sent as JSON by supabase-kt).
// =============================================================================
package com.example.supabasesync.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.SerialName
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
 * NoteDto — the cloud's shape: ONE row of the Supabase `notes` table, serialized as JSON.
 * It deliberately has NO syncState (a local-only concern) but DOES carry `deleted` so a
 * tombstone replicates to other devices.
 *
 * --- @Serializable ---
 * This annotation (from kotlinx.serialization) tells the Kotlin compiler plugin to generate
 * JSON encode/decode logic for this class at compile time. Without it, supabase-kt's
 * decodeList<NoteDto>() and decodeSingle<NoteDto>() could not convert JSON to/from NoteDto.
 * The compiler plugin is wired up in build.gradle.kts (alias(libs.plugins.kotlin.serialization))
 * and the runtime is on the classpath as libs.kotlinx.serialization.json.
 *
 * --- @SerialName("updated_at") ---
 * Postgres column names are conventionally snake_case ("updated_at"). Kotlin property names are
 * conventionally camelCase ("updatedAt"). These do NOT match, so the serializer would fail to
 * find the right JSON key without this hint. @SerialName("updated_at") tells kotlinx.serialization:
 * "when writing JSON, use the key 'updated_at'; when reading JSON, look for 'updated_at'."
 * The other four columns (id, title, body, deleted) happen to spell the same in both conventions,
 * so they need no @SerialName annotation.
 *
 * @SerialName("updated_at") maps the Kotlin name `updatedAt` to the Postgres column `updated_at`
 * — this is the one place the snake_case ↔ camelCase boundary is bridged. The column must be
 * named "updated_at" in the Postgres CREATE TABLE statement (see README and the SQL in the HTML
 * walkthrough) for the mapping to work end-to-end.
 */
@Serializable
data class NoteDto(
    val id: String,
    val title: String,
    val body: String,
    @SerialName("updated_at") val updatedAt: Long,  // bridges snake_case Postgres → camelCase Kotlin
    val deleted: Boolean = false,
)

// --- mappers: the single boundary between "local shape" and "cloud shape" ---------

/** Local row → the shape we PUSH to the cloud. */
fun Note.toDto(): NoteDto = NoteDto(id, title, body, updatedAt, deleted)

/** Cloud row → a local row. Rows that arrive from the cloud are, by definition, SYNCED. */
fun NoteDto.toEntity(state: SyncState = SyncState.SYNCED): Note =
    Note(id = id, title = title, body = body, updatedAt = updatedAt, syncState = state, deleted = deleted)
