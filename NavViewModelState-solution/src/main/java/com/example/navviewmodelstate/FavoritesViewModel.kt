// =============================================================================
// FavoritesViewModel.kt
//
// THE STAR OF THIS SAMPLE. This file holds the screen STATE and the LOGIC that
// mutates it OUTSIDE of any composable, inside an androidx.lifecycle.ViewModel.
//
// WHY A ViewModel AT ALL?  (remember vs. rememberSaveable vs. ViewModel)
// -----------------------------------------------------------------------------
// Compose gives you several ways to "hold" state. They differ in WHAT they
// survive:
//
//   remember { ... }
//     • Survives:    recomposition (Compose re-running your function).
//     • LOST on:     configuration change (e.g. screen ROTATION), because
//                    rotation destroys & recreates the Activity, throwing away
//                    the whole composition (and everything remembered in it).
//     • LOST on:     process death (system kills the app in the background).
//
//   rememberSaveable { ... }
//     • Survives:    recomposition AND configuration change (rotation) AND
//                    process death — it writes the value into the saved-instance
//                    Bundle, so Android can restore it.
//     • Limited to:  things that fit in a Bundle (primitives, Parcelable, etc.).
//                    Great for small UI state like a counter or text-field value.
//
//   ViewModel  (this file)
//     • Survives:    recomposition AND configuration change (ROTATION) AND even
//                    navigating away and back, because the ViewModel is scoped to
//                    a ViewModelStoreOwner (the Activity / nav entry), NOT to the
//                    composition. When rotation recreates the Activity, the
//                    framework RE-ATTACHES the SAME ViewModel instance instead of
//                    building a new one.
//     • LOST on:     process death — UNLESS you also use a SavedStateHandle
//                    (see the note in the ViewModel below). Plain in-memory
//                    ViewModel fields are gone if the OS kills the process.
//     • Best for:    screen-level state + business logic + async work that should
//                    outlive a single composition.
//
// WHY does the ViewModel survive rotation while `remember` does not?
// -----------------------------------------------------------------------------
// A ViewModel is stored in a ViewModelStore owned by the Activity. During a
// configuration change Android calls Activity.onRetainNonConfigurationInstance()
// under the hood and HANDS THE SAME ViewModelStore to the freshly-recreated
// Activity. So the recreated Activity asks for FavoritesViewModel and gets back
// the EXACT instance it had before rotation — with the favorites set intact.
// A `remember {}` value, by contrast, lives only in the composition that the old
// Activity threw away, so it is reconstructed from scratch (back to its initial
// value) after rotation.
//
// UNIDIRECTIONAL DATA FLOW (UDF) — the pattern this sample teaches
// -----------------------------------------------------------------------------
//   1. STATE flows DOWN:   ViewModel exposes immutable state (a StateFlow) that
//                          the UI observes and renders.
//   2. EVENTS flow UP:     the UI calls plain functions on the ViewModel
//                          (here: toggleFavorite(id)) in response to user taps.
//   3. The ViewModel is the SINGLE SOURCE OF TRUTH: it updates its private
//      MutableStateFlow, the new value emits, and the observing UI recomposes.
//
//   UI  --(event: toggleFavorite)-->  ViewModel  --(new state emits)-->  UI
//      ^___________________________________________________________________|
//
// The composables never own or mutate the favorites set directly; they only
// READ state and REPORT events. That is what makes the screen testable and what
// makes the state survive things composables cannot survive on their own.
// =============================================================================

// Package — same namespace as MainActivity so no import is needed to use this VM.
package com.example.navviewmodelstate

// --- AndroidX Lifecycle import ------------------------------------------------
import androidx.lifecycle.ViewModel                          // base class whose instances outlive config changes

// --- Kotlin coroutines Flow imports ------------------------------------------
import kotlinx.coroutines.flow.MutableStateFlow              // a writable, observable state holder (always has a value)
import kotlinx.coroutines.flow.StateFlow                     // the read-only view of that state we expose to the UI
import kotlinx.coroutines.flow.asStateFlow                   // exposes a MutableStateFlow as a read-only StateFlow
import kotlinx.coroutines.flow.update                        // atomically computes the next value from the current one

/**
 * FavoritesViewModel — owns the set of "favorited" planet ids and the only logic
 * allowed to change it.
 *
 * State design:
 *   • [_favorites] is PRIVATE and MUTABLE — only this ViewModel may write it.
 *   • [favorites]  is PUBLIC and READ-ONLY (a [StateFlow]) — the UI may only read
 *     it. This encapsulation is the whole point: the UI cannot reach in and
 *     mutate the set; it must go through [toggleFavorite], keeping the ViewModel
 *     the single source of truth.
 *
 * The value type is `Set<Int>` (planet ids). A Set makes "is this favorited?" an
 * O(1) `contains` check and makes toggling trivial.
 *
 * NOTE ON PROCESS-DEATH SURVIVAL:
 *   This plain ViewModel keeps [_favorites] in memory, so it survives rotation
 *   and navigation but NOT process death. To also survive process death you would
 *   inject a `SavedStateHandle` into the constructor and back the state with it,
 *   e.g.:
 *
 *       class FavoritesViewModel(
 *           private val state: SavedStateHandle      // <- provided by the framework
 *       ) : ViewModel() {
 *           val favorites: StateFlow<Set<Int>> =
 *               state.getStateFlow("favorites", emptySet())
 *           fun toggleFavorite(id: Int) {
 *               val current = favorites.value
 *               state["favorites"] = if (id in current) current - id else current + id
 *           }
 *       }
 *
 *   The SavedStateHandle persists into the saved-instance Bundle, so the favorites
 *   would be restored even after the OS reclaims the process. We keep the simpler
 *   in-memory version here to focus on the rotation/navigation story.
 */
