# SupabaseSync

A single-screen Jetpack Compose teaching app that syncs a notes list between a **local Room
database** and a **real cloud database — Supabase (hosted Postgres)** — using the **offline-first**
pattern. Room is the **single source of truth** the UI always reads; a repository + a WorkManager
**SyncWorker** push local changes up to a Supabase `notes` table and pull remote changes down.
Everything you do works **offline**: writes are optimistic and queue locally, then push
automatically when the network returns.

> 📖 **Step-by-step walkthrough:** [How a note syncs](how-a-note-syncs.html) — the read path, the
> optimistic write path, the offline queue, the push/pull `SyncWorker`, last-write-wins, and the real
> **Supabase** calls (upsert + filtered select), each as a real block of code (open in a browser).
>
> 🕹️ **Interactive explainer:** [SupabaseSync explorer](supabasesync-explorer.html) — a live
> offline-first simulator (toggle the network, add/edit/delete, watch rows queue as **Pending** and
> drain to **Synced**), a clickable architecture map, a last-write-wins conflict demo, the Real/Fake
> switch, a glossary, and a quiz.
>
> 🔌 **Supabase setup & API guide:** [Supabase setup & API guide](supabase-setup.html) — go live: create
> the project, the `notes` table and RLS policies (dashboard SQL Editor **and** the Supabase CLI /
> Management API), copy the Project URL + anon key, the Gradle deps, the `createSupabaseClient` +
> `install(Postgrest)` init line by line, the Real/Fake switch, the 5 operations traced down to the real
> Supabase call, every API this app uses (and the rest of the toolbox), a `curl` REST check, and
> troubleshooting.

> This is the **Supabase-backed sibling of [`CloudSync`](../CloudSync)**. The architecture is
> identical — the only thing that changed is the *real* `CloudApi` implementation, from a generic
> REST stub pointed at nowhere to a concrete **Supabase Postgres** client. See also
> [`FirebaseSync`](../FirebaseSync): the same app over Cloud Firestore.

## Learning goal

Learn how an Android app combines a **local database (Room)** with a **real cloud database
(Supabase/Postgres)**, and what happens when the device is **offline**:

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
- **Real vs Fake switch** — a `CloudApi` interface with a **Supabase-backed** `Real` impl and an
  in-memory `Fake` cloud (latency + LWW + a "another device edited" hook). The switch is
  **automatic**: `provideCloudApi` uses the real backend when `BuildConfig.SUPABASE_URL` and
  `BuildConfig.SUPABASE_ANON_KEY` are non-blank, and the offline Fake otherwise. There is no flag
  to flip — cloning the project without credentials gives you the Fake automatically.

## The cloud: Supabase (Postgres)

Supabase is a hosted **Postgres** database with an auto-generated REST API (PostgREST). The
`supabase-kt` client turns that into typed Kotlin calls against a table (see `data/CloudApi.kt`):

- **push** = `from("notes").upsert(noteDto)` → `INSERT … ON CONFLICT (id) DO UPDATE`
- **pull** = `from("notes").select { filter { gt("updated_at", since) }; order("updated_at") }`

> Unlike Firestore, Supabase has **no built-in local cache** — which is exactly why we pair it with
> **Room**: Room is the offline single source of truth, Supabase is the remote. (`FirebaseSync` is
> the same app where the cloud *does* bring its own cache.)

## Run it (offline, zero setup)

By default the app runs **offline** against the in-memory `FakeCloudApi`, so it builds, runs, and
unit-tests with **no Supabase project and no network**.

```bash
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
  ./gradlew :compileDebugKotlin     # type-check + run Room's KSP code generation
./gradlew :testDebugUnitTest        # LWW + converter + fake-cloud unit tests
./gradlew installDebug              # build & install on a running device/emulator
```

## Go live against your own Supabase

