# Navigation Teaching Demos — Jetpack Compose + Navigation 3

A progression of small, single-purpose Android sample apps for teaching navigation.
Every project shares the **same "planets" domain** (Category → Item) and the same
heavy teaching-comment style, so you can diff any two to see exactly what a feature
adds. All use **Navigation 3** (`androidx.navigation3`: `NavDisplay`,
`rememberNavBackStack`, `entryProvider`, `@Serializable` `NavKey`s) on Compose +
Material 3, so students see one consistent mental model across all nine.

Each folder is a **self-contained, runnable project** — open it directly in Android
Studio (`File ▸ Open ▸ <folder>`), or build from its folder with
`./gradlew :compileDebugKotlin` / `./gradlew installDebug`.

---

## Part 1 — Navigation fundamentals (the back stack grows)

| Project | Screens | Teaches |
|---|---|---|
| `NavListDetail` | 2 | The core list → detail pattern; one argument (`itemId`) travels in the key |
| `NavThreeScreen` | 3 | A 3-deep drill-down: Categories → Items → Detail; exhaustive `@PreviewParameter` previews |
| `NavFourScreen` | 4 | A 4th screen reached by a **Button**; multi-level pop ("Start over") |

> `NavFourScreen` is the **base** the six concept demos below are cloned from.

## Part 2 — One navigation concept per project

| Project | Concept | Where the concept lives |
|---|---|---|
| `NavDeepLinks` | Open a screen directly from a URI; hand-seed a back stack so Back still works | `AndroidManifest.xml` deep-link `intent-filter`; `MainActivity.kt` URI→id parse + seeded `[Categories, Items, Detail]` stack |
| `NavBottomTabs` | Bottom tabs where **each tab owns its own back stack** (multiple back stacks) | `MainActivity.kt`: one `rememberNavBackStack` per tab; selected-tab state swaps which `NavDisplay` renders |
| `NavNestedGraphs` | A self-contained sub-flow (onboarding) that pops as a unit, then hands off to the main flow | `MainActivity.kt`: grouped "Graph A / Graph B" entries; `finishOnboarding()` clears the sub-flow off the stack |
| `NavViewModelState` | State/logic in a `ViewModel`; survives rotation & navigation (unlike `remember`) | `FavoritesViewModel.kt` (`StateFlow`); `viewModel()` + `collectAsStateWithLifecycle()`; favorite toggle |
| `NavTransitions` | Custom animated screen transitions (forward / pop / predictive-back) | `MainActivity.kt`: `NavDisplay(transitionSpec, popTransitionSpec, predictivePopTransitionSpec)` + a per-entry metadata override |
| `NavDataLayer` | Screens observe a **repository through a ViewModel** with loading/empty/error/success states | `Repository.kt` (`PlanetRepository` + `InMemoryPlanetRepository`, `Flow`); `PlanetsViewModel.kt` (`sealed PlanetsUiState`) |

## Part 3 — Example project (everything, combined + growing)

| Project | Surface | Teaches |
|---|---|---|
| `ExampleProject` | 4 tabs · 7 screens | The **"Wanderlist"** example app: bottom-tab navigation (one back stack per tab), a list → detail drill-down, an Add form, a Stats screen, **two mini-games** (a flip-card deck + an "I spy" tap-to-guess), and a **storage** preview (local + simulated cloud) |

> `ExampleProject` uses a **"travel" domain** (a list of `Destination`s) rather than
> planets, because — unlike every demo above — its data is **editable at runtime**
> (add / remove / toggle visited). It reuses the `NavBottomTabs` "multiple back stacks"
> pattern and the `NavFourScreen` drill-down, and adds the broadest Material 3 component
> sampler in the set. Beyond nav + Compose it also introduces:
>
> - **A 🎮 Play tab** with its own drill-down into two games — **Flashcards** (a 3D flip
>   via `animateFloatAsState` + `graphicsLayer`) and **Guess** (an "I spy" game with real
>   **coordinate hit-testing** via `pointerInput` / `detectTapGestures`).
> - **A storage layer** (a peek at the persistence topic): a `DestinationStore` interface
>   with a real **local** implementation (SharedPreferences + JSON) and a **simulated cloud**
>   one (suspend + delay + loading/error), wired to a Save/Load/Push/Pull card on Stats.
>
> The code is split across small, single-purpose files (`data/` · `data/storage/` ·
> `navigation/` · `ui/screens/` · `ui/theme/`) to model real-world structure, and it ships
> with a full **design document** — [`ExampleProject/design.html`](./ExampleProject/design.html)
> — that shows the design done *before* the code. Note: app data lives in plain `remember`,
> so it resets on rotation unless you Save/Load — deliberately, to motivate persistence and a
> ViewModel next.

---

## Suggested teaching order

1. **NavListDetail → NavThreeScreen → NavFourScreen** — build intuition for the back
   stack: pushing a key navigates forward, popping navigates back, keys carry arguments.
2. **NavViewModelState** — separate UI from state (where data *lives*) before adding more
   navigation surface area.
3. **NavDataLayer** — where data *comes from*: the repository boundary + UI states.
4. **NavBottomTabs** and **NavNestedGraphs** — more advanced back-stack shapes
   (parallel stacks; sub-flows).
5. **NavDeepLinks** — entering the app from outside and reconstructing a sensible stack.
6. **NavTransitions** — polish: animating the moves between screens.
7. **ExampleProject** — the capstone: once the patterns above click, study how they
   combine into one small app (bottom tabs + drill-down + form + editable state), then build
   your own on top of it.

---

## Running / testing notes

- **Deep link test** (`NavDeepLinks`, with the app installed on a device/emulator):
  ```
  adb shell am start -W -a android.intent.action.VIEW -d "navdemo://planet/4" com.example.navdeeplinks
  ```
  This should open straight to the **Mars** detail screen, with Back walking up to
  Items → Categories.

- **Previews:** every project has compact `@Preview`s (320×480 dp). The screens use
  `fillMaxSize()`, so the fixed frame keeps each preview a small card; use the
  preview pane's zoom-to-fit to see them all at once.

## Two deliberate simplifications (so the build stays green & focused)

- **`NavBottomTabs`** renders tab icons as emoji (🪐 🔍 ℹ️) via `Text` inside
  `NavigationBarItem` rather than pulling in the Material **icons** artifact — zero
  extra dependencies. Swap in `Icons.Default.*` if you add `material-icons-core`.
- **`NavTransitions`** ships working screen transitions; the **shared-element**
  morph is left as a fully-commented recipe (it relies on experimental
  `SharedTransitionLayout` APIs that drift across versions) rather than compiled code.

## Stack (all projects)

Navigation 3 `1.0.1` · Compose BOM `2026.02.01` · Material 3 · Kotlin `2.2.10` ·
AGP `9.2.1` · `compileSdk 37` / `minSdk 24`. `NavViewModelState` and `NavDataLayer`
additionally use `lifecycle-viewmodel-compose` + `lifecycle-runtime-compose` (`2.10.0`).