class FavoritesViewModel : ViewModel() {
    // WHAT THIS ViewModel HOLDS — AND WHAT IT DOES NOT:
    // This VM owns exactly ONE piece of state: the set of favorited planet ids
    // (below). It is NOT a store of "all the screens' state". It is shared across
    // screens only because every screen obtains the SAME instance (viewModel() in
    // MainActivity, scoped to the Activity), so they all read/write one favorites
    // set — a ★ toggled on Detail then shows up on Items.
    //
    // The rest of the app's state lives elsewhere, on purpose:
    //   • which screen you are on / the back stack -> rememberNavBackStack(...) in MainActivity
    //   • which category or item a screen shows     -> the nav KEY (ItemsKey.categoryId, DetailKey.itemId)
    //   • the planet / category data                -> the static sampleItems / sampleCategories lists
    //   • transient UI bits (scroll, text fields)   -> remember / rememberSaveable in the composable
    // Centralize in a ViewModel only the state screens must AGREE on and that must
    // survive rotation/navigation — here, just the favorites.

    // PRIVATE, MUTABLE source of truth. Seeded with an empty set (no favorites).
    // A MutableStateFlow ALWAYS holds a current value and emits a new one to every
    // collector whenever `.value` changes — perfect for observable screen state.
    private val _favorites = MutableStateFlow<Set<Int>>(emptySet())

    // PUBLIC, READ-ONLY view the UI observes. `asStateFlow()` hands out the same
    // underlying state but typed as StateFlow, so callers can READ/collect it but
    // cannot cast it back and write to it. State flows DOWN to the UI through this.
    val favorites: StateFlow<Set<Int>> = _favorites.asStateFlow()

    /**
     * toggleFavorite — the single EVENT the UI sends UP to flip a planet's
     * favorite status. This is the only place the favorites set is mutated.
     *
     * `update { }` reads the current set and atomically stores the next one:
     *   • if [id] is already favorited -> remove it (unfavorite),
     *   • otherwise                    -> add it (favorite).
     * Producing a brand-new Set each time (current - id / current + id) keeps the
     * state IMMUTABLE, so Compose reliably detects the change and recomposes.
     *
     * @param id the planet id whose favorite status should be toggled.
     */
    fun toggleFavorite(id: Int) {
        _favorites.update { current ->
            if (id in current) current - id else current + id  // remove if present, else add
        }
    }

    // B1 — the SECOND event the UI can send up (the first was toggleFavorite).
    // Clearing the favorites set is a MUTATION, so by the single-source-of-truth
    // rule it MUST live here on the ViewModel — never inside a composable. The
    // stateless ItemsScreen will merely REPORT this event up (onClearFavorites);
    // this function is the only place that actually empties the set.
    /**
     * clearFavorites — wipes every favorite at once.
     *
     * Uses the exact same atomic `update { }` pattern as [toggleFavorite]: it
     * swaps in a brand-new, EMPTY set. Producing a fresh immutable `emptySet()`
     * (rather than mutating the existing set in place) is what lets Compose
     * reliably detect the change and recompose every screen observing this flow —
     * so all the ★ indicators and the Categories count drop to zero together.
     */
    fun clearFavorites() {
        _favorites.update { emptySet() }                       // same atomic update pattern as toggleFavorite
    }

    // B4 — a SECOND, INDEPENDENT piece of shared state, built with the exact same
    // recipe as favorites above: a private MutableStateFlow as the writable source
    // of truth, plus a public read-only StateFlow the UI observes. This one tracks
    // which planets the user has actually OPENED (drilled into on the detail screen).
    // Like favorites, it is centralized here because every screen must AGREE on it
    // and it must survive rotation/navigation.

    // PRIVATE, MUTABLE source of truth for the visited ids. Seeded empty (nothing
    // visited yet). Only this ViewModel may write it.
    private val _visited = MutableStateFlow<Set<Int>>(emptySet())  // private, mutable source of truth

    // PUBLIC, READ-ONLY view the UI observes. `asStateFlow()` hands out the same
    // underlying state typed as StateFlow, so callers can READ/collect but not write.
    val visited: StateFlow<Set<Int>> = _visited.asStateFlow()       // public, read-only view for the UI

    /**
     * markVisited — records that the user has opened planet [id].
     *
     * Unlike [toggleFavorite], this event only ever ADDS — there is no "un-visit".
     * Because the value is a Set, adding an id that is ALREADY present is a harmless
     * no-op (the set is unchanged), which makes calling this repeatedly (e.g. every
     * time the detail recomposes) idempotent and safe. We still guard against
     * spamming it on recomposition by calling it from a LaunchedEffect keyed on the
     * item id (see DetailRoute), so it runs once per planet shown.
     *
     * @param id the planet id that was just opened.
     */
    fun markVisited(id: Int) {
        _visited.update { it + id }                            // adding an existing id to a Set is a harmless no-op
    }
}
