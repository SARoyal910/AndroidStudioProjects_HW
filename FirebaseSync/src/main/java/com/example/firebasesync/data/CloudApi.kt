// =============================================================================
// CloudApi.kt  —  the CLOUD transport: one abstraction, REAL (Firestore) vs FAKE
//
// CONCEPT THIS FILE TEACHES: the sync engine should not care WHERE the cloud is. It
// talks to a tiny [CloudApi] with two operations:
//   • pullSince(since)  — remote rows changed AFTER a cursor (what to merge into Room)
//   • push(note)        — create/update one row; returns the server's authoritative copy
//
// Behind the interface sits either:
//   • FirestoreCloudApi — a REAL cloud database: Google Cloud Firestore (needs INTERNET +
//     a Firebase project), or
//   • FakeCloudApi      — an in-memory "server" that imitates latency, last-write-wins, and
//     even another device's edits, with NO network — so the app and tests run offline.
//
// provideCloudApi(useFake = ...) is THE SWITCH (the same pattern CloudSync / NetworkParsing
// use). It AUTO-DETECTS: real Firestore when keys are configured in local.properties, else the
// offline FAKE — so the project builds, runs, and unit-tests with NO Firebase setup.
// =============================================================================
package com.example.firebasesync.data

import android.content.Context
import com.example.firebasesync.BuildConfig
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.delay
import kotlinx.coroutines.tasks.await   // turns a Firebase Task<T> into a suspend-friendly await()

/**
 * CloudApi — the abstraction the repository/SyncWorker depend on. It hides whether real
 * Firestore or an in-memory fake is behind it. Both methods are `suspend` and may THROW
 * (no network, permission denied) — the SyncWorker catches that and retries with backoff.
 */
interface CloudApi {
    /** Remote rows whose updatedAt is greater than [since] (oldest-first). */
    suspend fun pullSince(since: Long): List<NoteDto>

    /** Create/update one row in the cloud; returns the server's authoritative copy. */
    suspend fun push(note: NoteDto): NoteDto
}

// ===========================================================================
// REAL IMPLEMENTATION  —  Google Cloud Firestore
//
// Firestore is a hosted NoSQL document database. We keep every note in ONE collection,
// "notes"; each note is a DOCUMENT whose id is our client-generated note id. That makes the
// two sync operations tiny:
//   • push  = set() the document at notes/{id}
//   • pull  = a range query on the "updatedAt" field
// (Firestore ALSO caches locally on its own. In THIS project Room is the single source of
//  truth and Firestore is purely the remote — see NoteRepository — so the offline-first
//  mechanics stay explicit and identical to CloudSync.)
// ===========================================================================

// ┌────────────────────────────────────────────────────────────────────────────────────┐
// │  STUDENTS: to go live, put YOUR Firebase project's three values in local.properties   │
// │  (git-ignored — they never land in committed source):                                 │
// │      firebase.projectId=your-project-id                                                │
// │      firebase.appId=1:NNN:android:HEX                                                  │
// │      firebase.apiKey=AIza...                                                            │
// │  build.gradle.kts reads them and generates BuildConfig.FIREBASE_PROJECT_ID / _APP_ID / │
// │  _API_KEY (see the buildConfigField lines there). With NO keys configured, those       │
// │  constants are "" and the app runs fully offline against the FakeCloudApi below —       │
// │  automatically (provideCloudApi picks the Fake when the API key is blank).             │
// │  Find the values in the Firebase console ▸ Project settings ▸ "Your apps" (or the      │
// │  google-services.json you download): the project id, the Android app's App ID, and     │
// │  the Web API key.                                                                       │
// └────────────────────────────────────────────────────────────────────────────────────┘

/**
 * FirestoreCloudApi — talks to a real Firestore database. We initialise Firebase IN CODE from
 * the generated BuildConfig credentials (fed in from local.properties, so the project needs no
 * google-services.json / Gradle plugin to build), then read/write the "notes" collection.
 * Requires the INTERNET permission (already declared).
 *
 * Design choice — in-code initialisation:
 *   Rather than dropping a google-services.json into the module and applying the
 *   com.google.gms.google-services Gradle plugin, we hand the three credentials directly to
 *   FirebaseOptions.Builder(). This means the project compiles and runs with zero extra files;
 *   students drop their own values into local.properties and go live with no source edit.
 *   The production-standard approach (google-services.json + plugin) is equivalent — both write
 *   the same three values into FirebaseOptions under the hood.
 *
 * Logcat note:
 *   On a fresh install you may see "FirebaseApp initialization unsuccessful" from Firebase's own
 *   auto-init ContentProvider. That warning fires before our code runs; it is harmless — we
 *   initialise Firebase manually below and the real-mode sync works fine.
 */
