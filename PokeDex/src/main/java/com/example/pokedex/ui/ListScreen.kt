// =============================================================================
// ListScreen.kt  —  the list screen, rendered as a pure function of ListUiState
//
// CONCEPT: the UI is a `when` over the sealed ListUiState — one branch per state,
// so it is impossible to forget one. Loading -> spinner; Error -> message + Retry;
// Success -> a LazyColumn of tappable rows. A tap calls onOpen(name), which the
// nav host turns into a push of DetailKey(name). PROVIDED and working.
// =============================================================================

package com.example.pokedex.ui

import android.app.Application
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.pokedex.ListUiState
import com.example.pokedex.PokemonListViewModel
import com.example.pokedex.PokemonSummary

@OptIn(ExperimentalMaterial3Api::class)             // TopAppBar is still an experimental Material 3 API
@Composable
fun ListScreen(onOpen: (String) -> Unit) {
    // The repository (and thus this VM) may open Room, so it needs the Application.
    val app = LocalContext.current.applicationContext as Application
    val viewModel: PokemonListViewModel = viewModel(factory = PokemonListViewModel.factory(app))
    // Observe the state, pausing collection when the screen isn't visible.
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    Scaffold(
        topBar = { TopAppBar(title = { Text("PokéDex") }) },
    ) { padding ->
        // ONE branch per state — the sealed interface makes this exhaustive.
        when (val s = state) {
            is ListUiState.Loading -> CenterBox(Modifier.padding(padding)) {
                CircularProgressIndicator()
            }

            is ListUiState.Error -> CenterBox(Modifier.padding(padding)) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Couldn't load Pokémon", style = MaterialTheme.typography.titleMedium)
                    Text(s.message, style = MaterialTheme.typography.bodyMedium)
                    Button(onClick = viewModel::refresh, modifier = Modifier.padding(top = 12.dp)) {
                        Text("Retry")
                    }
                }
            }

            is ListUiState.Success -> LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentPadding = androidx.compose.foundation.layout.PaddingValues(12.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                // Stable key = the name, so Compose reuses rows efficiently.
                items(s.pokemon, key = { it.name }) { summary ->
                    PokemonRow(summary = summary, onClick = { onOpen(summary.name) })
                }
            }
        }
    }
}

/** One tappable list row: "#NNN  name". */
@Composable
private fun PokemonRow(summary: PokemonSummary, onClick: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        androidx.compose.foundation.layout.Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable(onClick = onClick)
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "#%03d".format(summary.dexNumber),     // 25 -> "#025"
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.primary,
            )
            Text(
                text = summary.name.replaceFirstChar { it.uppercase() },   // "pikachu" -> "Pikachu"
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(start = 14.dp),
            )
        }
    }
}

/** Small helper: center its content in the available space. */
@Composable
private fun CenterBox(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) { content() }
}
