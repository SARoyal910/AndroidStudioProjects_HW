# Playground

Three single-file, **offline, interactive** HTML playgrounds — open any of them directly in a
browser (no build step, no network). Each is a quick, hands-on "edit code, watch it live"
companion to one track of the teaching apps in this repo.

| File | What it is |
|---|---|
| **[`playground.html`](./playground.html)** | **Compose Playground** — edit Jetpack Compose Kotlin (Column, Row, Box, Text, Button, Card, modifiers…) and watch the UI re-render as you type. Companion to the Compose track. |
| **[`nav-playground.html`](./nav-playground.html)** | **Navigation 3 Playground** — edit a `rememberNavBackStack(…)` key list (or tap the phone / press Back / switch tabs) and watch the back stack and the equivalent `backStack.add(…)` / `removeLastOrNull()` update live. Companion to the navigation track. |
| **[`storage-playground.html`](./storage-playground.html)** | **Room Storage Playground** — edit Room DAO calls (`insert` / `update` / `delete` / `sortBy`), or tap a note on the phone, and watch the `notes` table, the generated SQL, and a reactive `Flow<List<Note>>` re-emit into the UI live. Companion to [`RoomAndPreferences`](../RoomAndPreferences) / [`StorageShowcase`](../StorageShowcase). |

> For the **full 21-section deep dive** on data storage, see the **[Storage Master Lab](../StorageMaster/storage-tutorial.html)**
> in [`StorageMaster/`](../StorageMaster) (the storage counterpart to `ComposeMaster/`).

## Editing

All three are **hand-written single files** — open and edit the `.html` directly. (The deep
Storage Master Lab in `StorageMaster/` is the generated one; these three playgrounds are not.)
