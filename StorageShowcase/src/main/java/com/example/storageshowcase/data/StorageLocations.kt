// =============================================================================
// StorageLocations.kt  —  the EXACT on-disk file each store writes to
//
// CONCEPT: every store in this app persists to the app's PRIVATE INTERNAL storage
// under /data/data/<package>/ (no permissions, encrypted on Android 10+, and wiped
// only on uninstall). This object resolves the real absolute path for each one so
// the UI can show learners precisely WHERE their data is being saved.
//
//   Room (notes + categories)   ->  databases/storage.db
//   Preferences DataStore       ->  files/datastore/settings.preferences_pb
//   Typed DataStore (profile)   ->  files/datastore/user_profile.json
//   Internal file (scratch)     ->  files/scratch.txt
//   Cache blobs                 ->  cache/
// =============================================================================
package com.example.storageshowcase.data

import android.content.Context
import java.io.File

/** Resolved absolute paths for every store, all under app-private internal storage. */
data class StoragePaths(
    val roomDb: String,
    val preferences: String,
    val profile: String,
    val scratchFile: String,
    val cacheDir: String,
) {
    companion object {
        // DataStore (both flavors) keeps its files in a "datastore" subdirectory of filesDir.
        private fun dataStoreFile(c: Context, name: String) =
            File(c.filesDir, "datastore/$name").absolutePath

        fun of(context: Context): StoragePaths {
            val c = context.applicationContext
            return StoragePaths(
                // Room asks the framework for the DB file: /data/data/<pkg>/databases/storage.db
                roomDb = c.getDatabasePath("storage.db").absolutePath,
                // Preferences DataStore named "settings" -> files/datastore/settings.preferences_pb
                preferences = dataStoreFile(c, "settings.preferences_pb"),
                // Typed DataStore created with dataStore(fileName = "user_profile.json")
                profile = dataStoreFile(c, "user_profile.json"),
                // Plain internal file written via filesDir
                scratchFile = File(c.filesDir, "scratch.txt").absolutePath,
                // Evictable cache directory
                cacheDir = c.cacheDir.absolutePath,
            )
        }
    }
}
