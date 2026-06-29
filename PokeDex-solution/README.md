# PokeDex-solution — Homework 8 answer key

The complete, runnable **solution** to **[Homework 8](../homework/Assigned/hw8.html)** — the network
capstone — with a per-part walkthrough in **[hw8-solutions.html](../homework/Solutions/hw8-solutions.html)**.
It ties together the whole course (Compose · Navigation 3 · ViewModel/StateFlow ·
**Retrofit + kotlinx.serialization** · Room offline cache · unit tests) around the free, keyless
**[PokéAPI](https://pokeapi.co/)** (no API key, no account).

This is the worked answer to the [`PokeDex`](../PokeDex) starter: the three student TODOs are filled in.

## What's implemented (vs the starter's TODOs)

| Part | File | Solution |
|---|---|---|
| **B4** | `Pokemon.kt` | the mapper — `dexNumberFromUrl` (trailing int), `typeEmoji` (18 types + fallback), `toSummary`, `toDetail` (dm→m, hg→kg) |
| **D2** | `PokemonRepository.kt` | `RealPokemonRepository` — offline-first: UI reads Room's `Flow`; `refreshList` adds new rows with **`IGNORE`** (so it never wipes cached details); `getDetail` is cache-then-network |
| **G** | `PokemonTest.kt` | 8 unit tests — mapper + decoding, plus list/detail **ViewModel** tests via a `MainDispatcherRule` |

It also makes one design improvement over the starter so the ViewModels are JVM-testable: they're
**plain `ViewModel`s that take their `PokemonRepository` as a constructor argument** (the screen builds
the real one from a `Context` and injects it via `factory(repository)`; tests inject a fake). And the
repository switch now defaults to **live** (`useFake = false`) — the finished app fetches real Pokémon
and caches them, so it keeps working offline after the first load.

## Run it

```bash
# build + run the fast JVM unit tests (no emulator), using the Android Studio JBR (JDK 21):
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./gradlew assembleDebug testDebugUnitTest
```

Open the `PokeDex-solution` folder in Android Studio and **Run ▶** on a device/emulator with internet to
see it fetch the first 151 Pokémon live, drill into a detail screen, and survive going offline (Room cache).

> Verified: `assembleDebug` + `testDebugUnitTest` green (8/8), and the example UI test compiles. Same stack
> as the rest of the repo (Compose BOM 2026.02.01, Retrofit 2.11.0, Room 2.7.2, Nav3 1.0.1, JUnit 4).
