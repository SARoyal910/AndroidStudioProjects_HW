# PokeDex — Homework 8 starter

The runnable starter for **[Homework 8](../homework/Assigned/hw8.html)** — the network
capstone. It ties together the whole course (Compose · Navigation 3 · ViewModel/StateFlow ·
**Retrofit + kotlinx.serialization** · Room offline cache · unit tests) around the free,
keyless **[PokéAPI](https://pokeapi.co/)** (no API key, no account).

## Run it first

Open the `PokeDex` folder in Android Studio, let Gradle sync, and press **Run ▶**. It launches
**immediately, offline**, showing a list of sample Pokémon → tap one for its detail (types as
emoji, height, weight) → Back returns to the list. That sample data comes from a built-in
**Fake repository**, so the architecture runs before you write a line.

```bash
# command line (from this folder), using the Android Studio JBR (JDK 21):
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./gradlew assembleDebug
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./gradlew testDebugUnitTest
```

## What's provided vs. your job

**Provided & working** (read them as references): the DTOs + Retrofit `PokemonApi`, the Room
cache (`CachedPokemon`/`PokemonDao`/`PokemonDatabase`), the `FakePokemonRepository`, both
ViewModels (sealed `Loading/Success/Error`), the Navigation 3 host, and both screens.

**Your TODOs** (search the project for `TODO`):

| Where | Part | What to implement |
|---|---|---|
| `Pokemon.kt` | **B4** | the **mapper** — `dexNumberFromUrl`, `typeEmoji`, `toSummary`, `toDetail` (units: dm→m, hg→kg) |
| `PokemonRepository.kt` | **D2** | `RealPokemonRepository` — offline-first: read cache, refresh from network, cache-then-network detail |
| `PokemonTest.kt` | **G** | unit tests for the mapper (the file ships 2 passing examples + a TODO list) |

## Go live

The app defaults to the offline Fake so it runs out of the box. Once you've implemented the
mapper (B4) and `RealPokemonRepository` (D2), flip the one switch in `PokemonRepository.kt`:

```kotlin
fun providePokemonRepository(context: Context, useFake: Boolean = false /* was true */): …
```

…and the same screens now fetch **live** from PokéAPI and cache into Room (so they keep working
in airplane mode). No keys, no secrets — that's the point of choosing a keyless API.
