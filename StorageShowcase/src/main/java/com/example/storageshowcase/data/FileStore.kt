// =============================================================================
// FileStore.kt  —  INTERNAL FILE storage (blobs, not rows or key/value)
//
// CONCEPT: for free-form bytes/text, write to internal app storage.
//   • filesDir  — persistent, private, no permission, encrypted on Android 10+;
//                 removed on uninstall.
//   • cacheDir  — re-creatable scratch; the system may evict it under low storage
//                 and the user can clear it anytime, so existence-check before reading;
//                 never included in Auto Backup.
// UNLIKE Room/DataStore, raw java.io file calls are blocking and are NOT auto-moved
// off the main thread — the ViewModel wraps them in withContext(Dispatchers.IO).
// =============================================================================
package com.example.storageshowcase.data

import android.content.Context
import java.io.File

/** Snapshot of what's on disk, surfaced to the UI. */
data class FileInfo(
    val path: String,
    val scratchBytes: Long,
    val cacheBytes: Long,
)

class FileStore(context: Context) {

    private val app = context.applicationContext
    private val scratchFile: File get() = File(app.filesDir, "scratch.txt")

    /** Read the persistent scratch note (empty if never written). */
    fun readScratch(): String = if (scratchFile.exists()) scratchFile.readText() else ""

    /** Persist the scratch note to filesDir (survives restart, gone on uninstall). */
    fun writeScratch(text: String) {
        scratchFile.writeText(text)
    }

    /** Write a throwaway cache file the system is free to evict. */
    fun writeCacheBlob(): File =
        File.createTempFile("blob", ".tmp", app.cacheDir).apply { writeText("cacheable scratch data") }

    /** Clear all cache files (what "Clear cache" in system settings does). */
    fun clearCache() {
        app.cacheDir.listFiles()?.forEach { it.delete() }
    }

    fun info(): FileInfo = FileInfo(
        path = scratchFile.absolutePath,
        scratchBytes = if (scratchFile.exists()) scratchFile.length() else 0L,
        cacheBytes = app.cacheDir.listFiles()?.sumOf { it.length() } ?: 0L,
    )
}
