// =============================================================================
// NoteRepository.kt  —  the OFFLINE-FIRST heart: Room ⇄ cloud
//
// CONCEPT THIS FILE TEACHES: the repository is the ONLY thing that talks to both Room and
// the cloud. The UI never sees the network. The rules:
//   • READS come from Room (a reactive Flow) — instant, and they work offline.
//   • WRITES go to Room FIRST and are marked PENDING (optimistic UI), then a background
//     sync pushes them when possible. The user's change shows immediately, online or not.
//   • sync() PUSHES the local outbox, then PULLS remote changes, resolving conflicts
//     last-write-wins. It may throw (no network) — the SyncWorker catches that and retries.
// =============================================================================
package com.example.supabasesync.data

import android.content.Context
import kotlinx.coroutines.flow.Flow
import java.util.UUID

/**
 * shouldAcceptRemote — the PURE last-write-wins rule, pulled out so it's unit-testable with
 * no Room and no coroutines. Accept the incoming remote row only when:
 *   • we have no local copy (it's genuinely new to us), OR
 *   • our local copy is already SYNCED and not newer than the remote.
 * A local row that is still PENDING always wins here — it carries an unpushed edit that will
 * be pushed on the next sync, where the server makes the final last-write-wins call.
 */
fun shouldAcceptRemote(local: Note?, remote: NoteDto): Boolean =
    local == null || (local.syncState == SyncState.SYNCED && remote.updatedAt >= local.updatedAt)

class NoteRepository private constructor(
    private val dao: NoteDao,
    private val cloud: CloudApi,
) {

    // --- what the UI observes (always from Room) -------------------------
    val notes: Flow<List<Note>> = dao.observeVisibleNotes()
    val pendingCount: Flow<Int> = dao.observePendingCount()

    // --- local writes: optimistic, marked PENDING ------------------------
    /** Create a note: write it to Room NOW (PENDING), with a client-generated id. */
    suspend fun addNote(title: String, body: String) {
        val clean = title.trim()
        if (clean.isEmpty()) return
        dao.upsert(
            Note(
                id = UUID.randomUUID().toString(),          // identity before the server ever sees it
                title = clean,
                body = body.trim(),
                updatedAt = System.currentTimeMillis(),
                syncState = SyncState.PENDING,
            )
        )
    }

    /** Edit a note locally: bump updatedAt and mark PENDING so it re-syncs. */
    suspend fun editNote(id: String, title: String, body: String) {
        val existing = dao.findById(id) ?: return
        dao.upsert(
            existing.copy(
                title = title.trim(),
                body = body.trim(),
                updatedAt = System.currentTimeMillis(),
                syncState = SyncState.PENDING,
            )
        )
    }

    /** Delete a note: a SOFT delete (tombstone) so it can still be PUSHED while offline. */
    suspend fun deleteNote(id: String) {
        val existing = dao.findById(id) ?: return
        dao.upsert(
            existing.copy(
                deleted = true,
                updatedAt = System.currentTimeMillis(),
                syncState = SyncState.PENDING,
            )
        )
    }

    // --- the sync engine (called by SyncWorker) --------------------------
    /**
     * Push the local outbox, then pull remote changes. Throws on network failure so the
     * SyncWorker can return Result.retry() and try again later with backoff.
     */
    suspend fun sync() {
        // 1) PUSH — every row created/edited/deleted offline.
        for (local in dao.notesToPush()) {
            try {
                val serverCopy = cloud.push(local.toDto())  // may throw -> bubble up to retry
                if (local.deleted) {
                    dao.hardDelete(local.id)                // tombstone confirmed -> remove locally
                } else {
                    dao.upsert(serverCopy.toEntity(SyncState.SYNCED))
                }
            } catch (e: Exception) {
                dao.upsert(local.copy(syncState = SyncState.FAILED))   // surface the failure in the UI
                throw e                                                 // let the worker retry the batch
            }
        }

        // 2) PULL — remote rows newer than the newest we already have.
        val since = dao.maxUpdatedAt() ?: 0L
        for (remote in cloud.pullSince(since)) {
            val local = dao.findById(remote.id)
            if (shouldAcceptRemote(local, remote)) {        // last-write-wins
                if (remote.deleted) dao.hardDelete(remote.id)
                else dao.upsert(remote.toEntity(SyncState.SYNCED))
            }
        }
    }

    /** Teaching hook for the UI's "simulate remote edit" button (Fake cloud only). */
    suspend fun simulateRemoteEdit() {
        (cloud as? FakeCloudApi)?.simulateRemoteEdit()
    }

    companion object {
        @Volatile private var INSTANCE: NoteRepository? = null

        /** One shared repository (so the UI and the SyncWorker use the same Room + cloud). */
        fun get(context: Context): NoteRepository =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: NoteRepository(
                    dao = SupabaseSyncDatabase.getInstance(context).noteDao(),
                    cloud = provideCloudApi(),
                ).also { INSTANCE = it }
            }
    }
}
