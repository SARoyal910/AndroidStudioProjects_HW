// =============================================================================
// data/storage/DestinationStore.kt  —  the STORAGE abstraction (repository)
//
// ⏭️ This whole package is a PREVIEW of the next topic: persistence (saving data
// so it survives the app closing). The rest of the app deliberately keeps its
// data in memory (it resets on rotation); this layer shows where "real" storage
// plugs in.
//
// THE KEY IDEA — depend on an INTERFACE, not a specific storage technology.
// The UI calls save()/load() on a DestinationStore and does not care HOW the data
// is stored. That lets us swap implementations without touching any screen:
//
//   DestinationStore (interface)
//        ├── LocalDestinationStore   — saves on THIS device (SharedPreferences)
//        └── CloudDestinationStore   — saves to a remote server (simulated here)
//
// Both functions are `suspend`: saving/loading can be slow (disk or network), so
// it must happen OFF the main thread. `suspend` is Kotlin's way of marking work
// that can pause without blocking the UI — you call it from a coroutine.
// =============================================================================
package com.example.exampleproject.data.storage

import com.example.exampleproject.data.Destination

/**
 * A place Wanderlist data can be saved to and loaded from. Implementations decide
 * WHERE (this device, a server, …); callers only depend on these two functions.
 */
interface DestinationStore {

    /** Persist the whole list, replacing whatever was stored before. */
    suspend fun save(destinations: List<Destination>)

    /**
     * Load the saved list, or `null` if nothing has ever been saved here. (A
     * nullable return is how the caller can tell "empty list" from "never saved".)
     */
    suspend fun load(): List<Destination>?
}
