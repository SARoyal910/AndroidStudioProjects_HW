// =============================================================================
// CachedPokemon.kt  —  THE ROOM ENTITY (the offline-cache table)
//
// CONCEPT: LOCAL PERSISTENCE with Room — the same as RoomAndPreferences' Note.kt,
// here used as an OFFLINE CACHE. Every Pokémon fetched from PokéAPI is written to
// this table so the list (and any detail you've opened) survive going offline and
// reopening the app. PokéAPI explicitly asks apps to cache rather than re-fetch —
// so this table is part of using the API correctly, not just polish.
//
// WHAT TO INSPECT:
//   • @Entity            — marks this class as the SQLite table "cached_pokemon".
//   • @PrimaryKey        — the natural key is the Pokémon's name (unique per row).
//   • nullable columns   — the summary columns (dexNumber, name) are always known;
//                          the detail columns (height/weight/types) stay NULL until
//                          that Pokémon's detail has been fetched ("partial cache,
//                          hydrate on demand").
// =============================================================================

package com.example.pokedex.data

import androidx.room.Entity      // marks a class as a Room table (one row == one object)
import androidx.room.PrimaryKey  // marks the field that uniquely identifies each row

/**
 * One cached Pokémon — ONE ROW in the SQLite "cached_pokemon" table.
 *
 * @property name        primary key — the Pokémon's lowercase name ("pikachu").
 * @property dexNumber   the National Pokédex number (known from the list call).
 * @property heightMeters detail field; NULL until the detail has been fetched.
 * @property weightKg     detail field; NULL until the detail has been fetched.
 * @property typesCsv     detail field; the types joined as one string ("electric"),
 *                        NULL until fetched. Stored as a String to avoid needing a
 *                        @TypeConverter for this first cut (split on ',' to read back).
 */
@Entity(tableName = "cached_pokemon")
data class CachedPokemon(
    @PrimaryKey val name: String,              // natural key: names are unique in PokéAPI
    val dexNumber: Int,                        // always known from the list summary
    val heightMeters: Double? = null,          // detail-only; NULL until /pokemon/{name} is fetched
    val weightKg: Double? = null,              // detail-only
    val typesCsv: String? = null,              // detail-only; e.g. "grass,poison"
)
