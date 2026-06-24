# FirebaseSync

A single-screen Jetpack Compose teaching app that syncs a notes list between a **local Room
database** and a **real cloud database — Google Cloud Firestore** — using the **offline-first**
pattern. Room is the **single source of truth** the UI always reads; a repository + a WorkManager
**SyncWorker** push local changes up to Firestore and pull remote changes down. Everything you do
works **offline**: writes are optimistic and queue locally, then push automatically when the
network returns.

> This is the **Firestore-backed sibling of [`CloudSync`](../CloudSync)**. The architecture is
> identical — the only thing that changed is the *real* `CloudApi` implementation, from a generic
> REST stub pointed at nowhere to a concrete **Firestore** client. See also
> [`SupabaseSync`](../SupabaseSync): the same app over Supabase Postgres.
>
> 📖 **Step-by-step walkthrough:** [How a note syncs](how-a-note-syncs.html) — the read path, the
> optimistic write path, the offline queue, the push/pull `SyncWorker`, last-write-wins, and the real
> **Firestore** calls, each as a real block of code (open in a browser).
>
> 🕹️ **Interactive explainer:** [FirebaseSync explorer](firebasesync-explorer.html) — a live
> offline-first simulator (toggle the network, add/edit/delete, watch rows queue as **Pending** and
> drain to **Synced**), a clickable architecture map, a last-write-wins conflict demo, the Real/Fake
> switch, a glossary, and a quiz.
>
> 🔥 **Firebase setup & API guide:** [Firebase setup & API guide](firebase-setup.html) — set up
> Cloud Firestore for this exact project (create the project + register the
> `com.example.firebasesync` app, enable Firestore + write rules, the three credential values), the
> in-code Firebase initialisation explained line by line, the Real/Fake switch, every Firestore API
> this app uses (with the real code) plus a tour of the rest of the Firestore toolbox, and how to
> run, verify, and troubleshoot. Includes a **[Testing section](firebase-setup.html#testing)** covering the existing JVM unit tests, how to run them, how to write new ones, and how to use the Firebase Local Emulator for Firestore integration tests.

## Learning goal

Learn how an Android app combines a **local database (Room)** with a **real cloud database
(Firestore)**, and what happens when the device is **offline**:

- **Single source of truth** — the UI only ever reads Room (`observeVisibleNotes(): Flow`), so it
  renders instantly and works with no connection. The cloud is a sync target, not a UI source.
- **Optimistic writes + an outbox** — a create/edit/delete writes to Room immediately, marked
  `SyncState.PENDING`. The user sees the change at once, online or off.
- **Background sync** — a `SyncWorker` (WorkManager) **pushes** pending rows then **pulls** remote
  changes. A `NetworkType.CONNECTED` constraint means it just **defers** when offline and fires
  when connectivity returns; failures `Result.retry()` with backoff.
- **Sync metadata** — client-generated **UUID ids** (so an offline row has an identity before the
  server sees it), an `updatedAt` clock, a `SyncState`, and a `deleted` **tombstone** (so a delete
  can still be pushed while offline).
- **Conflict resolution** — `shouldAcceptRemote(...)` is a pure **last-write-wins** rule (compare
  `updatedAt`; a pending local edit wins until it's pushed).
- **Real vs Fake switch (automatic)** — a `CloudApi` interface with a **Firestore-backed** `Real`
  impl and an in-memory `Fake` cloud (latency + LWW + a "another device edited" hook). The factory
  auto-detects: keys present in `local.properties` → real Firestore; keys absent → offline Fake.
  No flag to flip, no code to change.

## The cloud: Cloud Firestore

Firestore is a hosted NoSQL **document** database. This app keeps every note in one collection,
`notes`; each note is a document whose **id is our client-generated note id**. That makes the two
sync operations tiny (see `data/CloudApi.kt`):

- **push** = `db.collection("notes").document(id).set(noteDto)`
- **pull** = `notes.whereGreaterThan("updatedAt", since).orderBy("updatedAt").get()`

> Firestore *also* keeps its own on-device cache. In this teaching project we ignore it and treat
> **Room** as the single source of truth, with Firestore purely as the remote — so the offline-first
> mechanics (outbox, tombstones, last-write-wins) are explicit and identical to CloudSync.

## Run it (offline, zero setup)

By default the app runs **offline** against the in-memory `FakeCloudApi`, so it builds, runs, and
unit-tests with **no Firebase project and no network**.

```bash
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
  ./gradlew :compileDebugKotlin     # type-check + run Room's KSP code generation
./gradlew :testDebugUnitTest        # LWW + converter + fake-cloud unit tests
./gradlew installDebug              # build & install on a running device/emulator
```

## Go live against your own Firestore

1. Create a project at <https://console.firebase.google.com> and add an **Android app** with
   package name `com.example.firebasesync`.
2. Open **Build ▸ Firestore Database ▸ Create database**. For the demo, start in **test mode** (or
   add a rule allowing read/write on the `notes` collection).
3. From **Project settings ▸ Your apps** (or the `google-services.json` you can download) add three
   values to **`local.properties`** (git-ignored, so the keys never land in committed source):
   - `firebase.projectId` → `project_id`
   - `firebase.appId`     → the Android app's **App ID** (`mobilesdk_app_id`, looks like `1:…:android:…`)
   - `firebase.apiKey`    → the **Web API key** (`current_key`)

   `build.gradle.kts` reads these and generates `BuildConfig.FIREBASE_PROJECT_ID` / `_APP_ID` /
   `_API_KEY`. The app **auto-detects**: with keys present it uses the real Firestore; with none it
   runs offline against the Fake — no code change, no switch to flip.
4. Run on a networked device. Add a note and watch it appear in the Firestore console (and on a
   second device). Toggle airplane mode to see notes queue as **Pending** and flip to **Synced**
   when you reconnect.

> **Why no `google-services.json` / Gradle plugin?** To keep the project building with zero secrets
> in source, we initialise Firebase **in code** from the three `BuildConfig` values above
> (fed in from `local.properties` → `FirebaseApp.initializeApp`).
> The production-standard alternative is to drop your `google-services.json` into the module and
> apply the `com.google.gms.google-services` plugin, which wires those values automatically.
>
> On a brand-new install you may see a benign Logcat warning — *"FirebaseApp initialization
> unsuccessful"* — from Firebase's auto-init provider. It is harmless: in Fake mode we never use
> Firebase, and in real mode we initialise it ourselves from the `BuildConfig` values (fed from
> `local.properties` → `build.gradle.kts` → `buildConfigField`).

## Key files

```
src/main/java/com/example/firebasesync/
  data/
    Note.kt              @Entity Note + plain NoteDto (Firestore-mapped) + mappers + SyncState enum
    Converters.kt        @TypeConverter for SyncState (stored by name)
    NoteDao.kt           reactive reads (visible notes, pending count) + sync-engine queries
    FirebaseSyncDatabase.kt @Database holder + singleton (firebasesync.db)
    CloudApi.kt          CloudApi: FirestoreCloudApi vs FakeCloudApi + provideCloudApi(context, useFake)
    NoteRepository.kt    optimistic writes + sync() (push→pull) + shouldAcceptRemote (pure LWW)
    ConnectivityObserver.kt  online/offline as a Flow (for the banner)
  sync/
    SyncWorker.kt        CoroutineWorker that runs repository.sync(); Result.retry() on failure
    SyncScheduler.kt     enqueues the worker with a network constraint + backoff
  FirebaseSyncViewModel.kt  Room flows + connectivity → StateFlows; intents → write + requestSync
  MainActivity.kt        the UI: notes list with sync badges, offline banner, add/edit/delete
src/test/java/.../FirebaseSyncUnitTest.kt   LWW rule + converter + fake-cloud round trip
```

## What to inspect

- **`CloudApi.kt`** — `FirestoreCloudApi` is the whole "cloud is now defined" change: a `set()` to
  push and a range query to pull. Everything else is shared with CloudSync.
- **`NoteRepository.kt`** — `addNote/editNote/deleteNote` write to Room first (PENDING); `sync()`
  pushes the outbox then pulls; `shouldAcceptRemote` is the pure conflict rule.
- **`SyncScheduler.kt`** — the `NetworkType.CONNECTED` constraint is *why* offline "just queues".

## Tech stack

Jetpack Compose · Material 3 · Room `2.7.2` via **KSP** · WorkManager `2.10.0` · **Cloud Firestore
(Firebase BoM `34.15.0`)** + `kotlinx-coroutines-play-services` · Kotlin `2.2.10` · AGP `9.2.1` ·
`compileSdk 37` / `minSdk 24`. Sibling of `CloudSync` (fake/REST cloud) and `SupabaseSync` (Supabase
Postgres). Part of the AndroidStudioProjects teaching set.
