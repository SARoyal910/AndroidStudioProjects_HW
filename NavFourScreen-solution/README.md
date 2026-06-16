# NavFourScreen — HW3 Part A Solution

This is the runnable answer to **Homework 3, Part A (tasks A1–A4)**, applied in place
to the `NavFourScreen` project. It builds and runs as submitted.

All changes live in
`src/main/java/com/example/navfourscreen/MainActivity.kt` and are tagged in the code
with `// A1` / `// A2` / `// A3` / `// A4` comments so each task is easy to find.

- **A1** — a fifth screen (`CategoryInfoScreen`): new `CategoryInfoKey`, a new
  `entry<CategoryInfoKey>`, the `CategoryInfoScreen` composable, and an
  "About its category" button on `FactScreen` that pushes the key.
- **A2** — a "Surprise me" button atop `CategoriesScreen` that seeds the *whole*
  path `[Items, Detail, Fact]` so Back walks down sensibly.
- **A3** — a "Back to planet list" button on `FactScreen` (between "Back" and
  "Start over") that pops exactly two keys via `repeat(2) { removeLastOrNull() }`.
- **A4** — a `CategoryInfoScreenPreview` rendering one card per planet.

The app name is suffixed with " · HW3 Solution" in `res/values/strings.xml`.
