# ComposeModifiers · HW4 Solutions

Runnable answer key for **Homework 4 · Part B** — "modifier order is a feature":

| Task | What it shows | Where |
|------|---------------|-------|
| T4 | padding vs background (predict-then-run pair) | `Hw4Solutions.kt` → `T4AbackgroundThenPadding`, `T4BpaddingThenBackground` |
| T5 | clip → background → border (rounded avatar) + reorder note | `T5Avatar` |
| T6 | one `Card`, size-affecting vs draw-only modifiers | `T6Card` |

The layout/state tasks (T1–T3, T7–T10) are in the sibling **`ComposeCatalog-solution`**.

## Run it
`MainActivity` shows `Hw4ModifierSolutionsScreen()` — all three Part B tasks in one scroll.
Every task also has its own `@Preview`.

## Build
```bash
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./gradlew assembleDebug
```
(`local.properties` with `sdk.dir=…` is created locally and not committed.)
