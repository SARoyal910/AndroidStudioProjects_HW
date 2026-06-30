# Android Studio Projects — Compose Navigation by example

A collection of small, self-contained **Jetpack Compose** apps built as a teaching
progression for Android navigation. They start from a single static screen and
build up to a full set of **Navigation 3** patterns — one concept per project, so
each app stays small enough to read top-to-bottom.

The **navigation** projects share a **"planets" domain** (`Category` → `Item`); a
second set of **Android-concept** demos (lists, networking, MVVM, persistence,
release) shares a **"notes" domain**. All use the same heavy, line-by-line teaching
comments, so you can diff any two projects to see exactly what a feature adds.

> 📚 For the navigation curriculum in depth — suggested teaching order, the exact
> `file:line` where each concept lives, and run/test notes — see
> **[`NAV_DEMOS.md`](./NAV_DEMOS.md)**.
>
> 🖥️ Interactive HTML companions: open
> **[`projects.html`](./homework/projects.html)** for a per-project, real-source
> walk-through of all of these apps. Three live **playgrounds** live in
> **[`Playground/`](./Playground)**:
> **[`playground.html`](./Playground/playground.html)** (Compose — edit Compose Kotlin and
> watch the UI render as you type),
> **[`nav-playground.html`](./Playground/nav-playground.html)** (Navigation 3 — edit a
> `rememberNavBackStack(…)` key list, or tap the phone / press Back, and watch the back stack
> update), and
> **[`storage-playground.html`](./Playground/storage-playground.html)** (Data storage — edit
> Room DAO calls, or tap a note, and watch the `notes` table, the generated SQL, and a
> reactive `Flow` re-emit into the UI live).
>
> 📚 For the **full deep dive**, the **[`StorageMaster/`](./StorageMaster)** lab
> (**[`storage-tutorial.html`](./StorageMaster/storage-tutorial.html)**) is a 21-section
> master class on local persistence — DataStore, Room (entities, DAOs, reactive `Flow`,
> migrations, relations), files & scoped storage, encryption and backup — with ten hand-built
> widgets. The runnable companion app is [`StorageShowcase`](./StorageShowcase); both are the
> deep-dive behind [`RoomAndPreferences`](./RoomAndPreferences). To instead watch **one element**
> travel all the way into storage and back, open [`StorageJourney`](./StorageJourney) — its
> [interactive explainer](./StorageJourney/storage-journey-explorer.html) runs a live in-browser
> simulator, and its [`how-an-item-reaches-storage.html`](./StorageJourney/how-an-item-reaches-storage.html)
> shows each step as code.
> If the storage materials feel like too much at once, start with
> **[`STORAGE_GUIDE.md`](./STORAGE_GUIDE.md)**. It is the short decision guide that
> explains which storage API to use and which local project demonstrates it.
>
> ✅ Prefer to **practice**? **[`labs/`](./labs)** is a set of guided, browser-based
> **hands-on exercises** with instant checking — a task, starter code, and success
> checks that turn green as you edit (with hints + solutions). Open
> **[`labs/index.html`](./labs/index.html)**: **33 labs across six tracks** — ten
> **Compose** labs (layout, modifier order, text styling, a profile card, state, Row
> cross-axis, arrangement, weight to push, weight to split, and Box layering), three
> **Navigation 3** labs (drill-down, key arguments, deep-link seeding), and the
> **data-layer** tracks that each pair a code editor with a live domain simulator:
> five **Networking** labs (the `@Serializable` DTO, a Retrofit `@GET` endpoint, the
> DTO→domain mapper, a sealed `Loading/Success/Error` state, and `try/catch` +
> `collectAsStateWithLifecycle`), five **Firebase** labs and five **Supabase** labs
> (offline-first sync over Firestore / Postgres — sync bookkeeping, optimistic
> writes, tombstone deletes, last-write-wins, push/pull, `@SerialName`, the Postgrest
> `select`/`upsert`, and Row-Level Security), and five **Cumulative** capstones drawn
> from the homework (`stateIn`, insert-vs-update routing, a pure immutable game rule,
> a shared `StateFlow` toggled with `update {}`, and the full offline-first loop). The
> data-layer labs are driven by **[`code-lab.js`](./labs/code-lab.js)**; run
> `node labs/verify-code-labs.mjs` to headlessly check that every solution turns all
> checks green and every starter does not.

---

## The learning path

