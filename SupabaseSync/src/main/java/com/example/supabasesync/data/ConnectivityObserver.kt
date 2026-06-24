// =============================================================================
// ConnectivityObserver.kt  —  is the device online? as a reactive Flow
//
// CONCEPT: offline-first doesn't NEED this to be correct (WorkManager's network
// constraint already defers sync until there's a connection, and the UI reads Room
// regardless). But surfacing connectivity lets the UI show an honest "Offline — N pending"
// banner. We wrap ConnectivityManager's callbacks in a callbackFlow so the screen can
// collectAsStateWithLifecycle() it like any other Flow.
// =============================================================================
package com.example.supabasesync.data

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.distinctUntilChanged

class ConnectivityObserver(context: Context) {

    private val cm = context.applicationContext.getSystemService(ConnectivityManager::class.java)

    /** Emits true while a network with INTERNET capability is available, false otherwise. */
    val isOnline: Flow<Boolean> = callbackFlow {
        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) { trySend(true) }
            override fun onLost(network: Network) { trySend(currentlyOnline()) }
            override fun onCapabilitiesChanged(network: Network, caps: NetworkCapabilities) {
                trySend(caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET))
            }
        }
        trySend(currentlyOnline())                          // emit the current state immediately
        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
        cm?.registerNetworkCallback(request, callback)
        awaitClose { cm?.unregisterNetworkCallback(callback) }   // clean up when no one collects
    }.distinctUntilChanged()

    fun currentlyOnline(): Boolean {
        val caps = cm?.getNetworkCapabilities(cm.activeNetwork) ?: return false
        return caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }
}
