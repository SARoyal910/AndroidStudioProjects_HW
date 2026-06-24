# Android Storage Guide

This is the short front door for the storage material in this workspace. The
full docs and projects are useful, but start here when the question is simply:
"Where should this data go?"

## The Mental Model

Android storage is not one shared disk. Pick storage by asking three questions:

1. What shape is the data?
2. Who should own or see it?
3. How long must it survive?

Most app data should stay private to your app. Use shared storage only when the
user should see, keep, or choose the file outside your app.

## Quick Decision Table

| Data you have | Use | Project example | Why |
|---|---|---|---|
| Many records you sort, filter, search, relate, or migrate | Room | `RoomAndPreferences`, `StorageShowcase` | It is a real SQLite database with Kotlin APIs, checked queries, `Flow` reads, and schema migrations. |
| A few simple settings | Preferences DataStore | `RoomAndPreferences`, `StorageShowcase` | It replaces `SharedPreferences` with async reads, reactive `Flow`, and transactional writes. |
| One typed settings/profile object | Typed DataStore | `StorageShowcase` | It stores one schema-backed object with defaults and type safety. |
| Private app-owned text or bytes | `filesDir` | `StorageShowcase` | The file survives app restart and is private to your app until uninstall or clear storage. |
| Temporary bytes you can rebuild | `cacheDir` | `StorageShowcase` | Android or the user may delete it at any time, so never store important data there. |
| User-visible photos, video, audio, or downloads | MediaStore | `StorageMaster/storage-tutorial.html` | The file belongs in shared storage and can survive your app being uninstalled. |
| A user-selected document or save location | Storage Access Framework | `StorageMaster/storage-tutorial.html` | The system picker grants access to exactly what the user picked, usually with no broad storage permission. |

## The Decision Tree

Ask these in order:

1. Is it just screen state while the app is open?
   Use Compose state or a `ViewModel`. Do not persist it yet.

2. Is it structured app data?
   Use Room when you have rows, IDs, sorting, filtering, relations, transactions,
   or anything that may need a migration later.

3. Is it a small private setting?
   Use Preferences DataStore for independent values like `dark_theme` or
   `sort_order`.

4. Is it one private typed object?
   Use Typed DataStore for a single object like `UserProfile`.

5. Is it a private file?
   Use `filesDir` if it must last. Use `cacheDir` if it can be recreated.

6. Should the user see or keep the file outside the app?
   Use MediaStore for media. Use SAF when the user chooses a document or save
   location.

## What Each Local Project Is For

| Project or doc | Use it when you want to learn |
|---|---|
| `RoomAndPreferences` | The smallest runnable persistence app: Room for notes plus Preferences DataStore for settings. Start here. |
| `Playground/storage-playground.html` | The visual model for Room: edit DAO-like calls and watch the table, SQL, and reactive UI update. |
| `StorageJourney` | One element's full round trip into storage (Room-only), with a live in-app Journey panel. Read it when you want to see *exactly* how data reaches the database and comes back. Companions: `StorageJourney/storage-journey-explorer.html` (interactive, in-browser simulator) and `StorageJourney/how-an-item-reaches-storage.html` (step-by-step code). |
| `StorageShowcase` | The capstone app: Room, Preferences DataStore, Typed DataStore, `filesDir`, and `cacheDir` in one UI. |
| `StorageShowcase/how-storageshowcase-works.html` | A file-by-file walkthrough of the capstone app. |
| `StorageShowcase/android-storage-lab.html` | A broad interactive guide covering storage choices, permissions, lifecycle behavior, Room, DataStore, files, MediaStore, and SAF. |
| `StorageMaster/storage-tutorial.html` | The longest master lab. Use it after the smaller pieces make sense. |

Recommended order:

1. Read this file.
2. Open `RoomAndPreferences`.
3. Open `Playground/storage-playground.html`.
4. Open `StorageJourney` (and `StorageJourney/how-an-item-reaches-storage.html`) to see one
   element's full trip into storage, step by step.
