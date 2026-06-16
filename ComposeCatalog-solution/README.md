# ComposeCatalog · HW4 Solutions

Runnable answer key for **Homework 4** — the tasks the assignment routes to `ComposeCatalog`:

| Task | What it shows | Where |
|------|---------------|-------|
| T1 | `Column` arrangement & alignment | `Hw4Solutions.kt` → `T1PlanetColumn` |
| T2 | `Row` `weight` (1:2:1) + the no-middle-weight variant | `T2WeightedRow`, `T2WeightedRowNoMiddle` |
| T3 | `Box` layering & corner badges | `T3Banner` |
| T7 | counter — state & recomposition | `Counter` |
| T8 | toggle — state hoisting (stateful + stateless) | `ToggleDemo`, `ToggleRow` |
| T9 | bound `TextField` — echo + char count | `NameField` |
| T10 | capstone — interactive planet screen (favorites `Set<Int>`, `LazyColumn`) | `PlanetScreen`, `PlanetRow` |

The Part B modifier-order tasks (T4–T6) are in the sibling **`ComposeModifiers-solution`**.

## Run it
`MainActivity` shows `Hw4CatalogSolutionsApp()` — a two-button selector:
- **T1–T9** — the non-lazy tasks in one scroll
- **T10 Capstone** — the planet screen (owns its own `LazyColumn`)

Every task also has its own `@Preview` for the Android Studio design pane.

## Build
```bash
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./gradlew assembleDebug
```
(`local.properties` with `sdk.dir=…` is created locally and not committed.)
