// =============================================================================
// Pokemon.kt  —  DTOs  vs  DOMAIN MODELS  +  the MAPPER  (the parsing boundary)
//
// CONCEPT THIS FILE TEACHES: a real API returns NESTED JSON whose keys and units
// rarely match what your UI wants. Keep the shape the NETWORK speaks (the DTOs —
// one class per nested object, carrying @Serializable) SEPARATE from the FLAT
// shape your APP speaks (the domain models), and convert between them in ONE place
// (the mapper at the bottom). This is the same DTO-vs-domain split you saw in
// NetworkParsing's Weather.kt — only the domain is Pokémon instead of weather.
//
// THE API (PokéAPI — FREE, no API key, no account):
//   list:   GET https://pokeapi.co/api/v2/pokemon?limit=151&offset=0
//             -> { count, next, results: [ { name, url } ] }
//   detail: GET https://pokeapi.co/api/v2/pokemon/{name}
//             -> { id, name, height(decimetres), weight(hectograms),
//                  types: [ { slot, type: { name } } ], ... }
//
// WHAT'S PROVIDED vs YOUR JOB:
//   • PROVIDED (read them): the DTOs and the domain models below.
//   • YOUR TODOs (Part B4): the four mapper stubs at the BOTTOM — they currently
//     return placeholders so the app still compiles and runs on the offline Fake.
//     Implement them to turn real network JSON into clean domain models.
// =============================================================================

package com.example.pokedex

// @Serializable triggers the kotlinx.serialization compiler plugin to GENERATE a
// decoder; @SerialName renames a property to match a JSON key that differs from it.
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// ===========================================================================
// DATA TRANSFER OBJECTS (DTOs)  —  the exact NESTED shape of the JSON  [PROVIDED]
//
// These exist ONLY to be decoded from JSON. The JSON has MANY more fields than we
// model (sprites, stats, abilities, moves, …); WeatherApi-style
// `Json { ignoreUnknownKeys = true }` (see PokemonApi.kt) makes Retrofit drop them.
// ===========================================================================

/**
 * The whole `/pokemon?limit=…` response: a paging envelope around the results list.
 * We only model `results`; `count`/`next`/`previous` are ignored by the parser.
 */
@Serializable
data class PokemonListResponseDto(
    val results: List<NamedResourceDto>,       // matches JSON "results": [ { name, url }, … ]
)

/**
 * One `{ "name": …, "url": … }` entry in the results list (PokéAPI calls this a
 * "named API resource"). The url ends in the Pokédex number, e.g. `.../pokemon/25/`.
 */
@Serializable
data class NamedResourceDto(
    val name: String,                          // "pikachu"
    val url: String,                           // "https://pokeapi.co/api/v2/pokemon/25/"
)

/**
 * The `/pokemon/{name}` detail object — only the fields we render.
 *
 * Units are deliberately odd (a great mapper lesson): `height` is in DECIMETRES and
 * `weight` is in HECTOGRAMS. The mapper converts them to metres / kilograms.
 */
@Serializable
data class PokemonDetailDto(
    val id: Int,                               // National Pokédex number (1 = bulbasaur)
    val name: String,                          // "bulbasaur"
    val height: Int,                           // DECIMETRES on the wire (7 -> 0.7 m)
    val weight: Int,                           // HECTOGRAMS on the wire (69 -> 6.9 kg)
    val types: List<TypeSlotDto>,              // nested array: each entry wraps a type object
)

/** One entry of the detail's `types` array: a slot number + the nested type object. */
@Serializable
data class TypeSlotDto(
    val slot: Int,                             // 1 = primary type, 2 = secondary
    val type: TypeRefDto,                      // the nested { "name": "grass" } object
)

/** The innermost `{ "name": "grass" }` object inside each type slot. */
@Serializable
data class TypeRefDto(
    val name: String,                          // "grass", "poison", "fire", …
)

// ===========================================================================
// DOMAIN MODELS  —  the clean, FLAT shape the UI + ViewModels use  [PROVIDED]
//
// PLAIN data classes: no @Serializable, no nesting, no decimetres, no cryptic
// type wrappers — just UI-ready values. The UI never depends on the API's wire
// format; only the DTOs + the mapper below do.
// ===========================================================================

/** A list-row's worth of data: the Pokédex number + the name. */
data class PokemonSummary(
    val dexNumber: Int,                        // 25
    val name: String,                          // "pikachu"
)