class FirestoreCloudApi(context: Context) : CloudApi {

    // -------------------------------------------------------------------------
    // Step 1: build the in-process FirebaseApp from the three BuildConfig credentials
    // (generated from local.properties by build.gradle.kts).
    //
    // FirebaseOptions.Builder() is the programmatic equivalent of google-services.json.
    // It tells the Firebase SDK which project to connect to:
    //   • setProjectId()      — the Cloud project ("your-project-id").  Used to route API
    //                           calls to the correct Firestore instance.
    //   • setApplicationId()  — the Android App ID inside that project (format:
    //                           1:PROJECT_NUMBER:android:HEX_HASH). Firestore uses this to
    //                           identify which registered app is making the request.
    //   • setApiKey()         — the Web API key from Firebase Project Settings. Used to
    //                           authenticate SDK calls to Google's backend.
    //   • .build()            — produces the immutable FirebaseOptions value object.
    //
    // FirebaseApp.getApps(context) returns every FirebaseApp already registered in this
    // process. We call firstOrNull() because initializeApp() would throw if called a second
    // time with the same options — the FirebaseApp is a process-wide singleton.
    //
    // FirebaseApp.initializeApp(context, options) registers that singleton the first time;
    // every call after that just returns the existing app via getApps().
    //
    // FirebaseFirestore.getInstance(app) returns the Firestore client bound to this app.
    // It is lazy-initialised by the SDK — the network connection is only opened when the
    // first actual read or write is made.
    // -------------------------------------------------------------------------
    private val db: FirebaseFirestore = run {
        val app: FirebaseApp = FirebaseApp.getApps(context).firstOrNull()
            ?: FirebaseApp.initializeApp(
                context,
                FirebaseOptions.Builder()
                    .setProjectId(BuildConfig.FIREBASE_PROJECT_ID)   // which Cloud project to use
                    .setApplicationId(BuildConfig.FIREBASE_APP_ID)   // which Android app within that project
                    .setApiKey(BuildConfig.FIREBASE_API_KEY)          // API key for SDK authentication
                    .build(),                             // produces the immutable FirebaseOptions
            )
        FirebaseFirestore.getInstance(app)               // the Firestore client handle for this app
    }

    // -------------------------------------------------------------------------
    // Step 2: get a reference to the "notes" collection.
    //
    // db.collection("notes") returns a CollectionReference — a lightweight object that
    // represents the top-level "notes" collection in Firestore.  Nothing hits the network
    // here; this is just a path descriptor.  Because it is a `get` property, a fresh
    // reference is returned on each access (cheap — no allocation cost worth worrying about).
    // -------------------------------------------------------------------------
    /** A CollectionReference pointing at "notes"; each document's id IS the note's UUID. */
    private val notes get() = db.collection("notes")

    override suspend fun pullSince(since: Long): List<NoteDto> {
        // -------------------------------------------------------------------------
        // Building a filtered, ordered Query:
        //
        // .whereGreaterThan("updatedAt", since)
        //     Adds a range filter: only return documents where the "updatedAt" field value
        //     is strictly greater than `since` (our local pull cursor — the epoch-millis of
        //     the newest note we already have in Room).  Field names are strings and must
        //     match the property names on NoteDto exactly.
        //
        // .orderBy("updatedAt", Query.Direction.ASCENDING)
        //     Sorts results oldest-first so we process them in chronological order.
        //     NOTE: Firestore requires orderBy() on the same field used in a range filter
        //     (whereGreaterThan).  When the range filter AND the orderBy target the SAME
        //     field, Firestore handles it with a single-field index (auto-created) — no
        //     composite index is needed.
        //
        // .get()
        //     Executes the query against the Firestore backend and returns a
        //     Task<QuerySnapshot>.  Task is the Play-services async type — NOT a Kotlin
        //     coroutine; it is a callback-based future.
        //
        // .await()
        //     From `kotlinx-coroutines-play-services` (the bridge library in build.gradle.kts).
        //     It suspends the current coroutine until the Task completes (or throws an
        //     Exception if the network fails or Firestore returns an error).  This is what
        //     lets us write sequential-looking code inside a suspend fun instead of nesting
        //     callbacks.  The coroutine resumes on the thread/dispatcher the Task used
        //     internally (usually a background thread in the Firebase executor pool).
        // -------------------------------------------------------------------------
        val snapshot = notes
            .whereGreaterThan("updatedAt", since)          // range filter: only newer documents
            .orderBy("updatedAt", Query.Direction.ASCENDING) // oldest-first; same field → no composite index needed
            .get()                                         // returns Task<QuerySnapshot> (async, not a coroutine)
            .await()                                       // suspend until Task completes (kotlinx-coroutines-play-services)

        // -------------------------------------------------------------------------
        // Deserialising documents into NoteDto objects:
        //
        // snapshot.documents  — a List<DocumentSnapshot>, one per document that matched.
        //
        // it.toObject(NoteDto::class.java)
        //     Firestore's reflective deserialiser.  It calls NoteDto's no-arg constructor
        //     (the one Kotlin generates because EVERY property has a default value) and then
        //     sets each field by matching the document's field names to the property names.
        //     This is WHY NoteDto must give every property a default:
        //         val id: String = ""
        //         val updatedAt: Long = 0L
        //         ...
        //     Without those defaults, Kotlin would not generate a no-arg constructor and
        //     toObject() would throw.  (CloudSync's DTO used @Serializable for JSON; Firestore
        //     uses its own reflection — no annotation is required here.)
        //
        // .mapNotNull { ... }
        //     Drops any document that cannot be deserialised (e.g., missing required field).
        //     The result is a plain List<NoteDto> ready for NoteRepository.sync() to merge
        //     into Room via NoteDto.toEntity().
        // -------------------------------------------------------------------------
        return snapshot.documents.mapNotNull { it.toObject(NoteDto::class.java) }
        // Each DocumentSnapshot → NoteDto via reflection; mapNotNull drops any that fail to map.
        // NoteDto MUST have all-default properties so Firestore can use the no-arg constructor.
    }

