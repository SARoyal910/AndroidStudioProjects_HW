// =============================================================================
// StorageJourneyViewModel.kt  —  THE CONDUCTOR (wires the storage component to the UI)
//
// CONCEPT: the ViewModel is the state holder that survives configuration changes (like
// rotation) and turns persistence Flows into UI state. Here it plays one more role: it is
// where you can read the WHOLE write journey top-to-bottom. Open addItem() and you can
// follow steps 1 -> 4 in order; step 5 (the return trip) happens reactively in the `items`
// Flow below. The in-app Journey panel is just this trace, rendered.
//
// WHAT TO INSPECT HERE:
//   • items     — Room's reactive Flow turned into a cached StateFlow; the .onEach is where
//                 we record the FLOW leg (Room re-emitted -> the screen will recompose).
//   • journey   — the JourneyLog's steps, re-exposed for the UI to render.
//   • addItem() — the write path as readable prose: reset the trace, record UI + ViewModel,
//                 then launch the suspend save (which records Repository + Room).
//   • Factory   — builds the ViewModel with an Application, with no DI library.
// =============================================================================
package com.example.storagejourney

import android.app.Application                                  // app Context source for building the database
import androidx.lifecycle.AndroidViewModel                     // ViewModel that holds an Application reference
import androidx.lifecycle.ViewModel                            // base class (referenced by the Factory type)
import androidx.lifecycle.ViewModelProvider                    // factory interface to construct ViewModels
import androidx.lifecycle.viewModelScope                       // CoroutineScope tied to the ViewModel's lifetime
import com.example.storagejourney.data.ItemDatabase            // Room database singleton (provides the DAO)
import com.example.storagejourney.data.ItemRepository          // the storage component (wraps the DAO)
import com.example.storagejourney.data.StoredItem              // the element that travels into storage
import com.example.storagejourney.journey.JourneyLog           // the observable trace recorder
import com.example.storagejourney.journey.JourneyStage         // which layer a recorded step belongs to
import com.example.storagejourney.journey.JourneyStep          // one recorded moment in the trip
import kotlinx.coroutines.flow.SharingStarted                  // controls WHEN the StateFlow is kept hot
import kotlinx.coroutines.flow.StateFlow                       // observable, always-has-a-value stream for UI
import kotlinx.coroutines.flow.onEach                          // run a side effect on each emission (record the step)
import kotlinx.coroutines.flow.stateIn                         // convert a cold Flow into a hot StateFlow
import kotlinx.coroutines.launch                               // start a coroutine for the suspend writes

// ---------------------------------------------------------------------------
// STATE
// ---------------------------------------------------------------------------

/**
 * ViewModel for the single Storage Journey screen.
 *
 * Extends [AndroidViewModel] so it can get an [Application] Context to build the Room
 * database without leaking an Activity. It owns the persistence wiring and exposes
 * everything the UI needs as [StateFlow]s.
 */
class StorageJourneyViewModel(app: Application) : AndroidViewModel(app) {

    // The shared trace recorder. The repository records its legs into the SAME instance,
    // so the UI sees one coherent journey across all layers.
    private val journeyLog = JourneyLog()

    // Build the storage component: the Room DAO (from the singleton database) wrapped by
    // the repository, which also gets the journey log so it can narrate the write.
    private val repository = ItemRepository(
        dao = ItemDatabase.getInstance(app).itemDao(),
        journey = journeyLog,
    )

    /**
     * The persisted items as UI state — the RETURN TRIP of the journey.
     *
     * We take Room's reactive [Flow] from the repository and:
     *   • .onEach { ... }  — record the FLOW leg every time Room re-emits (this fires once
     *                        when the screen first subscribes, and again after each write).
     *   • .stateIn(...)    — convert the cold Flow into a hot [StateFlow] that always has a
     *                        value and is shared across collectors. WhileSubscribed(5000)
     *                        keeps it hot for 5s after the last collector leaves (surviving
     *                        a quick rotation) and starts with an empty list to render.
     */
    val items: StateFlow<List<StoredItem>> = repository.items
        .onEach { list ->
            journeyLog.record(
                JourneyStage.FLOW,
                "Room re-ran SELECT * FROM items, found ${list.size} row(s), and pushed a " +
                    "new List down the Flow. collectAsStateWithLifecycle turns that into a recomposition.",
            )
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    /**
     * The journey steps, re-exposed for the UI. [JourneyLog.steps] is already a hot
     * [StateFlow] (it always has a current value), so we can hand it through directly.
     */
    val journey: StateFlow<List<JourneyStep>> = journeyLog.steps

    // --- ACTIONS (user intents -> recorded trip -> suspend persistence writes) ----------

    /**
     * Save one element. READ THIS TOP-TO-BOTTOM — it IS the write journey:
     *   1. reset the trace so the panel shows only this element's trip.
     *   2. UI leg        — the Save button captured the text and called this function.
     *   3. ViewModel leg — stamp createdAt, build the [StoredItem], launch a coroutine so
     *                      the suspend write runs off the main thread.
     *   4+. inside the coroutine, [ItemRepository.save] records the Repository + Room legs,
     *       and the [items] Flow above then re-emits, recording the Flow leg (step 5).
     *
     * @param rawLabel whatever is currently in the text field (trimmed; empty is ignored).
     */
    fun addItem(rawLabel: String) {
        val label = rawLabel.trim()
        if (label.isEmpty()) return                            // ignore empty submissions

        journeyLog.reset()                                     // 1. fresh trace for this trip
        journeyLog.record(
            JourneyStage.UI,
            "The Save button captured \"$label\" from the OutlinedTextField and called " +
                "viewModel.addItem(\"$label\").",
        )

        // 3. Stamp metadata in the ViewModel and prepare the element. id stays 0 so SQLite
        //    will assign the real primary key on insert.
        val element = StoredItem(label = label, createdAt = System.currentTimeMillis())
        journeyLog.record(
            JourneyStage.VIEWMODEL,
            "ViewModel built StoredItem(label=\"$label\", createdAt=…) and launched a " +
                "coroutine on viewModelScope so the suspend write never blocks the UI thread.",
        )

        viewModelScope.launch {                                // coroutine -> safe to call suspend save
            repository.save(element)                           // records Repository + Room; then Flow re-emits
        }
    }

    /**
     * Delete one element. We reset the trace and record the UI leg so the panel stays
     * coherent — then the [items] Flow re-emits, recording the Flow leg, proving the
     * reactive read fires on deletes too, not just inserts.
     */
    fun deleteItem(item: StoredItem) {
        journeyLog.reset()
        journeyLog.record(
            JourneyStage.UI,
            "Delete tapped on \"${item.label}\" -> viewModelScope.launch { repository.delete(item) }.",
        )
        viewModelScope.launch { repository.delete(item) }
    }

    /** Wipe all rows ("Clear storage"). Same coherent-trace pattern as [deleteItem]. */
    fun clearAll() {
        journeyLog.reset()
        journeyLog.record(
            JourneyStage.UI,
            "Clear storage tapped -> viewModelScope.launch { repository.clear() } (DELETE FROM items).",
        )
        viewModelScope.launch { repository.clear() }
    }

    /**
     * Factory that constructs [StorageJourneyViewModel] with an [Application].
     *
     * [AndroidViewModel] needs the Application passed in, so we supply a tiny factory rather
     * than pulling in a dependency-injection library for this teaching sample.
     */
    companion object {
        fun factory(app: Application): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T =
                    StorageJourneyViewModel(app) as T
            }
    }
}
