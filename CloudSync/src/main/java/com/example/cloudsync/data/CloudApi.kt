// =============================================================================
// CloudApi.kt  —  the CLOUD transport: one abstraction, REAL vs FAKE
//
// CONCEPT THIS FILE TEACHES: the sync engine should not care WHERE the cloud is. It
// talks to a tiny [CloudApi] with two operations:
//   • pullSince(since)  — remote rows changed AFTER a cursor (what to merge into Room)
//   • push(note)        — create/update one row; returns the server's authoritative copy
//
// Behind the interface sits either:
//   • RetrofitCloudApi — a real REST backend over HTTP (needs INTERNET + a server), or
//   • FakeCloudApi     — an in-memory "server" that imitates latency, last-write-wins, and
//     even another device's edits, with NO network — so the app and tests run offline.
//
// provideCloudApi(useFake = ...) is THE SWITCH (same pattern as NetworkParsing /
// WebSocketLive). Default FAKE so the project builds, runs, and tests everywhere.
// =============================================================================
package com.example.cloudsync.data

import kotlinx.coroutines.delay
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

/**
 * CloudApi — the abstraction the repository/SyncWorker depend on. It hides whether a real
 * REST backend or an in-memory fake is behind it. Both methods are `suspend` and may THROW
 * (no network, server error) — the SyncWorker catches that and retries with backoff.
 */
interface CloudApi {
    /** Remote rows whose updatedAt is greater than [since] (oldest-first). */
    suspend fun pullSince(since: Long): List<NoteDto>

    /** Create/update one row in the cloud; returns the server's authoritative copy. */
    suspend fun push(note: NoteDto): NoteDto
}

// ===========================================================================
// REAL IMPLEMENTATION  —  a REST backend over Retrofit
// ===========================================================================

/** The Retrofit description of a sync backend. (Illustrative — point baseUrl at your server.) */
private interface NoteService {
    @GET("notes")
    suspend fun pull(@Query("since") since: Long): List<NoteDto>

    @POST("notes")
    suspend fun push(@Body note: NoteDto): NoteDto
}

/**
 * RetrofitCloudApi — talks to a real REST backend. Requires the INTERNET permission and a
 * live server exposing GET/POST /notes. Swap the baseUrl for your own backend.
 */
class RetrofitCloudApi(baseUrl: String = "https://example.com/api/") : CloudApi {
    private val json = Json { ignoreUnknownKeys = true }   // tolerate new server fields
    private val service: NoteService = Retrofit.Builder()
        .baseUrl(baseUrl)                                   // MUST end in "/"
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()
        .create(NoteService::class.java)

    override suspend fun pullSince(since: Long): List<NoteDto> = service.pull(since)
    override suspend fun push(note: NoteDto): NoteDto = service.push(note)
}

// ===========================================================================
// FAKE IMPLEMENTATION  —  an in-memory "server", offline & deterministic
// ===========================================================================

/**
 * FakeCloudApi — a pretend cloud that lives in memory for the app session. It imitates a
 * real backend closely enough to exercise the whole sync engine offline:
 *   • a server-side store keyed by id,
 *   • network latency via delay(),
 *   • last-write-wins on push (older writes are rejected), and
 *   • [simulateRemoteEdit] to mimic ANOTHER device adding a note, so a pull has something new.
 */
class FakeCloudApi : CloudApi {

    // The fake SERVER's store. (A real server persists this in a database; the fake keeps it
    // in memory for the app's lifetime — long enough to demonstrate push → pull round trips.)
    private val server = linkedMapOf<String, NoteDto>()

    init {
        // Seed one row so a brand-new install pulls a welcome note on first sync.
        val seededAt = System.currentTimeMillis() - 1_000
        val id = "seed-welcome"
        server[id] = NoteDto(id, "Welcome to CloudSync", "This note came FROM the cloud on first sync.", seededAt)
    }

    override suspend fun pullSince(since: Long): List<NoteDto> {
        delay(700)                                          // imitate network latency
        return server.values.filter { it.updatedAt > since }.sortedBy { it.updatedAt }
    }

    override suspend fun push(note: NoteDto): NoteDto {
        delay(500)                                          // imitate network latency
        val existing = server[note.id]
        // The server also resolves conflicts last-write-wins: only accept a write that is
        // at least as new as what it already has (or a brand-new id).
        if (existing == null || note.updatedAt >= existing.updatedAt) server[note.id] = note
        return server.getValue(note.id)                     // the server's authoritative copy
    }

    /** Teaching hook: pretend ANOTHER device added a note to the cloud. The next pull sees it. */
    fun simulateRemoteEdit() {
        val now = System.currentTimeMillis()
        val id = "remote-$now"
        server[id] = NoteDto(id, "Note from another device", "Added remotely at $now — pulled into Room on sync.", now)
    }
}

// ===========================================================================
// THE SWITCH  —  pick REAL (network) or FAKE (offline) — fake is a process singleton
// ===========================================================================

// The fake's in-memory server must OUTLIVE individual sync runs, so we hand out ONE shared
// instance. (The real impl is cheap and stateless enough to build fresh.)
private val fakeCloud: FakeCloudApi by lazy { FakeCloudApi() }

/**
 * Factory that returns the cloud the app should use.
 *
 * @param useFake when TRUE (the default), returns the offline [FakeCloudApi] so the project
 *   builds, runs, and tests with NO network. Flip to FALSE to talk to a real [RetrofitCloudApi].
 *
 *   ┌──────────────────────────────────────────────────────────────────────────┐
 *   │  STUDENTS: change this single argument to toggle between offline and live. │
 *   └──────────────────────────────────────────────────────────────────────────┘
 */
fun provideCloudApi(useFake: Boolean = true): CloudApi =
    if (useFake) fakeCloud else RetrofitCloudApi()
