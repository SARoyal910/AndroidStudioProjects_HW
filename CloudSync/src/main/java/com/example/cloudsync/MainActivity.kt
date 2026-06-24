// =============================================================================
// MainActivity.kt  —  an offline-first notes UI driven entirely by LOCAL state
//
// CONCEPT THIS PROJECT TEACHES: cloud storage IN CONJUNCTION WITH Room. The screen never
// touches the network — it reads Room StateFlows (so it works offline and updates the
// instant you type), shows each row's sync status, and an online/offline + "N pending"
// banner. Writes are optimistic (Room first); a background SyncWorker reconciles with the
// cloud when the network allows. Data layer:
//   • data/Note.kt            — entity + DTO + mappers + SyncState
//   • data/NoteDao.kt         — reactive reads + the sync-engine queries
//   • data/CloudApi.kt        — REAL (Retrofit) vs FAKE (offline) cloud + the switch
//   • data/NoteRepository.kt  — optimistic writes + the push/pull sync + last-write-wins
//   • sync/SyncWorker.kt      — background, retryable, network-constrained sync
// =============================================================================
package com.example.cloudsync

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.cloudsync.data.Note
import com.example.cloudsync.data.SyncState
import com.example.cloudsync.ui.theme.CloudSyncTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            CloudSyncTheme {
                val vm: CloudSyncViewModel = viewModel(factory = CloudSyncViewModel.factory(application))
                CloudSyncApp(vm)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CloudSyncApp(vm: CloudSyncViewModel) {
    // Everything the UI shows comes from LOCAL state — no network reads anywhere.
    val notes by vm.notes.collectAsStateWithLifecycle()
    val pending by vm.pendingCount.collectAsStateWithLifecycle()
    val online by vm.isOnline.collectAsStateWithLifecycle()

    // Local form state: when editingId != null we're editing that note, else adding a new one.
    var title by remember { mutableStateOf("") }
    var body by remember { mutableStateOf("") }
    var editingId by remember { mutableStateOf<String?>(null) }
    fun clearForm() { title = ""; body = ""; editingId = null }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = { TopAppBar(title = { Text("CloudSync") }) },
    ) { inner ->
        Column(Modifier.padding(inner).fillMaxSize()) {

            SyncStatusBar(online = online, pending = pending)

            Column(Modifier.padding(16.dp)) {
                OutlinedTextField(title, { title = it }, label = { Text("Title") }, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(6.dp))
                OutlinedTextField(body, { body = it }, label = { Text("Body") }, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = {
                            val id = editingId
                            if (id == null) vm.addNote(title, body) else vm.editNote(id, title, body)
                            clearForm()
                        },
                        enabled = title.isNotBlank(),
                    ) { Text(if (editingId == null) "Add note" else "Save edit") }
                    if (editingId != null) OutlinedButton(onClick = { clearForm() }) { Text("Cancel") }
                }
                Spacer(Modifier.height(10.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = { vm.syncNow() }) { Text("Sync now") }
                    OutlinedButton(onClick = { vm.simulateRemoteEdit() }) { Text("Simulate remote edit") }
                }
            }

            HorizontalDivider()
            Text(
                "Notes (${notes.size})",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
            )
            LazyColumn(Modifier.fillMaxSize().padding(horizontal = 16.dp)) {
                items(notes, key = { it.id }) { note ->
                    NoteCard(
                        note = note,
                        onEdit = { title = note.title; body = note.body; editingId = note.id },
                        onDelete = { vm.deleteNote(note.id) },
                    )
                }
            }
        }
    }
}

/** A thin banner: online/offline + how many local changes haven't reached the cloud yet. */
@Composable
private fun SyncStatusBar(online: Boolean, pending: Int) {
    val bg = if (online) Color(0xFF1B8A5A) else Color(0xFFB56C00)   // green online, amber offline
    val text = buildString {
        append(if (online) "🟢  Online" else "🔴  Offline — changes are queued")
        if (pending > 0) append("   ·   ⏳ $pending pending")
    }
    Text(
        text = text,
        color = Color.White,
        style = MaterialTheme.typography.labelLarge,
        fontWeight = FontWeight.SemiBold,
        modifier = Modifier.fillMaxWidth().background(bg).padding(horizontal = 16.dp, vertical = 8.dp),
    )
}

/** One note row: title, body, a sync badge, tap to edit, plus a Delete button. */
@Composable
fun NoteCard(note: Note, onEdit: () -> Unit, onDelete: () -> Unit) {
    Card(Modifier.fillMaxWidth().padding(vertical = 4.dp).clickable { onEdit() }) {
        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(note.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.width(8.dp))
                    SyncBadge(note.syncState)
                }
                if (note.body.isNotBlank()) Text(note.body, style = MaterialTheme.typography.bodyMedium)
            }
            OutlinedButton(onClick = onDelete) { Text("Delete") }
        }
    }
}

/** The per-row sync status, color-coded. */
@Composable
private fun SyncBadge(state: SyncState) {
    val (label, color) = when (state) {
        SyncState.SYNCED -> "✓ Synced" to Color(0xFF1B8A5A)
        SyncState.PENDING -> "⏳ Pending" to Color(0xFFB56C00)
        SyncState.FAILED -> "⚠ Failed" to Color(0xFFC33D3D)
    }
    Text(label, color = color, style = MaterialTheme.typography.labelSmall, fontFamily = FontFamily.Monospace)
}

// ---------------------------------------------------------------------------
// Preview — the stateless NoteCard renders without a device, a DB, or a network.
// ---------------------------------------------------------------------------
@Preview(showBackground = true, widthDp = 360)
@Composable
fun NoteCardPreview() {
    CloudSyncTheme {
        NoteCard(
            note = Note(id = "1", title = "Buy milk", body = "From the corner shop", updatedAt = 0L, syncState = SyncState.PENDING),
            onEdit = {},
            onDelete = {},
        )
    }
}
