package com.example.navthreescreen

import androidx.compose.ui.tooling.preview.PreviewParameterProvider

// ===========================================================================
// DATA
// ===========================================================================

/**
 * A top-level grouping shown on the FIRST screen.
 * @param id   — stable unique identifier; this is what travels in the nav key.
 * @param name — short label shown as the category row.
 * @param description — one-line summary shown under the name.
 */
data class Category(val id: Int, val name: String, val description: String)

/**
 * A single planet shown on the SECOND (list) and THIRD (detail) screens.
 * @param id         — stable unique identifier; travels in the detail nav key.
 * @param categoryId — which Category this item belongs to (the "foreign key").
 * @param title      — short name shown as the row/headline.
 * @param blurb      — one-line description shown under the title.
 */
data class Item(val id: Int, val categoryId: Int, val title: String, val blurb: String)

// The two categories rendered on the first screen.
val sampleCategories = listOf(
    Category(1, "Rocky Planets", "Small, dense worlds with solid surfaces."),
    Category(2, "Gas Giants", "Massive planets made mostly of gas."),
)

// The planets rendered on the second screen. Each one's `categoryId` ties it
// back to a Category above (1 = Rocky, 2 = Gas Giant).
val sampleItems = listOf(
    Item(1, 1, "Mercury", "The smallest planet and the closest to the Sun."),
    Item(2, 1, "Venus", "The hottest planet, wrapped in thick clouds of acid."),
    Item(3, 1, "Earth", "The only planet known to support life — so far."),
    Item(4, 1, "Mars", "The red planet, a frequent target for rovers."),
    Item(5, 2, "Jupiter", "The largest planet, a gas giant with a great red spot."),
    Item(6, 2, "Saturn", "The ringed gas giant, second largest in the system."),
)

// --- Lookups ----------------------------------------------------------------

fun categoryById(id: Int): Category = sampleCategories.first { it.id == id }

fun itemById(id: Int): Item = sampleItems.first { it.id == id }

fun itemsInCategory(categoryId: Int): List<Item> =
    sampleItems.filter { it.categoryId == categoryId }

// ===========================================================================
// PREVIEW PROVIDERS
// ===========================================================================

class CategoryPreviewProvider : PreviewParameterProvider<Category> {
    override val values: Sequence<Category> = sampleCategories.asSequence()
}

class ItemPreviewProvider : PreviewParameterProvider<Item> {
    override val values: Sequence<Item> = sampleItems.asSequence()
}
