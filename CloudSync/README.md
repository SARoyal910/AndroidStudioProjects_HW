# CloudSync

A single-screen Jetpack Compose teaching app that shows **cloud storage used together with
Room** — the **offline-first** pattern. Room is the **single source of truth** the UI always
reads; a repository + a WorkManager **SyncWorker** reconcile that local cache with a cloud
backend. Everything you do works **offline**: writes are optimistic and queue locally, then
push automatically when the network returns.

> 📖 **Step-by-step walkthrough:** [How a note syncs](how-a-note-syncs.html) — the read path,
> the optimistic write path, the offline queue, the push/pull `SyncWorker`, and last-write-wins
> conflict resolution, each as a real block of code (open in a browser).
>
> 🕹️ **Interactive explainer:** [CloudSync explorer](cloudsync-explorer.html) — a live
> offline-first simulator (toggle the network, add/edit/delete, watch rows queue as **Pending**
> and drain to **Synced**), a clickable architecture map, a last-write-wins conflict demo, the Real/Fake
> switch, a glossary, and a quiz.

## Learning goal

Learn how an Android app combines a **local database (Room)** with a **cloud backend**, and
what happens when the device is **offline**:

- **Single source of truth** — the UI only ever reads Room (`observeVisibleNotes(): Flow`), so
  it renders instantly and works with no connection. The cloud is a sync target, not a UI source.
- **Optimistic writes + an outbox** — a create/edit/delete writes to Room immediately, marked
  `SyncState.PENDING`. The user sees the change at once, online or off.
- **Background sync** — a `SyncWorker` (WorkManager) **pushes** pending rows then **pulls**
  remote changes. A `NetworkType.CONNECTED` constraint means it just **defers** when offline and
  fires when connectivity returns; failures `Result.retry()` with backoff.
- **Sync metadata** — client-generated **UUID ids** (so an offline row has an identity before
  the server sees it), an `updatedAt` clock, a `SyncState`, and a `deleted` **tombstone** (so a
  delete can still be pushed while offline).
- **Conflict resolution** — `shouldAcceptRemote(...)` is a pure **last-write-wins** rule
  (compare `updatedAt`; a pending local edit wins until it's pushed).
- **Real vs Fake switch** — a `CloudApi` interface with a Retrofit-backed `Real` impl and an
  in-memory `Fake` cloud (latency + LWW + a "another device edited" hook), swapped by one flag so
  the app and tests run offline.

## Key files

```
src/main/java/com/example/cloudsync/
  data/
    Note.kt              @Entity Note + @Serializable NoteDto + mappers + SyncState enum
    Converters.kt        @TypeConverter for SyncState (stored by name)
    NoteDao.kt           reactive reads (visible notes, pending count) + sync-engine queries
    CloudSyncDatabase.kt @Database holder + singleton (cloudsync.db)
    CloudApi.kt          CloudApi: RealRetrofitCloudApi vs FakeCloudApi + provideCloudApi(useFake)
    NoteRepository.kt    optimistic writes + sync() (push→pull) + shouldAcceptRemote (pure LWW)
    ConnectivityObserver.kt  online/offline as a Flow (for the banner)
  sync/
    SyncWorker.kt        CoroutineWorker that runs repository.sync(); Result.retry() on failure
    SyncScheduler.kt     enqueues the worker with a network constraint + backoff
  CloudSyncViewModel.kt  Room flows + connectivity → StateFlows; intents → write + requestSync
  MainActivity.kt        the UI: notes list with sync badges, offline banner, add/edit/delete
src/test/java/.../CloudSyncUnitTest.kt   LWW rule + converter + fake-cloud round trip
```

## What to inspect

- **`NoteRepository.kt`** — `addNote/editNote/deleteNote` write to Room first (PENDING); `sync()`
  pushes the outbox then pulls; `shouldAcceptRemote` is the pure conflict rule.
- **`SyncScheduler.kt`** — the `NetworkType.CONNECTED` constraint is *why* offline "just queues".
- **`NoteDao.kt`** — note the visible-notes read filters out tombstones, and `notesToPush()` is
  the outbox query.

## Run it

By default the app runs **offline** against the in-memory `FakeCloudApi`, so it builds, runs, and
unit-tests with **no network and no backend**. The fake imitates latency, last-write-wins, and a
remote edit, so the UI behaves like a real server.

```bash
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
  ./gradlew :compileDebugKotlin     # type-check + run Room's KSP code generation
./gradlew :testDebugUnitTest        # LWW + converter + fake-cloud unit tests
./gradlew installDebug              # build & install on a running device/emulator
```

To use a **real** backend: in `CloudApi.kt` point `RetrofitCloudApi`'s `baseUrl` at your server
(exposing `GET/POST /notes`) and pass `useFakeCloud = false` into `NoteRepository.get(...)`. The
`INTERNET` permission is already declared. To watch the offline behavior on a device, toggle
airplane mode: new notes show as **Pending** and flip to **Synced** when you reconnect.

## Tech stack

Jetpack Compose · Material 3 · Room `2.7.2` via **KSP** · WorkManager `2.10.0` · Retrofit
`2.11.0` + OkHttp + kotlinx.serialization · Kotlin `2.2.10` · AGP `9.2.1` · `compileSdk 37` /
`minSdk 24`. Part of the AndroidStudioProjects teaching set (see also `StorageJourney`,
`StorageShowcase`, `NetworkParsing`, `WebSocketLive`).
