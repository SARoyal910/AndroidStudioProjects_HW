// =============================================================================
// CloudApi.kt  —  the CLOUD transport: one abstraction, REAL (Supabase) vs FAKE
//
// CONCEPT THIS FILE TEACHES: the sync engine should not care WHERE the cloud is. It
// talks to a tiny [CloudApi] with two operations:
//   • pullSince(since)  — remote rows changed AFTER a cursor (what to merge into Room)
//   • push(note)        — create/update one row; returns the server's authoritative copy
//
// Behind the interface sits either:
//   • SupabaseCloudApi — a REAL cloud database: Supabase, i.e. hosted Postgres reached over
//     its auto-generated REST API (needs INTERNET + a Supabase project), or
//   • FakeCloudApi     — an in-memory "server" that imitates latency, last-write-wins, and
//     even another device's edits, with NO network — so the app and tests run offline.
//
// provideCloudApi(useFake = ...) is THE SWITCH (the same pattern CloudSync / NetworkParsing
// use). Default FAKE, so the project builds, runs, and unit-tests with NO Supabase setup.
// =============================================================================
package com.example.supabasesync.data

import com.example.supabasesync.BuildConfig
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.coroutines.delay

/**
 * CloudApi — the abstraction the repository/SyncWorker depend on. It hides whether real
 * Supabase or an in-memory fake is behind it. Both methods are `suspend` and may THROW
 * (no network, RLS/permission denied) — the SyncWorker catches that and retries with backoff.
 */
interface CloudApi {
    /** Remote rows whose updatedAt is greater than [since] (oldest-first). */
    suspend fun pullSince(since: Long): List<NoteDto>

    /** Create/update one row in the cloud; returns the server's authoritative copy. */
    suspend fun push(note: NoteDto): NoteDto
}

// ===========================================================================
// REAL IMPLEMENTATION  —  Supabase (hosted Postgres)
//
// Supabase is a hosted Postgres database with an auto-generated REST API (PostgREST). The
// supabase-kt client turns that into typed Kotlin calls against a TABLE ("notes"). The two
// sync operations map directly onto SQL:
//   • pull  = SELECT * FROM notes WHERE updated_at > :since ORDER BY updated_at
//   • push  = INSERT ... ON CONFLICT (id) DO UPDATE  (that's exactly what upsert() is)
// (Unlike Firestore, Supabase has NO built-in local cache — which is precisely why we pair it
//  with Room here: Room is the offline single source of truth, Supabase is the remote.)
// ===========================================================================

// ┌────────────────────────────────────────────────────────────────────────────────────┐
// │  STUDENTS: to go live, put YOUR Supabase project's two values in local.properties     │
// │  (git-ignored — they never enter committed source). Add these two lines:              │
// │      supabase.url=https://<ref>.supabase.co                                            │
// │      supabase.anonKey=<the public "anon" key>                                          │
// │  Find both in the Supabase dashboard ▸ Project Settings ▸ Data API (or "API"). Gradle  │
// │  reads local.properties and exposes them as BuildConfig.SUPABASE_URL / ANON_KEY (see   │
// │  the secret()/buildConfigField wiring in build.gradle.kts). You also need a `notes`    │
// │  table — the SQL to create it is in the README. With NO keys configured, the app falls │
// │  back to the offline Fake cloud automatically (provideCloudApi auto-detects blanks).   │
// └────────────────────────────────────────────────────────────────────────────────────┘

/**
 * SupabaseCloudApi — talks to a real Supabase `notes` table. We build ONE SupabaseClient with the
 * Postgrest plugin installed; supabase-kt sends HTTP through the Ktor engine on the classpath.
 * Requires the INTERNET permission (already declared).
 *
 * HTTP transport note: supabase-kt does NOT bundle its own HTTP engine — you supply one. This
 * project uses `ktor-client-okhttp` (OkHttp under the hood, declared in build.gradle.kts). The
 * Ktor engine is discovered automatically from the classpath; you don't wire it up manually.
 */
