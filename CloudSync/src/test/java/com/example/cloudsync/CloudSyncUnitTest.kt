// =============================================================================
// CloudSyncUnitTest.kt  —  local JVM tests for the offline-first logic (no device)
//
// Verifies the pure, testable pieces of the concept:
//   1. shouldAcceptRemote — the last-write-wins conflict rule (no Room, no coroutines).
//   2. Converters — the SyncState enum round-trips by name and never crashes.
//   3. FakeCloudApi — push respects last-write-wins; pull returns rows after the cursor.
// =============================================================================
package com.example.cloudsync

import com.example.cloudsync.data.Converters
import com.example.cloudsync.data.FakeCloudApi
import com.example.cloudsync.data.Note
import com.example.cloudsync.data.NoteDto
import com.example.cloudsync.data.SyncState
import com.example.cloudsync.data.shouldAcceptRemote
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class CloudSyncUnitTest {

    private fun localNote(updatedAt: Long, state: SyncState) =
        Note(id = "a", title = "t", body = "b", updatedAt = updatedAt, syncState = state)

    private fun remote(updatedAt: Long) =
        NoteDto(id = "a", title = "t", body = "b", updatedAt = updatedAt)

    // --- shouldAcceptRemote (last-write-wins) --------------------------------

    @Test fun acceptRemote_whenNoLocalCopy() {
        assertTrue(shouldAcceptRemote(local = null, remote = remote(100)))
    }

    @Test fun acceptRemote_whenLocalSyncedAndRemoteNewer() {
        assertTrue(shouldAcceptRemote(localNote(100, SyncState.SYNCED), remote(200)))
    }

    @Test fun acceptRemote_whenLocalSyncedAndSameTimestamp() {
        // >= means a re-pull of the same version is harmless.
        assertTrue(shouldAcceptRemote(localNote(100, SyncState.SYNCED), remote(100)))
    }

    @Test fun rejectRemote_whenLocalSyncedButNewer() {
        assertFalse(shouldAcceptRemote(localNote(300, SyncState.SYNCED), remote(200)))
    }

    @Test fun rejectRemote_whenLocalHasUnpushedEdit() {
        // A PENDING local edit always wins here — it will be pushed; the server settles it.
        assertFalse(shouldAcceptRemote(localNote(100, SyncState.PENDING), remote(999)))
    }

    // --- Converters ----------------------------------------------------------

    @Test fun syncState_roundTripsByName() {
        val c = Converters()
        SyncState.entries.forEach { s -> assertEquals(s, c.toSyncState(c.fromSyncState(s))) }
        assertEquals(SyncState.SYNCED, c.toSyncState("NONSENSE")) // unknown -> safe default
    }

    // --- FakeCloudApi --------------------------------------------------------

    @Test fun fakeCloud_pushThenPull_returnsTheRow() = runTest {
        val cloud = FakeCloudApi()
        cloud.push(NoteDto(id = "x", title = "hi", body = "there", updatedAt = 1_000))
        val pulled = cloud.pullSince(0)
        assertTrue("pushed row should come back on pull", pulled.any { it.id == "x" })
    }

    @Test fun fakeCloud_push_isLastWriteWins() = runTest {
        val cloud = FakeCloudApi()
        cloud.push(NoteDto(id = "x", title = "new", body = "b", updatedAt = 200))
        val afterOlder = cloud.push(NoteDto(id = "x", title = "stale", body = "b", updatedAt = 100))
        // The older write is rejected; the server keeps (and returns) the newer one.
        assertEquals(200, afterOlder.updatedAt)
        assertEquals("new", afterOlder.title)
    }

    @Test fun fakeCloud_pullSince_filtersByCursor() = runTest {
        val cloud = FakeCloudApi()
        cloud.push(NoteDto(id = "x", title = "t", body = "b", updatedAt = 5_000))
        // Nothing is newer than a far-future cursor.
        assertTrue(cloud.pullSince(since = 9_000).none { it.id == "x" })
        // Everything pushed is newer than 0.
        assertTrue(cloud.pullSince(since = 0).any { it.id == "x" })
    }
}
