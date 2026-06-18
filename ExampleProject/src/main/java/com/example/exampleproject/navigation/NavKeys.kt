// =============================================================================
// navigation/NavKeys.kt  —  the navigation KEYS
//
// Each screen is identified by a "key". A key both NAMES a destination AND
// carries that destination's arguments. Navigation 3 requires keys to implement
// NavKey and (so the back stack can be saved across process death) be
// @Serializable.
//
// Keeping the keys in their own small file makes the set of destinations easy to
// see at a glance, and lets every screen + the nav host import the same type.
//
//   • ExploreKey / AddKey / StatsKey are the three tab ROOTS — each a data
//     OBJECT, because there is exactly one of each and they carry no arguments.
//   • DetailKey is a data CLASS because each detail screen differs by WHICH place
//     it shows; it carries that place's id as its only argument.
// =============================================================================
package com.example.exampleproject.navigation

import androidx.navigation3.runtime.NavKey                  // marker interface every navigation key implements
import kotlinx.serialization.Serializable                   // makes Nav3 keys serializable (required by Nav3)

// --- Explore tab keys -------------------------------------------------------
// `data object` = a singleton; there is only one Explore list screen.
@Serializable
data object ExploreKey : NavKey                             // Explore root: the list of places

// `data class` because each detail screen differs by which place's id it carries.
// This is the ONLY screen reached by drilling down (it sits ON TOP of ExploreKey
// in the Explore tab's back stack), making the Explore tab two levels deep.
@Serializable
data class DetailKey(val destinationId: Int) : NavKey      // Explore level 2: one place's detail

// --- Add tab key ------------------------------------------------------------
// `data object` = a singleton; the Add tab is a single form screen.
@Serializable
data object AddKey : NavKey                                 // Add root: the new-place form

// --- Stats tab key ----------------------------------------------------------
// `data object` = a singleton; the Stats tab is a single screen.
@Serializable
data object StatsKey : NavKey                               // Stats root: totals + settings

// --- Play tab keys ----------------------------------------------------------
// The Play tab has its OWN drill-down: a menu (PlayKey) that opens one of two
// mini-games. So, like Explore, the Play tab's back stack can be two deep —
// another reminder that each tab keeps its own history.
@Serializable
data object PlayKey : NavKey                                // Play root: the games menu

@Serializable
data object FlashcardKey : NavKey                           // Play level 2: the flip-card deck

@Serializable
data object GuessKey : NavKey                               // Play level 2: the tap-to-guess game
