// =============================================================================
// data/storage/CloudDestinationStore.kt  —  CLOUD (remote) storage — SIMULATED
//
// This stands in for a real backend (Firebase, or your own web API) so the app
// can demonstrate the cloud-sync EXPERIENCE — a slow network round-trip, a
// loading spinner, success/error handling — WITHOUT needing real credentials or
// an internet connection. The "server" is just a variable in memory here.
//
// What makes it realistic and educational:
//   • save()/load() are `suspend` and `delay()` to mimic network latency, so the
//     UI must show a spinner and disable buttons while it waits — exactly like
//     real life.
//   • The data crosses an in-memory "boundary", so Push then Pull behaves like a
//     real sync between two devices sharing one cloud document.
//
// ── WHERE THE REAL CODE WOULD GO ──────────────────────────────────────────────
// With Firebase Firestore, save() would be roughly:
//
//     Firebase.firestore.collection("users").document(uid)
//         .set(mapOf("destinations" to destinations))
//         .await()                                    // kotlinx-coroutines-play-services
//
// and load() would read that document back. With a REST API + Retrofit it would be:
//
//     api.putDestinations(destinations)               // suspend fun on a Retrofit interface
//     val list = api.getDestinations()                // returns List<Destination>
//
// In every version the SHAPE is identical to what you see below — which is the
// whole point of hiding it behind the DestinationStore interface.
// =============================================================================
package com.example.exampleproject.data.storage

import com.example.exampleproject.data.Destination
import kotlinx.coroutines.delay                             // suspends (without blocking) to fake network latency

/**
 * A fake cloud backend: one in-memory "document" plus pretend network delay.
 * Push (save) and Pull (load) talk to the same `serverCopy`, so they sync.
 */
class CloudDestinationStore : DestinationStore {

    // The "server": a single stored copy of the list, shared by every call.
    // `null` until something is pushed for the first time. A real backend would
    // store this in Firestore / a database instead of a field in memory.
    private var serverCopy: List<Destination>? = null

    // "Upload" the list. delay() suspends the coroutine for ~1s to imitate the
    // time a real request takes — long enough that the UI must show progress.
    override suspend fun save(destinations: List<Destination>) {
        delay(NETWORK_DELAY_MS)                             // pretend to talk to the server
        // (A real call could throw on no-connection/auth errors — which is why the
        //  UI wraps these in try/catch to show an error message.)
        serverCopy = destinations
    }

    // "Download" the stored list (or null if nothing has been pushed yet).
    override suspend fun load(): List<Destination>? {
        delay(NETWORK_DELAY_MS)
        return serverCopy
    }

    private companion object {
        const val NETWORK_DELAY_MS = 1_000L                 // the fake round-trip time
    }
}
