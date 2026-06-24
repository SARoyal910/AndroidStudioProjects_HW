// =============================================================================
// SyncWorker.kt  —  background sync that survives the screen and the process
//
// CONCEPT: a ViewModel coroutine dies with the screen, so it's the wrong place to push
// data to the cloud. WorkManager's CoroutineWorker runs even after the app is backgrounded
// or killed, waits for the network constraint (set when it's enqueued), and lets us return
// Result.retry() to try again later with backoff. doWork() just delegates to the repository.
// =============================================================================
package com.example.supabasesync.sync

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.example.supabasesync.data.NoteRepository

class SyncWorker(appContext: Context, params: WorkerParameters) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result {
        // The same shared repository the UI uses (Room + cloud).
        val repo = NoteRepository.get(applicationContext)
        return try {
            repo.sync()                 // push the outbox, then pull remote changes
            Result.success()
        } catch (e: Exception) {
            // A network failure (or server error) lands here. Returning retry() asks
            // WorkManager to run us again later with exponential backoff — the local data
            // is safe in Room the whole time, still marked PENDING/FAILED.
            Result.retry()
        }
    }

    companion object {
        /** Unique name so we never pile up duplicate sync jobs. */
        const val NAME = "cloud-sync"
    }
}
