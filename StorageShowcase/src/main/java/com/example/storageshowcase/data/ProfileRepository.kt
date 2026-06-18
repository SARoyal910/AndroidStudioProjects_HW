// =============================================================================
// ProfileRepository.kt  —  TYPED DataStore (a structured object with a schema)
//
// CONCEPT: when settings are really ONE typed object, a typed DataStore beats a bag
// of loose keys. You supply a Serializer<T>; here we serialize to JSON with
// kotlinx.serialization (Protocol Buffers is the other common choice). Reads are a
// Flow<UserProfile>; writes are the suspend, transactional updateData { }.
// =============================================================================
package com.example.storageshowcase.data

import android.content.Context
import androidx.datastore.core.CorruptionException
import androidx.datastore.core.DataStore
import androidx.datastore.core.Serializer
import androidx.datastore.dataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import java.io.InputStream
import java.io.OutputStream

/** The whole typed profile object — type-safe, with real defaults. */
@kotlinx.serialization.Serializable
data class UserProfile(
    val displayName: String = "Guest",
    val accentSeed: Int = 0,
    val notesCreated: Int = 0,
)

/** Encodes/decodes [UserProfile] as JSON. CorruptionException signals an unreadable file. */
object UserProfileSerializer : Serializer<UserProfile> {
    override val defaultValue: UserProfile = UserProfile()

    override suspend fun readFrom(input: InputStream): UserProfile =
        try {
            Json.decodeFromString(UserProfile.serializer(), input.readBytes().decodeToString())
        } catch (e: SerializationException) {
            throw CorruptionException("Cannot read UserProfile JSON.", e)
        }

    override suspend fun writeTo(t: UserProfile, output: OutputStream) {
        output.write(Json.encodeToString(UserProfile.serializer(), t).encodeToByteArray())
    }
}

// One typed DataStore for the whole app, file-scoped (single instance per file).
private val Context.profileDataStore: DataStore<UserProfile> by dataStore(
    fileName = "user_profile.json",
    serializer = UserProfileSerializer,
)

class ProfileRepository(context: Context) {

    private val dataStore = context.applicationContext.profileDataStore

    /** Reactive, type-safe read of the whole object. */
    val profile: Flow<UserProfile> = dataStore.data

    suspend fun setDisplayName(name: String) {
        dataStore.updateData { it.copy(displayName = name.ifBlank { "Guest" }) }
    }

    suspend fun setAccent(seed: Int) {
        dataStore.updateData { it.copy(accentSeed = seed) }
    }

    suspend fun incrementNotesCreated() {
        dataStore.updateData { it.copy(notesCreated = it.notesCreated + 1) }
    }
}
