# NavViewModelState — HW3 Part B Solution (B1–B4)

This is the **runnable answer** to Homework 3, **Part B** (tasks B1–B4), applied
in place to the `NavViewModelState` sample. It builds and runs as the solution.

The app is a three-screen drill-down (Categories → Items → Detail) whose real
lesson is **state ownership**: screen state and mutation logic live in a single
`FavoritesViewModel` scoped to the Activity, so the state survives rotation and
navigation. The UI only OBSERVES state and SENDS EVENTS up (unidirectional data
flow).

## What each task adds

- **B1 — clear all favorites.** `FavoritesViewModel.clearFavorites()` empties the
  set; a "Clear favorites" button in the `ItemsScreen` header reports the event up
  via a new `onClearFavorites` param wired through `ItemsRoute`. The screen stays
  stateless.
- **B2 — Categories joins in.** A new stateful `CategoriesRoute` observes the
  shared ViewModel and hands a plain `favoriteCount` to `CategoriesScreen`, which
  renders a live "★ N favorited so far" line above the rows. `entry<CategoriesKey>`
  now calls the Route.
- **B3 — toggle from the list.** Each Items row shows an always-visible, tappable
  star (★ favorited / ☆ not) with its own `clickable`, so tapping the star toggles
  the favorite WITHOUT navigating while the rest of the row still opens detail.
  Wired via `onToggleFavorite` → `favoritesViewModel::toggleFavorite`.
- **B4 — visited tracking.** A second `StateFlow` `visited: Set<Int>` with
  `markVisited(id)` (add-only) records opened planets via a `LaunchedEffect(item.id)`
  in `DetailRoute`. `ItemsRoute` now collects BOTH flows and a "· visited" label
  shows on visited rows.

Every change is tagged `// B1`…`// B4` in the source with heavy teaching comments.

## Files

- `src/main/java/com/example/navviewmodelstate/FavoritesViewModel.kt` — `clearFavorites()` (B1), `visited`/`markVisited()` (B4).
- `src/main/java/com/example/navviewmodelstate/MainActivity.kt` — `CategoriesRoute` (B2), updated `ItemsRoute`/`DetailRoute`/`ItemsScreen`/`CategoriesScreen`, and fixed previews.

## Build

```
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./gradlew :compileDebugKotlin
```
