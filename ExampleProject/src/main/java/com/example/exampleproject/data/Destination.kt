// =============================================================================
// data/Destination.kt  —  the DATA layer
//
// This file is the app's "model": the shape of one item of data, the starter
// data the app opens with, and a tiny formatting helper. It has no Compose or
// Android UI code — keeping data separate from UI is the first and most important
// split in a real project, because the model can then be tested and reused
// without dragging the whole UI along.
//
// The one library annotation here is @Serializable: it lets us turn a Destination
// (and a whole list of them) into JSON text and back, which is what the storage
// layer in data/storage/ uses to save to the device and "the cloud".
//
// In a real app the starter list below would come from a database (Room) or a
// network call (Retrofit) behind a "repository"; here a hardcoded list is enough,
// and the Add screen lets the user grow it at runtime.
// =============================================================================
package com.example.exampleproject.data

import kotlinx.serialization.Serializable                   // lets us JSON-encode a Destination for storage

// A Destination is one place you'd like to visit.
//
//   • id         — stable unique identifier; this is what travels in the nav key.
//   • name       — the place ("Kyoto").
//   • country    — the country it's in ("Japan").
//   • continent  — used to group places on the Stats screen.
//   • emoji      — a tiny stand-in for a photo (keeps the app dependency-free).
//   • blurb      — one-line description shown on the list rows.
//   • bestSeason — when to go (shown on the detail screen).
//   • notes      — a longer description shown only on the detail screen.
//   • priority   — an "excitement" rating from 1–5 (set by the Add slider).
//   • visited    — whether you've been there yet (toggled on list + detail).
//
// Notice every field is a `val`: a Destination is IMMUTABLE. To "change" one
// (e.g. flip `visited`) we don't mutate it — we replace it in the list with a
// `.copy(visited = …)`. Immutable data + an observable list is the idiomatic
// Compose way to model changing state.
//
// @Serializable (from kotlinx.serialization) generates the code to convert this
// class to/from JSON, so the storage layer can persist it.
@Serializable
data class Destination(
    val id: Int,
    val name: String,
    val country: String,
    val continent: String,
    val emoji: String,
    val blurb: String,
    val bestSeason: String,
    val notes: String,
    val priority: Int,
    val visited: Boolean,
)

// The continents offered as single-select chips on the Add screen, and used to
// group places on the Stats screen. (Top-level `val`, so other files can read it.)
val CONTINENTS = listOf(
    "Africa", "Asia", "Europe", "North America", "Oceania", "South America",
)

// The starter list the app opens with. The user can add to it (Add screen) and
// remove from it (Detail screen). Two places start out already `visited = true`
// so the progress bar isn't empty on first launch.
val initialDestinations = listOf(
    Destination(
        id = 1, name = "Kyoto", country = "Japan", continent = "Asia", emoji = "⛩️",
        blurb = "Temples, gardens, and old geisha districts.",
        bestSeason = "Spring (cherry blossoms) or autumn (maple leaves).",
        notes = "Wander Fushimi Inari's torii gates at dawn, then slow down in the " +
            "Arashiyama bamboo grove. Kyoto rewards an unhurried pace.",
        priority = 5, visited = true,
    ),
    Destination(
        id = 2, name = "Santorini", country = "Greece", continent = "Europe", emoji = "🌅",
        blurb = "White-washed cliffs above a blue caldera.",
        bestSeason = "Late spring or early autumn (fewer crowds).",
        notes = "Sunsets in Oia draw a crowd for a reason. Stay a night to catch the " +
            "village after the day-trippers leave.",
        priority = 4, visited = false,
    ),
    Destination(
        id = 3, name = "Banff", country = "Canada", continent = "North America", emoji = "🏔️",
        blurb = "Turquoise lakes deep in the Canadian Rockies.",
        bestSeason = "Summer for hiking, winter for skiing.",
        notes = "Lake Louise and Moraine Lake glow an unreal blue from glacial rock " +
            "flour. Arrive early — parking fills fast.",
        priority = 4, visited = false,
    ),
    Destination(
        id = 4, name = "Marrakech", country = "Morocco", continent = "Africa", emoji = "🕌",
        blurb = "A maze of souks, palaces, and spice markets.",
        bestSeason = "Spring or autumn (mild temperatures).",
        notes = "Get pleasantly lost in the medina, then escape the heat in the cool " +
            "tilework of the Bahia Palace.",
        priority = 3, visited = false,
    ),
    Destination(
        id = 5, name = "Queenstown", country = "New Zealand", continent = "Oceania", emoji = "🪂",
        blurb = "Adventure capital beside Lake Wakatipu.",
        bestSeason = "Summer (Dec–Feb) for the outdoors.",
        notes = "Bungee, paraglide, or just ride the gondola for the view. The Routeburn " +
            "Track is a short drive away.",
        priority = 5, visited = true,
    ),
    Destination(
        id = 6, name = "Reykjavík", country = "Iceland", continent = "Europe", emoji = "🌋",
        blurb = "Northern lights, geysers, and lava fields.",
        bestSeason = "Winter for auroras, summer for the midnight sun.",
        notes = "Base here and day-trip the Golden Circle. In winter, drive out of the " +
            "city lights for the best aurora odds.",
        priority = 4, visited = false,
    ),
    Destination(
        id = 7, name = "Cusco", country = "Peru", continent = "South America", emoji = "🦙",
        blurb = "Gateway to Machu Picchu and the Sacred Valley.",
        bestSeason = "Dry season (May–September).",
        notes = "Spend two days acclimatizing to the altitude before the trek. The city " +
            "itself blends Inca walls with colonial plazas.",
        priority = 5, visited = false,
    ),
    Destination(
        id = 8, name = "Cape Town", country = "South Africa", continent = "Africa", emoji = "🏖️",
        blurb = "Table Mountain meets two oceans.",
        bestSeason = "Summer (Nov–Mar).",
        notes = "Hike or cable-car up Table Mountain on a clear morning before the " +
            "'tablecloth' of cloud rolls in.",
        priority = 3, visited = false,
    ),
)

// A tiny helper: render a 1–5 priority as filled/empty stars for display,
// e.g. priority 4 -> "★★★★☆". Pure formatting, no state — which is exactly why it
// belongs next to the model rather than inside a screen.
fun priorityStars(priority: Int): String =
    "★".repeat(priority) + "☆".repeat(5 - priority)