### 1 · Compose foundation
| Project | What it shows |
|---|---|
| [`SingleActivity`](./SingleActivity) | The smallest possible Compose app: one `Activity`, one `setContent`, a single `Greeting` — no navigation at all. The starting point. |

### 2 · First steps with Navigation 3 (two screens)
| Project | What it shows |
|---|---|
| [`Intent`](./Intent) | Home → Detail, where a Nav3 key **argument** carries data — the modern replacement for the classic `Intent` extra (`putExtra` / `getStringExtra`). |
| [`NavDetailList`](./NavDetailList) | A list → detail variant. |
| [`NavListDetail`](./NavListDetail) | The canonical list → detail screen, extensively commented — the reference for the pattern. |

### 3 · Growing the back stack
| Project | What it shows |
|---|---|
| [`NavThreeScreen`](./NavThreeScreen) | A 3-deep drill-down: Categories → Items → Detail, with exhaustive `@PreviewParameter` previews. |
| [`NavFourScreen`](./NavFourScreen) | Adds a 4th screen reached by a **Button**, plus a multi-level "Start over" pop. The base the concept demos below are cloned from. |

### 4 · One navigation concept per project
| Project | Concept |
|---|---|
| [`NavDeepLinks`](./NavDeepLinks) | Open a screen directly from a URI; hand-seed a back stack so Back still works. |
| [`NavBottomTabs`](./NavBottomTabs) | Bottom tabs where **each tab owns its own back stack** (multiple back stacks). |
| [`NavNestedGraphs`](./NavNestedGraphs) | A self-contained sub-flow (onboarding) that pops as a unit, then hands off to the main flow. |
| [`NavViewModelState`](./NavViewModelState) | State/logic in a `ViewModel` (`StateFlow`); survives rotation & navigation, unlike `remember`. |
| [`NavTransitions`](./NavTransitions) | Custom animated screen transitions (forward / pop / predictive-back). |
| [`NavDataLayer`](./NavDataLayer) | Screens observe a **repository through a ViewModel** with loading / empty / error / success states. |
| [`NavOverlay`](./NavOverlay) | A **dialog overlay** scene that sits on top of the back stack while the screen beneath stays visible (push = +1, dismiss = −1). |

### 5 · Capstone — navigation + Compose, combined
| Project | What it shows |
|---|---|
| [`ExampleProject`](./ExampleProject) | **"Wanderlist"** — a four-screen travel bucket-list app that ties the whole course together: **bottom-tab navigation** (one back stack per tab), a **list → detail drill-down** (the 4th screen, reached by tapping a place), an **Add form** (text fields, chips, slider, switch, validation), and a **Stats** screen with a dark-mode toggle. Built on **hoisted, editable Compose state** (add / remove / toggle) and the broadest **Material 3** component sampler in the set. A good "now build your own" reference once the single-concept demos make sense. |

---

## Android concepts (beyond navigation)

A separate set of standalone demos, each isolating **one core Android skill** on a
shared **"notes" domain** (`Note(id, title, body, …)`) so you can compare them.
Same Kotlin / Compose / Material 3 / Gradle-KTS stack; each has its own README.

