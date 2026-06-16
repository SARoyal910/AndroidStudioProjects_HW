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
> 🖥️ Interactive HTML companions live in [`homework/`](./homework): open
> **[`projects.html`](./homework/projects.html)** for a per-project, real-source
> walk-through of all of these apps;
> **[`playground.html`](./homework/playground.html)** for a live **Compose
> Playground** where you edit Compose Kotlin and watch the UI render as you type;
> and **[`nav-playground.html`](./homework/nav-playground.html)** for a live
> **Navigation 3 Playground** where you edit a `rememberNavBackStack(…)` key list
> (or tap the phone / press Back) and watch the back stack and screen update.
>
> ✅ Prefer to **practice**? **[`labs/`](./labs)** is a set of guided, browser-based
> **hands-on exercises** with instant checking — a task, starter code, and success
> checks that turn green as you edit (with hints + solutions). Open
> **[`labs/index.html`](./labs/index.html)**: ten Compose labs (layout, modifier
> order, text styling, a profile card, state, Row cross-axis, arrangement, weight
> to push, weight to split, and Box layering) and three Navigation labs (drill-down,
> key arguments, deep-link seeding).

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
| [`NetworkParsing`](./NetworkParsing) | Retrofit + kotlinx.serialization against a no-auth API (JSONPlaceholder) — loading / success / error states, with an offline fake. |
| [`WebSocketLive`](./WebSocketLive) | A **second network protocol**: full-duplex **WebSocket** (OkHttp) streaming live messages — connection status + transcript, with an offline echo fake. |
| [`LocationServices`](./LocationServices) | Integrating a **device API**: runtime location permission + **FusedLocationProviderClient**, surfaced as idle / loading / success / error, with an offline fake. |
| [`MvvmState`](./MvvmState) | MVVM: `ViewModel`, `StateFlow`, immutable `UiState`, UI events, unidirectional data flow (fake data). |
| [`RoomAndPreferences`](./RoomAndPreferences) | Local persistence: **Room** (via KSP) for structured data + **DataStore Preferences** for settings. |
| [`AppReleaseBasics`](./AppReleaseBasics) | Release basics: manifest, runtime permissions, version/build types, signing concepts, App Bundle (README). |

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