5. Open `StorageShowcase`.
6. Use `StorageShowcase/android-storage-lab.html` or `StorageMaster/storage-tutorial.html`
   only when you need the deeper explanation.

## How The Code Fits Together

### Room

Room has three core pieces:

| Piece | File example | Meaning |
|---|---|---|
| `@Entity` | `StorageShowcase/src/main/java/com/example/storageshowcase/data/Models.kt` | A Kotlin data class that becomes a table. |
| `@Dao` | `StorageShowcase/src/main/java/com/example/storageshowcase/data/NoteDao.kt` | The methods that read and write the table. |
| `@Database` | `StorageShowcase/src/main/java/com/example/storageshowcase/data/StorageDatabase.kt` | The database holder that creates the SQLite file and exposes DAOs. |

Use `Flow<List<T>>` for live reads. Room re-runs and re-emits the query when the
table changes. Use `suspend` DAO methods for writes. Room moves those calls off
the main thread, so do not wrap normal suspend DAO calls in `Dispatchers.IO`.

Change a shipped entity carefully. If users already have version 1 of a database
and you ship version 2, Room needs a migration path. `StorageDatabase.kt` shows a
real `MIGRATION_1_2`.

### DataStore

Use DataStore for small private app state that is not a relational table.

| Flavor | File example | Use |
|---|---|---|
| Preferences DataStore | `StorageShowcase/src/main/java/com/example/storageshowcase/data/SettingsRepository.kt` | Simple key/value settings. |
| Typed DataStore | `StorageShowcase/src/main/java/com/example/storageshowcase/data/ProfileRepository.kt` | One typed object with defaults and a serializer. |

Reads are `Flow`s. Writes are suspending transactions:

- Preferences DataStore writes with `edit { }`.
- Typed DataStore writes with `updateData { }`.

Store enums by `name`, not ordinal. Ordinals break if you reorder enum values.

### Files

Use files when your data is naturally bytes or text, not rows or settings.

| Location | File example | Behavior |
|---|---|---|
| `filesDir` | `StorageShowcase/src/main/java/com/example/storageshowcase/data/FileStore.kt` | Private and persistent until uninstall or clear storage. |
| `cacheDir` | `StorageShowcase/src/main/java/com/example/storageshowcase/data/FileStore.kt` | Private but disposable. Android or the user can clear it. |

Raw file I/O is blocking. Unlike Room, plain file reads and writes should run on
`Dispatchers.IO`; `StorageViewModel.kt` shows this around `FileStore` calls.

## What Survives What?

| Event | Room | DataStore | `filesDir` | `cacheDir` | MediaStore/shared files |
|---|---:|---:|---:|---:|---:|
| App process restart | Yes | Yes | Yes | Usually | Yes |
| Device restart | Yes | Yes | Yes | Usually | Yes |
| Clear cache | Yes | Yes | Yes | No | Yes |
| Clear storage / clear data | No | No | No | No | Usually |
| Uninstall | No | No | No | No | Usually |

Cache is the important exception: it is stored on disk, but it is not durable.
Always check that a cache file still exists before reading it.

## Common Confusions

Room is not a server database. It is a local SQLite database inside the app's
private storage.

DataStore is not for lists of records. If you are storing many items and querying
them, use Room.

`SharedPreferences` is the older API. Prefer DataStore in new teaching examples
unless you are explaining legacy code.

`content://` URIs from a picker are not regular file paths. Treat them as handles
that you access through Android APIs.

Modern Android usually avoids broad storage permissions. Prefer app-private
storage, Photo Picker, MediaStore, or SAF depending on the feature.

## A Good Teaching Sentence

Use this as the simple version:

Room is for structured records, DataStore is for small private settings or one
typed object, `filesDir` is for private durable files, `cacheDir` is for disposable
files, and MediaStore or SAF is for files the user should see or choose.
