// =============================================================================
// ui/screens/PlayMenuScreen.kt  —  Tab 1 (Play), the menu
//
// The Play tab's ROOT: a little menu offering two mini-games. Tapping a card
// drills forward (onto the Play tab's own back stack) into that game — the same
// list → detail navigation idea as Explore, just with two destinations instead
// of one. Stateless: it only reports which game was chosen.
// =============================================================================
package com.example.exampleproject.ui.screens

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
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.exampleproject.ui.theme.ExampleProjectTheme

/**
 * PlayMenuScreen (Play tab, root) — two big tappable cards, one per game.
 *
 * @param onOpenFlashcards invoked when the Flashcards card is tapped.
 * @param onOpenGuess      invoked when the Guess card is tapped.
 * @param modifier         optional layout modifier supplied by the caller.
 */
@Composable
fun PlayMenuScreen(
    onOpenFlashcards: () -> Unit,
    onOpenGuess: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text("Play", style = MaterialTheme.typography.headlineSmall)
        Text(
            "Two quick games built from your places.",
            style = MaterialTheme.typography.bodyMedium,
        )
        Spacer(Modifier.height(8.dp))

        // Each game is a tappable ElevatedCard. We reuse one helper composable
        // (below) so the two cards stay consistent.
        GameCard(
            emoji = "🃏",
            title = "Flashcards",
            subtitle = "Flip a card to reveal where it is.",
            onClick = onOpenFlashcards,
        )
        GameCard(
            emoji = "🔍",
            title = "Guess the place",
            subtitle = "Tap the place we name — an 'I spy' game.",
            onClick = onOpenGuess,
        )
    }
}

// One menu row. Pulled out so both cards are identical except their content.
@Composable
private fun GameCard(
    emoji: String,
    title: String,
    subtitle: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    ElevatedCard(modifier = modifier.fillMaxWidth().clickable { onClick() }) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(20.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(emoji, fontSize = 40.sp)
            Spacer(Modifier.width(16.dp))
            Column {
                Text(title, style = MaterialTheme.typography.titleMedium)
                Text(subtitle, style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
}

@Preview(name = "Play menu", showBackground = true, widthDp = 320, heightDp = 480)
@Composable
fun PlayMenuScreenPreview() {
    ExampleProjectTheme {
        PlayMenuScreen(onOpenFlashcards = {}, onOpenGuess = {})
    }
}
