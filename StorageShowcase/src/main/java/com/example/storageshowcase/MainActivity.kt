// =============================================================================
// MainActivity.kt  —  the UI: one tab per storage technique
//
// CONCEPT: a single screen with four tabs, each demonstrating a different on-device
// storage mechanism, all wired through StorageViewModel:
//   • Notes    — Room (structured/relational: entity, DAO, reactive Flow, relation)
//   • Settings — Preferences DataStore (dark theme + sort order)
//   • Profile  — Typed DataStore (a JSON-serialized UserProfile object)
//   • Files    — internal file storage (filesDir scratch note + cacheDir)
// Everything you change survives an app restart because it is written to disk.
// The whole UI reads ViewModel StateFlows via collectAsStateWithLifecycle().
// =============================================================================
package com.example.storageshowcase

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Checkbox
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.storageshowcase.data.Category
import com.example.storageshowcase.data.Note
import com.example.storageshowcase.data.Priority
import com.example.storageshowcase.data.SortOrder
import com.example.storageshowcase.ui.theme.StorageShowcaseTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val vm: StorageViewModel = viewModel(factory = StorageViewModel.factory(application))
            // Drive the theme from the PERSISTED Preferences-DataStore dark-theme flag.
            val darkTheme by vm.darkTheme.collectAsStateWithLifecycle()
            StorageShowcaseTheme(darkTheme = darkTheme, dynamicColor = false) {
                StorageShowcaseApp(vm)
            }
        }
    }
}

private enum class Tab(val title: String, val icon: String) {
    NOTES("Notes", "🗃️"), SETTINGS("Settings", "⚙️"), PROFILE("Profile", "🧑"), FILES("Files", "📁")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StorageShowcaseApp(vm: StorageViewModel) {
    var tab by remember { mutableStateOf(Tab.NOTES) }
    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = { TopAppBar(title = { Text("Storage Showcase") }) },
        bottomBar = {
            NavigationBar {
                Tab.entries.forEach { t ->
                    NavigationBarItem(
                        selected = tab == t,
                        onClick = { tab = t },
                        icon = { Text(t.icon) },
                        label = { Text(t.title) },
                    )
                }
            }
        },
    ) { inner ->
        Column(Modifier.padding(inner).fillMaxSize()) {
            when (tab) {
                Tab.NOTES -> NotesTab(vm)
                Tab.SETTINGS -> SettingsTab(vm)
                Tab.PROFILE -> ProfileTab(vm)
                Tab.FILES -> FilesTab(vm)
            }
        }
    }
}

// ---------------------------------------------------------------------------
// NOTES tab — Room (entity, DAO, reactive Flow, foreign-key relation)
// ---------------------------------------------------------------------------
@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun NotesTab(vm: StorageViewModel) {
    val notes by vm.notes.collectAsStateWithLifecycle()
    val categories by vm.categories.collectAsStateWithLifecycle()

    var title by remember { mutableStateOf("") }
    var body by remember { mutableStateOf("") }
    var tagsText by remember { mutableStateOf("") }
    var priority by remember { mutableStateOf(Priority.NORMAL) }
    var selectedCategoryId by remember { mutableStateOf<Long?>(null) }

    // Default the selected category to the first one once categories load.
    LaunchedEffect(categories) {
        if (selectedCategoryId == null || categories.none { it.id == selectedCategoryId }) {
            selectedCategoryId = categories.firstOrNull()?.id
        }
    }
    val categoryName = remember(categories) { categories.associate { it.id to it.name } }

    Column(Modifier.fillMaxSize().padding(16.dp)) {
        // category chooser
        if (categories.isNotEmpty()) {
            FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                categories.forEach { cat ->
                    FilterChip(
                        selected = selectedCategoryId == cat.id,
                        onClick = { selectedCategoryId = cat.id },
                        label = { Text(cat.name) },
                    )
                }
            }
            Spacer(Modifier.height(8.dp))
        }
        OutlinedTextField(title, { title = it }, label = { Text("Title") }, modifier = Modifier.fillMaxWidth())
        Spacer(Modifier.height(6.dp))
        OutlinedTextField(body, { body = it }, label = { Text("Body") }, modifier = Modifier.fillMaxWidth())
        Spacer(Modifier.height(6.dp))
        OutlinedTextField(tagsText, { tagsText = it }, label = { Text("Tags (comma-separated)") }, modifier = Modifier.fillMaxWidth())
        Spacer(Modifier.height(6.dp))
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("Priority:", style = MaterialTheme.typography.labelLarge)
            Priority.entries.forEach { p ->
                FilterChip(selected = priority == p, onClick = { priority = p }, label = { Text(p.name) })
            }
        }
        Spacer(Modifier.height(8.dp))
        Button(
            onClick = {
                val catId = selectedCategoryId ?: return@Button
                val tags = tagsText.split(",").map { it.trim() }.filter { it.isNotEmpty() }
                vm.addNote(title, body, catId, tags, priority)
                title = ""; body = ""; tagsText = ""; priority = Priority.NORMAL
            },
            enabled = title.isNotBlank() && selectedCategoryId != null,
            modifier = Modifier.fillMaxWidth(),
        ) { Text("Add note (Room INSERT)") }

        Spacer(Modifier.height(12.dp))
        Text("Persisted notes (${notes.size})", style = MaterialTheme.typography.titleMedium)
        HorizontalDivider()
        LazyColumn(Modifier.fillMaxSize()) {
            items(notes, key = { it.id }) { note ->
                NoteCard(
                    note = note,
                    categoryName = categoryName[note.categoryId] ?: "?",
                    onToggleDone = { vm.toggleDone(note) },
                    onDelete = { vm.deleteNote(note) },
                )
            }
        }
    }
}