class SupabaseCloudApi(
    supabaseUrl: String = BuildConfig.SUPABASE_URL,
    supabaseKey: String = BuildConfig.SUPABASE_ANON_KEY,
) : CloudApi {

    // createSupabaseClient(url, key) { … } — factory that builds the single shared client.
    //   • supabaseUrl  — the Project URL from Supabase dashboard ▸ Project Settings ▸ Data API
    //                    (looks like "https://<ref>.supabase.co"). Every HTTP call goes here.
    //   • supabaseKey  — the public "anon" key from the same page. It identifies the app but does
    //                    NOT grant access on its own; what actually controls permissions is RLS
    //                    (Row-Level Security policies in Postgres). The anon key is safe to ship
    //                    in client code precisely because RLS is the real gate.
    //   • install(Postgrest) — registers the Postgrest plugin, which is the module that exposes
    //                    from("tableName").select{}, .upsert(), etc. Without this line, calls like
    //                    client.from("notes") would throw at runtime.
    private val client = createSupabaseClient(supabaseUrl, supabaseKey) {
        install(Postgrest)                                  // enable table CRUD (the PostgREST API)
    }

    // pullSince — maps to: SELECT * FROM notes WHERE updated_at > since ORDER BY updated_at ASC
    //
    // client.from("notes")
    //   Returns a PostgrestQueryBuilder scoped to the "notes" table. No query has been sent yet;
    //   this is just a reference that later builder calls attach to.
    //
    // .select { … }
    //   Adds a SELECT clause and opens a DSL block where you can narrow the query with filters,
    //   ordering, limits, etc. Without the block it would select ALL rows (SELECT * with no WHERE).
    //
    // filter { gt("updated_at", since) }
    //   The filter{} block adds WHERE predicates. gt(column, value) is "greater than" —
    //   it appends "WHERE updated_at > :since". The column name here is the Postgres snake_case
    //   name ("updated_at"), NOT the Kotlin property name ("updatedAt").
    //
    // order("updated_at", Order.ASCENDING)
    //   Appends ORDER BY updated_at ASC so the oldest change comes first. The sync engine
    //   advances its cursor to the highest updatedAt it sees, so receiving rows oldest-first
    //   means the cursor stays correct even if the network drops mid-batch.
    //
    // .decodeList<NoteDto>()
    //   Executes the built query (fires the HTTP GET), receives the JSON array that PostgREST
    //   returns, and deserializes it into a List<NoteDto> using kotlinx.serialization. This works
    //   because NoteDto is annotated @Serializable and the @SerialName("updated_at") mapping
    //   tells the serializer which JSON key to read into the `updatedAt` property.
    override suspend fun pullSince(since: Long): List<NoteDto> =
        client.from("notes").select {
            filter { gt("updated_at", since) }
            order("updated_at", Order.ASCENDING)
        }.decodeList<NoteDto>()

    // push — maps to: INSERT INTO notes … ON CONFLICT (id) DO UPDATE SET …
    //
    // client.from("notes")
    //   Same table reference as above — scoped to the "notes" table.
    //
    // .upsert(note) { select() }
    //   Sends the NoteDto as JSON in the request body. PostgREST translates this to:
    //   INSERT INTO notes (id, title, body, updated_at, deleted) VALUES (…)
    //   ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, …
    //   — i.e. if a row with this `id` already exists, UPDATE it; otherwise INSERT a new one.
    //   This single operation handles both "create a new note" and "edit an existing note".
    //   The { select() } option appends "Prefer: return=representation" in the HTTP header,
    //   telling Postgres to RETURN the stored row in the response body. Without it the response
    //   body would be empty and we'd have nothing to decode.
    //
    // .decodeSingle<NoteDto>()
    //   Executes the upsert, receives the single JSON row that Postgres returned, and
    //   deserializes it into one NoteDto. This is the server's authoritative copy — if Postgres
    //   modified anything (e.g. a trigger updated a timestamp), that change is reflected here.
    override suspend fun push(note: NoteDto): NoteDto =
        client.from("notes").upsert(note) { select() }.decodeSingle<NoteDto>()
}

// ===========================================================================
// FAKE IMPLEMENTATION  —  an in-memory "server", offline & deterministic
// (identical to CloudSync's: it lets the whole sync engine run with no Supabase project)
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
        server[id] = NoteDto(id, "Welcome to SupabaseSync", "This note came FROM the cloud on first sync.", seededAt)
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
// THE SWITCH  —  pick REAL (Supabase) or FAKE (offline) — fake is a process singleton
// ===========================================================================

// The fake's in-memory server must OUTLIVE individual sync runs, so we hand out ONE shared
// instance. (The real impl is cheap and stateless enough to build fresh.)
private val fakeCloud: FakeCloudApi by lazy { FakeCloudApi() }

/**
 * Factory that returns the cloud the app should use — it AUTO-DETECTS which one.
 *
 * @param useFake defaults to "are the Supabase keys missing?". When the keys ARE configured in
 *   local.properties (surfaced via BuildConfig.SUPABASE_URL / SUPABASE_ANON_KEY), this is FALSE
 *   and you talk to the real [SupabaseCloudApi]. With NO keys, it is TRUE and you get the offline
 *   [FakeCloudApi] so the project still builds, runs, and tests with NO network. There is no flag
 *   to flip — add your keys to local.properties to go live, remove them to go back offline.
 */
fun provideCloudApi(
    useFake: Boolean = BuildConfig.SUPABASE_URL.isBlank() || BuildConfig.SUPABASE_ANON_KEY.isBlank(),
): CloudApi =
    if (useFake) fakeCloud else SupabaseCloudApi()
