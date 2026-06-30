// =============================================================================
// DetailScreen.kt  —  one Pokémon, rendered as a pure function of DetailUiState
//
// Same three-state `when` as the list, for a single Pokémon loaded BY NAME. The
// name arrives from the nav key; a LaunchedEffect(name) tells the ViewModel to
// load it (and reload if you navigate to a different Pokémon). Types are shown as
// emoji chips — the course's no-icon-library convention. PROVIDED and working.
// =============================================================================

package com.example.pokedex.ui

import android.app.Application
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.pokedex.DetailUiState
import com.example.pokedex.PokemonDetail
import com.example.pokedex.PokemonDetailViewModel
import com.example.pokedex.PokemonType

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DetailScreen(name: String, onBack: () -> Unit) {
    val app = LocalContext.current.applicationContext as Application
    val viewModel: PokemonDetailViewModel = viewModel(factory = PokemonDetailViewModel.factory(app))
    // Tell the ViewModel which Pokémon to load; re-runs if `name` changes.
    LaunchedEffect(name) { viewModel.load(name) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(name.replaceFirstChar { it.uppercase() }) },
                // Back arrow as text (not Icons.Filled.*) per the course convention.
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Text("←", style = MaterialTheme.typography.titleLarge)
                    }
                },
            )
        },
    ) { padding ->
        when (val s = state) {
            is DetailUiState.Loading -> CenterBox(Modifier.padding(padding)) {
                CircularProgressIndicator()
            }

            is DetailUiState.Error -> CenterBox(Modifier.padding(padding)) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Couldn't load this Pokémon", style = MaterialTheme.typography.titleMedium)
                    Text(s.message, style = MaterialTheme.typography.bodyMedium)
                    Button(onClick = viewModel::retry, modifier = Modifier.padding(top = 12.dp)) {
                        Text("Retry")
                    }
                }
            }

            is DetailUiState.Success -> DetailCard(
                pokemon = s.pokemon,
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
            )
        }
    }
}

/** The Success card: #number + name, type chips, and height / weight. */
@Composable
private fun DetailCard(pokemon: PokemonDetail, modifier: Modifier = Modifier) {
    Card(modifier = modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text(
                text = "#%03d".format(pokemon.dexNumber),
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.primary,
            )
            Text(
                text = pokemon.name.replaceFirstChar { it.uppercase() },
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
            )
            // Type chips (emoji + label).
            Row(
                modifier = Modifier.padding(top = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                pokemon.types.forEach { type -> TypeChip(type) }
            }
            // Size stats.
            Text(
                text = "Height: ${pokemon.heightMeters} m",
                style = MaterialTheme.typography.bodyLarge,
                modifier = Modifier.padding(top = 16.dp),
            )
            Text(
                text = "Weight: ${pokemon.weightKg} kg",
                style = MaterialTheme.typography.bodyLarge,
                modifier = Modifier.padding(top = 4.dp),
            )
        }
    }
}

/** One rounded type chip, e.g. "⚡ Electric". */
@Composable
private fun TypeChip(type: PokemonType) {
    Surface(
        shape = RoundedCornerShape(50),
        color = MaterialTheme.colorScheme.secondaryContainer,
    ) {
        Text(
            text = "${type.emoji} ${type.name.replaceFirstChar { it.uppercase() }}",
            style = MaterialTheme.typography.labelLarge,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
        )
    }
}

/** Center its content in the available space. */
@Composable
private fun CenterBox(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) { content() }
}
