// =============================================================================
// data/storage/SettingsStore.kt  —  on-device SETTINGS (small key→value prefs)
//
// Two KINDS of data want two KINDS of storage — this is the split the storage
// unit teaches, and the capstone now shows both at once:
//
//   • The LIST of places  → structured app DATA, possibly large → DestinationStore
//                            (LocalDestinationStore writes it as JSON). Loading a
//                            whole list can be slow, so those calls are `suspend`
//                            and run off the main thread.
//   • A single SETTING    → one small flag (here: dark theme on/off) → SettingsStore.
//                            A lone boolean is tiny, so we read it SYNCHRONOUSLY at
//                            startup — no coroutine needed. (Real apps reach for
//                            Jetpack DataStore here; the idea — "a small named
//                            preference that outlives the app" — is identical.)
//
// Why a SEPARATE store from DestinationStore? Settings and app data have different
// lifetimes and shapes; keeping them apart means clearing/resetting the LIST never
// touches the user's THEME choice, and vice-versa.
// =============================================================================
package com.example.exampleproject.data.storage

import android.content.Context                              // needed to open the device's SharedPreferences
import androidx.core.content.edit                          // small KTX helper: prefs.edit { ... } with auto-apply

/**
 * Persists simple app settings on this device via SharedPreferences.
 *
 * Reads/writes are SYNCHRONOUS on purpose: a single boolean is cheap enough to
 * read on the main thread at startup. (Contrast with [DestinationStore], whose
 * whole-list save/load is `suspend` and runs off the main thread.)
 *
 * @param context any Context (the Activity); used to open the app's preferences.
 */
class SettingsStore(context: Context) {

    // A private key→value file, separate from the one the list is stored in.
    private val prefs = context.getSharedPreferences("wanderlist_settings", Context.MODE_PRIVATE)

    /**
     * The app-wide dark-theme flag. Reading returns the saved value (false the very
     * first time, before the user has ever toggled it); assigning persists the new
     * value immediately so it's restored on the next cold start.
     */
    var darkTheme: Boolean
        get() = prefs.getBoolean(KEY_DARK_THEME, false)     // default: light theme on first run
        set(value) = prefs.edit { putBoolean(KEY_DARK_THEME, value) } // edit { } applies asynchronously

    private companion object {
        const val KEY_DARK_THEME = "dark_theme"             // the single key our flag lives under
    }
}