1. Create a project at <https://supabase.com/dashboard>.
2. In the **SQL Editor**, create the `notes` table (column names are snake_case — see the
   `@SerialName("updated_at")` mapping in `data/Note.kt`):

   ```sql
   create table public.notes (
     id         text primary key,
     title      text not null,
     body       text not null default '',
     updated_at bigint not null,
     deleted    boolean not null default false
   );

   -- For a quick teaching demo, allow the public anon key to read/write this one table.
   -- (In production you would scope these policies to authenticated users.)
   alter table public.notes enable row level security;
   create policy "demo anon read"  on public.notes for select using (true);
   create policy "demo anon write" on public.notes for insert with check (true);
   create policy "demo anon update" on public.notes for update using (true) with check (true);
   create policy "demo anon delete" on public.notes for delete using (true);
   ```

3. From **Project Settings ▸ Data API** copy two values into **`local.properties`** (git-ignored —
   the keys never enter committed source; Gradle reads them and exposes them as
   `BuildConfig.SUPABASE_URL` / `BuildConfig.SUPABASE_ANON_KEY`):

   ```properties
   supabase.url=https://<ref>.supabase.co
   supabase.anonKey=<the public anon key>
   ```

   The switch is **automatic**: when both keys are present the app uses the real
   `SupabaseCloudApi`; with no keys it falls back to the offline `FakeCloudApi` (no flag to flip).
4. Run on a networked device. Add a note and watch the row appear in the Supabase **Table Editor**
   (and on a second device). Toggle airplane mode to see notes queue as **Pending** and flip to
   **Synced** when you reconnect.

> **Security note:** the policies above are wide open so the demo works with just the anon key.
> The anon key is *publishable* (safe to ship), but it is only as safe as your **RLS policies** —
> tighten them before storing anything real.

## Key files

```
src/main/java/com/example/supabasesync/
  data/
    Note.kt              @Entity Note + @Serializable NoteDto (@SerialName columns) + mappers + SyncState
    Converters.kt        @TypeConverter for SyncState (stored by name)
    NoteDao.kt           reactive reads (visible notes, pending count) + sync-engine queries
    SupabaseSyncDatabase.kt @Database holder + singleton (supabasesync.db)
    CloudApi.kt          CloudApi: SupabaseCloudApi vs FakeCloudApi + provideCloudApi(useFake)
    NoteRepository.kt    optimistic writes + sync() (push→pull) + shouldAcceptRemote (pure LWW)
    ConnectivityObserver.kt  online/offline as a Flow (for the banner)
  sync/
    SyncWorker.kt        CoroutineWorker that runs repository.sync(); Result.retry() on failure
    SyncScheduler.kt     enqueues the worker with a network constraint + backoff
  SupabaseSyncViewModel.kt  Room flows + connectivity → StateFlows; intents → write + requestSync
  MainActivity.kt        the UI: notes list with sync badges, offline banner, add/edit/delete
src/test/java/.../SupabaseSyncUnitTest.kt   LWW rule + converter + fake-cloud round trip
```

## What to inspect

- **`CloudApi.kt`** — `SupabaseCloudApi` is the whole "cloud is now defined" change: a `select`
  with a `gt` filter to pull and an `upsert` to push. Everything else is shared with CloudSync.
- **`NoteRepository.kt`** — `addNote/editNote/deleteNote` write to Room first (PENDING); `sync()`
  pushes the outbox then pulls; `shouldAcceptRemote` is the pure conflict rule.
- **`SyncScheduler.kt`** — the `NetworkType.CONNECTED` constraint is *why* offline "just queues".

## Tech stack

Jetpack Compose · Material 3 · Room `2.7.2` via **KSP** · WorkManager `2.10.0` · **supabase-kt
`3.2.2`** (Postgrest) + Ktor `3.2.2` + kotlinx.serialization `1.9.0` · Kotlin `2.2.10` · AGP `9.2.1`
· `compileSdk 37` / `minSdk 24`. Sibling of `CloudSync` (fake/REST cloud) and `FirebaseSync` (Cloud
Firestore). Part of the AndroidStudioProjects teaching set.