/** The detail screen's data: number, name, types (already emoji+label), size. */
data class PokemonDetail(
    val dexNumber: Int,                        // 25
    val name: String,                          // "pikachu"
    val types: List<PokemonType>,              // [ PokemonType("electric", "⚡") ]
    val heightMeters: Double,                  // 0.4
    val weightKg: Double,                      // 6.0
)

/** One type, already decoded for display: the lowercase name + its emoji glyph. */
data class PokemonType(
    val name: String,                          // "electric"
    val emoji: String,                         // "⚡"
)

// ===========================================================================
// MAPPER  —  the SINGLE place wire-shape becomes app-shape           [YOUR JOB]
//
// >>> PART B4: implement the four functions below. <<<
//
// They currently return SAFE PLACEHOLDERS so the project compiles and the app
// runs on the offline Fake (which builds domain models directly and never calls
// these). The moment you switch to the REAL repository (Part D2), these run on
// real JSON — so implement them, then prove them with the unit tests in Part G.
// ===========================================================================

/**
 * TODO (B4a): parse the trailing Pokédex number out of a PokéAPI resource url.
 *   e.g. "https://pokeapi.co/api/v2/pokemon/25/" -> 25
 * Hint: split on '/', drop blanks, take the last segment, toInt(). Be defensive
 * about the trailing slash. Returning 0 here is just a placeholder.
 */
fun dexNumberFromUrl(url: String): Int {
    // TODO B4a — replace with the real parse
    // Split the URL by slashes, remove any empty strings (like the one after a trailing slash),
    // and take the last piece of the path which is the ID.
    return url.split("/")
        .filter { it.isNotEmpty() }
        .lastOrNull()
        ?.toIntOrNull() ?: 0
}

/**
 * TODO (B4b): map a PokéAPI type NAME to an emoji glyph for the UI (the course's
 * no-icon-library convention). Cover the 18 types; fall back to a neutral glyph
 * (e.g. "❓") for anything unknown so the UI never crashes.
 *   "grass" -> "🌿", "fire" -> "🔥", "water" -> "💧", "electric" -> "⚡", …
 */
fun typeEmoji(typeName: String): String {
    // TODO B4b — replace with a `when (typeName) { … }`
    // Map each official type name to a specific emoji glyph.
    // If the API returns a type we don't know, we return a fallback emoji.
    return when (typeName.lowercase()) {
        "normal" -> "⚪"
        "fire" -> "🔥"
        "water" -> "💧"
        "grass" -> "🌿"
        "electric" -> "⚡"
        "ice" -> "🧊"
        "fighting" -> "🥊"
        "poison" -> "☠️"
        "ground" -> "⛰️"
        "flying" -> "🕊️"
        "psychic" -> "🔮"
        "bug" -> "🐛"
        "rock" -> "🪨"
        "ghost" -> "👻"
        "dragon" -> "🐉"
        "dark" -> "🌑"
        "steel" -> "⚙️"
        "fairy" -> "🧚"
        else -> "❓"
    }
}

/**
 * TODO (B4c): flatten one list entry into a [PokemonSummary].
 * The name is right here; the dex number comes from [dexNumberFromUrl] on the url.
 */
fun NamedResourceDto.toSummary(): PokemonSummary {
    // TODO B4c — use dexNumberFromUrl(url)
    // Convert the "NamedResource" (name + url) into our flat Summary domain model.
    return PokemonSummary(
        dexNumber = dexNumberFromUrl(url),
        name = name
    )
}

/**
 * TODO (B4d): flatten the detail DTO into a [PokemonDetail].
 *   • dexNumber  = id
 *   • types      = each types[].type.name -> PokemonType(name, typeEmoji(name))
 *   • height/10.0 -> metres,  weight/10.0 -> kilograms
 */
fun PokemonDetailDto.toDetail(): PokemonDetail {
    // TODO B4d — replace the placeholders below
    // Flatten the nested detail JSON into the UI-ready domain model.
    // This is where we convert decimetres/hectograms to meters/kilograms.
    return PokemonDetail(
        dexNumber = id,
        name = name,
        types = types.map { slot ->
            val typeName = slot.type.name
            PokemonType(name = typeName, emoji = typeEmoji(typeName))
        },
        heightMeters = height / 10.0,
        weightKg = weight / 10.0,
    )
}