| Project | Concept |
|---|---|
| [`ComposeModernUI`](./ComposeModernUI) | Compose fundamentals: composables, Material 3 theme, layout, **state hoisting**, reusable components, previews. |
| [`ComposeCatalog`](./ComposeCatalog) | A guided tour of **every common Material 3 component** on one screen: Text, the button family, selection controls, sliders, text fields, cards, icons/images, progress, chips/badges, dialog, Scaffold + TopAppBar + FAB + Snackbar. |
| [`ComposeModifiers`](./ComposeModifiers) | **Modifiers & layout** deep dive: the ordered modifier chain (**order matters** — `padding` vs `background`), sizing, `Arrangement`/`Alignment`, `weight`, `Box` + `align`, clip/border/shadow, transforms. |
| [`ComposeLists`](./ComposeLists) | `LazyColumn` + `LazyVerticalGrid`, stable item keys, multi-selection, empty states, filtering. |
| [`NetworkParsing`](./NetworkParsing) | Retrofit + kotlinx.serialization against a real, free, keyless weather API ([Open-Meteo](https://open-meteo.com/)) — loading / success / error states, with an offline fake. Includes an interactive [API how-to guide](./NetworkParsing/using-the-weather-api.html). |
| [`WebSocketLive`](./WebSocketLive) | A **second network protocol**: full-duplex **WebSocket** (OkHttp) streaming live messages — connection status + transcript, with an offline echo fake. |
| [`LocationServices`](./LocationServices) | Integrating a **device API**: runtime location permission + **FusedLocationProviderClient**, surfaced as idle / loading / success / error, with an offline fake. |
| [`MvvmState`](./MvvmState) | MVVM: `ViewModel`, `StateFlow`, immutable `UiState`, UI events, unidirectional data flow (fake data). |
| [`RoomAndPreferences`](./RoomAndPreferences) | Local persistence: **Room** (via KSP) for structured data + **DataStore Preferences** for settings. |
| [`StorageShowcase`](./StorageShowcase) | Local-storage **capstone**: one tabbed app covering Room (entity, DAO, reactive `Flow`, `@TypeConverter`, `@ForeignKey`/`@Relation`, a `Migration`), Preferences DataStore, **Typed (JSON) DataStore**, and internal file storage. The runnable companion to the [Storage Master Lab](./StorageMaster/storage-tutorial.html). |
| [`StorageJourney`](./StorageJourney) | **Depth on one round trip**: follow a single element from the text field through ViewModel → Repository → **Room** → disk and back, with a live in-app **Journey panel**. Two HTML companions: an [interactive explainer](./StorageJourney/storage-journey-explorer.html) (live in-browser simulator) and a [step-by-step code walkthrough](./StorageJourney/how-an-item-reaches-storage.html). Room-only, heavily commented. |
| [`AppReleaseBasics`](./AppReleaseBasics) | Release basics: manifest, runtime permissions, version/build types, signing concepts, App Bundle (README). |

---

## Cloud sync — local ⇄ a real cloud database

Three **siblings** that teach the **offline-first** pattern: **Room** is the on-device single
source of truth the UI always reads; a WorkManager `SyncWorker` pushes a local outbox then pulls
remote changes; client-generated UUIDs, an `updatedAt` clock, soft-delete tombstones, and a pure
**last-write-wins** rule keep the two sides consistent. They share **one architecture** and differ
only in the *real* `CloudApi` implementation — so you can diff them to see exactly what each backend
changes.

| Project | The cloud |
|---|---|
| [`CloudSync`](./CloudSync) | The pattern itself, against an in-memory **Fake** cloud (plus a generic Retrofit/REST stub). **Start here.** |
| [`FirebaseSync`](./FirebaseSync) | A real **Google Cloud Firestore** backend — `document().set()` to push, a `whereGreaterThan` range query to pull. Initialised in code, so it builds with no `google-services.json`. |
| [`SupabaseSync`](./SupabaseSync) | A real **Supabase (Postgres)** backend via `supabase-kt` — `upsert` to push, a filtered `select` to pull. Ships the `create table` SQL. |

All three default to the offline **Fake** cloud, so they build, run, and unit-test with **no backend
and no secrets**; each README shows the single switch to flip for a live backend.

---

## Running a project

Each folder is an independent Android project.

- **Android Studio:** `File ▸ Open…` and select the project folder (e.g. `NavFourScreen`).
- **Command line** (from inside a project folder):
  ```bash
  ./gradlew installDebug      # build & install on a running device/emulator
  ./gradlew :compileDebugKotlin   # just type-check / compile
  ```

**Deep link demo** (`NavDeepLinks`, with the app installed):
```bash
adb shell am start -W -a android.intent.action.VIEW \
  -d "navdemo://planet/4" com.example.navdeeplinks
```
Opens straight to the **Mars** detail screen, with Back walking up to Items → Categories.

---

## Tech stack

Jetpack Compose · **Navigation 3** (`androidx.navigation3`) · Material 3 ·
Kotlin `2.2.10` · AGP `9.2.1` · `compileSdk 37` / `minSdk 24` · Compose BOM `2026.02.01`.
`NavViewModelState` and `NavDataLayer` additionally use
`lifecycle-viewmodel-compose` + `lifecycle-runtime-compose`.

The Android-concept demos add only what each concept needs: Retrofit +
kotlinx.serialization (`NetworkParsing`), OkHttp WebSocket (`WebSocketLive`),
Google Play services location (`LocationServices`), Room via KSP + DataStore
Preferences (`RoomAndPreferences`), and ViewModel/lifecycle (`MvvmState`,
`NetworkParsing`, `WebSocketLive`, `LocationServices`, `RoomAndPreferences`).

## Cloning notes

`local.properties` is intentionally **not** committed (it holds a machine-specific
SDK path). After cloning, open a project in Android Studio — it generates the file
automatically — or set `sdk.dir` / the `ANDROID_HOME` environment variable yourself.