    override suspend fun push(note: NoteDto): NoteDto {
        // -------------------------------------------------------------------------
        // Writing a single document:
        //
        // notes.document(note.id)
        //     Returns a DocumentReference at the path "notes/{id}".  Like CollectionReference,
        //     this is just a path handle — no network call yet.  Using the note's own id as
        //     the document id means we never need to ask Firestore to auto-generate an id and
        //     then remember it — the same UUID the phone created offline is the key everywhere.
        //
        // .set(note)
        //     Creates the document if it does not exist, or COMPLETELY OVERWRITES it if it does.
        //     Firestore's set() does not compare timestamps or versions; it always wins.
        //     In a production multi-user app you would use a transaction or security rules for
        //     server-side conflict handling.  Here, the client-side last-write-wins rule in
        //     NoteRepository.shouldAcceptRemote() is sufficient for the demo.
        //     Returns a Task<Void> (the Task resolves when the server confirms the write, or
        //     rejects if there is a network or permission error).
        //
        // .await()
        //     Suspends the coroutine until the Task<Void> completes.  If it throws, the
        //     exception propagates up to NoteRepository.sync(), which marks the row FAILED and
        //     re-throws so WorkManager knows to retry.
        // -------------------------------------------------------------------------
        notes.document(note.id)  // DocumentReference at notes/{id}
            .set(note)           // create-or-overwrite the document; returns Task<Void>
            .await()             // suspend until the server confirms; throws on network/permission error
        return note              // return our copy as the "server's authoritative copy" (set() is unconditional)
    }
}

// ===========================================================================
// FAKE IMPLEMENTATION  —  an in-memory "server", offline & deterministic
// (identical to CloudSync's: it lets the whole sync engine run with no Firebase project)
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
        server[id] = NoteDto(id, "Welcome to FirebaseSync", "This note came FROM the cloud on first sync.", seededAt)
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
// THE SWITCH  —  AUTO-PICK REAL (Firestore) or FAKE (offline) — fake is a process singleton
// ===========================================================================

// The fake's in-memory server must OUTLIVE individual sync runs, so we hand out ONE shared
// instance. (The real impl is cheap enough to build fresh; it needs a Context for Firebase.)
private val fakeCloud: FakeCloudApi by lazy { FakeCloudApi() }

/**
 * Factory that returns the cloud the app should use — chosen AUTOMATICALLY.
 *
 * @param context used only by the real impl to initialise Firebase.
 * @param useFake defaults to whether the Firebase API key is BLANK. With no keys in
 *   local.properties, BuildConfig.FIREBASE_API_KEY is "" → useFake is true → the offline
 *   [FakeCloudApi] (so the project builds, runs, and tests with NO network). Drop real keys
 *   into local.properties and it flips to the real [FirestoreCloudApi] with no source edit.
 *
 *   ┌──────────────────────────────────────────────────────────────────────────┐
 *   │  No manual switch: real Firestore when keys are configured in              │
 *   │  local.properties, otherwise the offline Fake — picked for you.            │
 *   └──────────────────────────────────────────────────────────────────────────┘
 */
fun provideCloudApi(context: Context, useFake: Boolean = BuildConfig.FIREBASE_API_KEY.isBlank()): CloudApi =
    if (useFake) fakeCloud else FirestoreCloudApi(context)
