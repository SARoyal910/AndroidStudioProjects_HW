// =============================================================================
// FirebaseSyncUnitTest.kt  —  local JVM tests for the offline-first logic (no device)
//
// Verifies the pure, testable pieces of the concept:
//   1. shouldAcceptRemote — the last-write-wins conflict rule (no Room, no coroutines).
//   2. Converters — the SyncState enum round-trips by name and never crashes.
//   3. FakeCloudApi — push respects last-write-wins; pull returns rows after the cursor.
// =============================================================================
package com.example.firebasesync

import com.example.firebasesync.data.Converters
import com.example.firebasesync.data.FakeCloudApi
import com.example.firebasesync.data.Note
import com.example.firebasesync.data.NoteDto
import com.example.firebasesync.data.SyncState
import com.example.firebasesync.data.shouldAcceptRemote
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class FirebaseSyncUnitTest {

    private fun localNote(updatedAt: Long, state: SyncState) =
        Note(id = "a", title = "t", body = "b", updatedAt = updatedAt, syncState = state)

    private fun remote(updatedAt: Long) =
        NoteDto(id = "a", title = "t", body = "b", updatedAt = updatedAt)

    // --- shouldAcceptRemote (last-write-wins) --------------------------------

    /**
     * Case: We have no local record of this note.
     * Expected: Always accept the remote version since any data is better than none.
     */
    @Test fun acceptRemote_whenNoLocalCopy() {
        assertTrue(shouldAcceptRemote(local = null, remote = remote(100)))
    }

    /**
     * Case: Local copy is already synced with the server, but the server now has
     * a version with a higher timestamp.
     * Expected: Accept remote version (Last-Write-Wins).
     */
    @Test fun acceptRemote_whenLocalSyncedAndRemoteNewer() {
        assertTrue(shouldAcceptRemote(localNote(100, SyncState.SYNCED), remote(200)))
    }

    /**
     * Case: Local copy is synced and has the exact same timestamp as the remote version.
     * Expected: Accept remote version. This ensures idempotency and allows re-pulling
     * the same state without conflict.
     */
    @Test fun acceptRemote_whenLocalSyncedAndSameTimestamp() {
        // >= means a re-pull of the same version is harmless.
        assertTrue(shouldAcceptRemote(localNote(100, SyncState.SYNCED), remote(100)))
    }

    /**
     * Case: Local copy is synced but somehow has a newer timestamp than what the server sent.
     * Expected: Reject the remote version to avoid rolling back to an older state.
     */
    @Test fun rejectRemote_whenLocalSyncedButNewer() {
        assertFalse(shouldAcceptRemote(localNote(300, SyncState.SYNCED), remote(200)))
    }

    /**
     * Case: The local user has edited the note (PENDING) and hasn't pushed yet.
     * Expected: Reject any remote version regardless of timestamp. The local change
     * must be pushed first so the server can handle the "Last-Write-Wins" logic globally.
     */
    @Test fun rejectRemote_whenLocalHasUnpushedEdit() {
        // A PENDING local edit always wins here — it will be pushed; the server settles it.
        assertFalse(shouldAcceptRemote(localNote(100, SyncState.PENDING), remote(999)))
    }

    // --- Converters ----------------------------------------------------------

    /**
     * Verifies that the Room TypeConverter for SyncState correctly handles
     * round-trip conversions (Enum -> String -> Enum) and provides a safe
     * default for unknown values.
     */
    @Test fun syncState_roundTripsByName() {
        val c = Converters()
        SyncState.entries.forEach { s -> assertEquals(s, c.toSyncState(c.fromSyncState(s))) }
        assertEquals(SyncState.SYNCED, c.toSyncState("NONSENSE")) // unknown -> safe default
    }

    // --- FakeCloudApi --------------------------------------------------------

    /**
     * Integration test for the FakeCloudApi.
     * Verifies that pushing a note makes it available for subsequent pull requests.
     */
    @Test fun fakeCloud_pushThenPull_returnsTheRow() = runTest {
        val cloud = FakeCloudApi()
        cloud.push(NoteDto(id = "x", title = "hi", body = "there", updatedAt = 1_000))
        val pulled = cloud.pullSince(0)
        assertTrue("pushed row should come back on pull", pulled.any { it.id == "x" })
    }

    /**
     * Verifies that the FakeCloudApi correctly implements Last-Write-Wins.
     * If a client tries to push a "stale" version (older timestamp), the server
     * should reject the update and return the current (newer) version instead.
     */
    @Test fun fakeCloud_push_isLastWriteWins() = runTest {
        val cloud = FakeCloudApi()
        cloud.push(NoteDto(id = "x", title = "new", body = "b", updatedAt = 200))
        val afterOlder = cloud.push(NoteDto(id = "x", title = "stale", body = "b", updatedAt = 100))
        // The older write is rejected; the server keeps (and returns) the newer one.
        assertEquals(200, afterOlder.updatedAt)
        assertEquals("new", afterOlder.title)
    }

    /**
     * Verifies the cursor-based synchronization logic.
     * Pulling should only return items modified AFTER the provided timestamp.
     */
    @Test fun fakeCloud_pullSince_filtersByCursor() = runTest {
        val cloud = FakeCloudApi()
        cloud.push(NoteDto(id = "x", title = "t", body = "b", updatedAt = 5_000))
        // Nothing is newer than a far-future cursor.
        assertTrue(cloud.pullSince(since = 9_000).none { it.id == "x" })
        // Everything pushed is newer than 0.
        assertTrue(cloud.pullSince(since = 0).any { it.id == "x" })
    }
}
