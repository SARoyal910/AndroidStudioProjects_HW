// =============================================================================
// SettingsRepository.kt  —  PREFERENCES DataStore (simple key/value settings)
//
// CONCEPT: the modern replacement for SharedPreferences for a few simple settings.
//   • One DataStore per file, created via the file-scoped preferencesDataStore
//     delegate (a second instance for the same file throws IllegalStateException).
//   • Reads are a reactive Flow (.data.map); writes are a suspend, transactional edit{}.
//   • The sort-order enum is persisted by NAME, never ordinal.
// =============================================================================
package com.example.storageshowcase.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

/** How the notes list is ordered. Persisted by NAME (stable across enum reorders). */
enum class SortOrder { NEWEST_FIRST, TITLE_ASC }

// One app-wide DataStore named "settings", created lazily on first access at file scope.
private val Context.settingsDataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

class SettingsRepository(context: Context) {

    private val dataStore = context.applicationContext.settingsDataStore

    private companion object {
        val KEY_DARK_THEME = booleanPreferencesKey("dark_theme")
        val KEY_SORT_ORDER = stringPreferencesKey("sort_order")
    }

    val darkTheme: Flow<Boolean> = dataStore.data.map { it[KEY_DARK_THEME] ?: false }

    val sortOrder: Flow<SortOrder> = dataStore.data.map { prefs ->
        runCatching { SortOrder.valueOf(prefs[KEY_SORT_ORDER] ?: SortOrder.NEWEST_FIRST.name) }
            .getOrDefault(SortOrder.NEWEST_FIRST)
    }

    suspend fun setDarkTheme(enabled: Boolean) {
        dataStore.edit { it[KEY_DARK_THEME] = enabled }
    }

    suspend fun setSortOrder(order: SortOrder) {
        dataStore.edit { it[KEY_SORT_ORDER] = order.name }   // store NAME, never ordinal
    }
}
