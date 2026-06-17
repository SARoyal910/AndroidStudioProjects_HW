# Playground

Three single-file, **offline, interactive** HTML playgrounds — open any of them directly in a
browser (no build step, no network). Each is the hands-on companion to one track of the
teaching apps in this repo.

| File | What it is |
|---|---|
| **[`playground.html`](./playground.html)** | **Compose Playground** — edit Jetpack Compose Kotlin (Column, Row, Box, Text, Button, Card, modifiers…) and watch the UI re-render as you type. Companion to the Compose track (`ComposeModernUI`, `ComposeCatalog`, `ComposeModifiers`, `ComposeParts`). |
| **[`nav-playground.html`](./nav-playground.html)** | **Navigation 3 Playground** — edit a `rememberNavBackStack(…)` key list (or tap the phone / press Back / switch tabs) and watch the back stack and the equivalent `backStack.add(…)` / `removeLastOrNull()` update live. Companion to the navigation track. |
| **[`storage-playground.html`](./storage-playground.html)** | **Data Storage Master Lab** — a 21-section master class on Android local persistence: DataStore, Room (entities, DAOs, reactive `Flow` queries, `@TypeConverter`, relations, migrations), files & scoped storage, encryption and backup. Ten hand-built widgets — insert rows and watch a `Flow` re-emit, flip `@Entity` annotations and watch the `CREATE TABLE` change, break a migration and watch it crash. The deep-dive behind [`RoomAndPreferences`](../RoomAndPreferences) and [`StorageShowcase`](../StorageShowcase). |

## Editing

`playground.html` and `nav-playground.html` are hand-written single files — edit them directly.

`storage-playground.html` is **generated** from source in [`storage-playground/`](./storage-playground):

```bash
cd storage-playground
node build.mjs        # styles.css + engine.js + sections.json -> ../storage-playground.html
```

- `sections.json` — all section content (prose, key points, gotchas, canonical code, playground config)
- `engine.js` — the rendering engine + every interactive playground widget
- `styles.css` — the Material-3-flavored design system
