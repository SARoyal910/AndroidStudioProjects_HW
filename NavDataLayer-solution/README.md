# NavDataLayer — HW3 Part C Solution

This is the runnable answer to **Homework 3, Part C (tasks C1–C4)**, applied in place
to the NavDataLayer project. Every change is tagged `// C1` … `// C4` in the source so
it is easy to find in a diff.

## What each task does

- **C1** — Added Uranus (id 7) and Neptune (id 8) to `samplePlanets` in `Repository.kt`.
  Nothing else changed because the UI reads data only through the `PlanetRepository`
  interface, never the list directly.
- **C2** — Added `enum class Simulate { OK, EMPTY, ERROR }` and a `simulate` constructor
  param on `InMemoryPlanetRepository`; `planets()` branches on it (`when (simulate)`) so
  Success / Empty / Error are all reachable. Default is back to `OK`.
- **C3** — Added `FlakyPlanetRepository`, which fails the first collection and succeeds
  afterward, and swapped it in via `PlanetsViewModel`'s default constructor arg only.
- **C4** — Refactored `PlanetDetailScreen` to a sealed `DetailUiState` (Loading / NotFound /
  Success) with one state var and an exhaustive `when`, eliminating the old `planet!!`.

## Expected behavior when you run it

Because the list's default repository is `FlakyPlanetRepository` (per C3), the app
**intentionally** shows: launch → spinner → **Error** ("Network hiccup — try again") →
tap **Retry** → spinner → **Success**. That Error→Retry→Success arc is the point of C3
(a cold Flow is re-collected on Retry), not a bug.

## Build

```
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./gradlew :compileDebugKotlin
```
