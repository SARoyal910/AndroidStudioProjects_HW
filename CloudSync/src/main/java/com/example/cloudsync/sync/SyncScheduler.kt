// =============================================================================
// SyncScheduler.kt  —  enqueue the SyncWorker with the right constraints
//
// CONCEPT: this is where "offline just queues" actually happens. Every local write asks for
// a sync, but the request carries a NetworkType.CONNECTED constraint — so WorkManager runs
// it immediately when online and DEFERS it (without losing it) when offline, firing it the
// moment connectivity returns. Backoff handles transient server failures.
// =============================================================================
package com.example.cloudsync.sync

import android.content.Context
import androidx.work.BackoffPolicy
import androidx.work.Constraints
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

object SyncScheduler {

    /** Ask for a sync as soon as the network constraint allows (now if online, later if not). */
    fun requestSync(context: Context) {
        val request = OneTimeWorkRequestBuilder<SyncWorker>()
            .setConstraints(
                Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)   // only run with a connection
                    .build()
            )
            .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
            .build()

        WorkManager.getInstance(context).enqueueUniqueWork(
            SyncWorker.NAME,
            // Replace a queued run, or append after a running one, so a write made mid-sync
            // is never missed — but we never accumulate a backlog of identical jobs.
            ExistingWorkPolicy.APPEND_OR_REPLACE,
            request,
        )
    }
}