@Composable
fun NoteCard(note: Note, categoryName: String, onToggleDone: () -> Unit, onDelete: () -> Unit) {
    Card(Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Checkbox(checked = note.done, onCheckedChange = { onToggleDone() })
            Spacer(Modifier.width(8.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    note.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    textDecoration = if (note.done) TextDecoration.LineThrough else null,
                )
                if (note.body.isNotBlank()) Text(note.body, style = MaterialTheme.typography.bodyMedium)
                Text(
                    "📂 $categoryName · ${note.priority.name}" +
                        if (note.tags.isNotEmpty()) " · #${note.tags.joinToString(" #")}" else "",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            OutlinedButton(onClick = onDelete) { Text("Delete") }
        }
    }
}

// ---------------------------------------------------------------------------
// SETTINGS tab — Preferences DataStore
// ---------------------------------------------------------------------------
@Composable
fun SettingsTab(vm: StorageViewModel) {
    val darkTheme by vm.darkTheme.collectAsStateWithLifecycle()
    val sortOrder by vm.sortOrder.collectAsStateWithLifecycle()
    val count by vm.noteCount.collectAsStateWithLifecycle()

    Column(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text("Preferences DataStore", style = MaterialTheme.typography.titleLarge)
        Text("These settings are written to a settings.preferences_pb file and survive restart.",
            style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("Dark theme", Modifier.weight(1f))
            Switch(checked = darkTheme, onCheckedChange = { vm.setDarkTheme(it) })
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("Notes sort order", Modifier.weight(1f))
            Button(onClick = { vm.cycleSortOrder() }) {
                Text(if (sortOrder == SortOrder.NEWEST_FIRST) "Newest first" else "Title A–Z")
            }
        }
        HorizontalDivider()
        Text("Room reports $count persisted note(s) via a reactive COUNT(*) Flow.",
            style = MaterialTheme.typography.bodyMedium)
    }
}

// ---------------------------------------------------------------------------
// PROFILE tab — Typed (JSON) DataStore
// ---------------------------------------------------------------------------
@Composable
fun ProfileTab(vm: StorageViewModel) {
    val profile by vm.profile.collectAsStateWithLifecycle()
    var name by remember(profile.displayName) { mutableStateOf(profile.displayName) }

    Column(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text("Typed DataStore", style = MaterialTheme.typography.titleLarge)
        Text("One @Serializable UserProfile object stored as JSON (type-safe, not loose keys).",
            style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        OutlinedTextField(name, { name = it }, label = { Text("Display name") }, modifier = Modifier.fillMaxWidth())
        Button(onClick = { vm.setDisplayName(name) }, enabled = name != profile.displayName) { Text("Save name") }
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("Accent:")
            (0..4).forEach { seed ->
                FilterChipAccent(selected = profile.accentSeed == seed, label = "$seed", onClick = { vm.setAccent(seed) })
            }
        }
        HorizontalDivider()
        Text("Notes created (kept in the profile object): ${profile.notesCreated}",
            style = MaterialTheme.typography.bodyMedium)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FilterChipAccent(selected: Boolean, label: String, onClick: () -> Unit) {
    FilterChip(selected = selected, onClick = onClick, label = { Text(label) })
}

// ---------------------------------------------------------------------------
// FILES tab — internal file storage (filesDir + cacheDir)
// ---------------------------------------------------------------------------
@Composable
fun FilesTab(vm: StorageViewModel) {
    val scratch by vm.scratch.collectAsStateWithLifecycle()
    val info by vm.fileInfo.collectAsStateWithLifecycle()

    Column(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Internal file storage", style = MaterialTheme.typography.titleLarge)
        Text("A scratch note written to filesDir (persists, gone on uninstall) and a cacheDir blob (evictable).",
            style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        OutlinedTextField(
            value = scratch,
            onValueChange = { vm.onScratchChange(it) },
            label = { Text("Scratch note") },
            modifier = Modifier.fillMaxWidth().height(140.dp),
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = { vm.saveScratch() }) { Text("Save to filesDir") }
            OutlinedButton(onClick = { vm.writeCacheBlob() }) { Text("Write cache blob") }
            OutlinedButton(onClick = { vm.clearCache() }) { Text("Clear cache") }
        }
        HorizontalDivider()
        AssistChip(onClick = {}, label = { Text("scratch: ${info.scratchBytes} B") })
        AssistChip(onClick = {}, label = { Text("cache: ${info.cacheBytes} B") })
        Text(info.path, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

// ---------------------------------------------------------------------------
// Preview — the stateless NoteCard renders without a device or a database.
// ---------------------------------------------------------------------------
@Preview(showBackground = true, widthDp = 360)
@Composable
fun NoteCardPreview() {
    StorageShowcaseTheme(darkTheme = false, dynamicColor = false) {
        NoteCard(
            note = Note(id = 1, title = "Buy groceries", body = "Milk, eggs", categoryId = 1,
                priority = Priority.HIGH, tags = listOf("home", "urgent")),
            categoryName = "Inbox",
            onToggleDone = {},
            onDelete = {},
        )
    }
}

@Suppress("unused")
private val previewCategory = Category(id = 1, name = "Inbox")
