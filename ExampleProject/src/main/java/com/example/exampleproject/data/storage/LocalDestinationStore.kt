// =============================================================================
// data/storage/LocalDestinationStore.kt  —  LOCAL (on-device) storage
//
// Saves the list to THIS device so it survives the app being closed. We use
// SharedPreferences (a tiny key→value store every Android app gets for free) and
// store the list as a single JSON string.
//
// Why SharedPreferences here? It needs zero extra dependencies, so the build
// stays simple while you learn the idea. In a real app, the MODERN choices are:
//   • Jetpack DataStore  — the recommended replacement for SharedPreferences.
//   • Room               — a full local SQL database, for lots of structured data.
// (Both are shown in the separate RoomAndPreferences demo.) The IMPORTANT part —
// "serialize to text, write it, read it back, deserialize" — is the same for all.
// =============================================================================
package com.example.exampleproject.data.storage

import android.content.Context                              // needed to open the device's SharedPreferences
import com.example.exampleproject.data.Destination
import kotlinx.coroutines.Dispatchers                       // the thread pools coroutines can run on
import kotlinx.coroutines.withContext                       // switch the coroutine to a different dispatcher
import kotlinx.serialization.decodeFromString               // JSON text -> objects
import kotlinx.serialization.encodeToString                 // objects -> JSON text
import kotlinx.serialization.json.Json                      // the JSON format itself

/**
 * Saves/loads the Wanderlist on the local device via SharedPreferences + JSON.
 *
 * @param context any Context (the Activity); used to open the app's preferences.
 */
class LocalDestinationStore(context: Context) : DestinationStore {

    // A private key→value file scoped to this app. MODE_PRIVATE = only this app
    // can read it. We grab it once and reuse it.
    private val prefs = context.getSharedPreferences("wanderlist_prefs", Context.MODE_PRIVATE)

    // Serialize the list to JSON, then write that one string under KEY.
    //
    // withContext(Dispatchers.IO) moves the actual disk write onto a background
    // ("IO") thread, so a slow write never freezes the UI. This is the habit to
    // build: touching disk or network = do it off the main thread.
    override suspend fun save(destinations: List<Destination>) = withContext(Dispatchers.IO) {
        val json = Json.encodeToString(destinations)        // List<Destination> -> "[ {...}, {...} ]"
        prefs.edit().putString(KEY, json).apply()           // apply() writes asynchronously
    }

    // Read the string back and turn it into a List<Destination>. Returns null if
    // nothing was ever saved, or if the saved text can't be parsed (we guard with
    // runCatching so a corrupt value can never crash the app).
    override suspend fun load(): List<Destination>? = withContext(Dispatchers.IO) {
        val json = prefs.getString(KEY, null) ?: return@withContext null
        runCatching { Json.decodeFromString<List<Destination>>(json) }.getOrNull()
    }

    private companion object {
        const val KEY = "destinations_json"                 // the single key our JSON lives under
    }
}
