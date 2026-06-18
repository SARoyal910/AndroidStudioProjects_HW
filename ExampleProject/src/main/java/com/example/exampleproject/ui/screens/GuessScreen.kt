// =============================================================================
// ui/screens/GuessScreen.kt  —  Play › Guess the place (an "I spy" game)
//
// We name a place; you TAP it in a grid of options. This is the pattern an "I
// spy" app needs, and it teaches the one thing the rest of this project doesn't:
// COORDINATE HIT-TESTING — taking a raw (x, y) touch and working out WHICH region
// it landed in.
//
// HOW THE HIT-TEST WORKS (the important bit):
//   • A single pointerInput { detectTapGestures { offset -> … } } on the whole
//     scene gives us the tap's pixel position AND the scene's pixel size.
//   • Because the grid is a perfectly even 3-columns × N-rows layout, the cell a
//     tap fell in is just arithmetic: column = x / (width/3), row = y / (height/rows).
//   • cell index = row * 3 + column  →  which option was tapped.
//
// This is EXACTLY how you'd tap on a real photo: put an Image in the Box instead
// of the grid, and compare the tap offset against a list of hotspot rectangles
// you've defined over the image. Same idea, same code shape.
// =============================================================================
package com.example.exampleproject.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures // gives us each tap's (x, y) offset
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio       // forces the scene to stay square
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput        // low-level touch input (we read raw taps)
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.exampleproject.data.Destination
import com.example.exampleproject.data.initialDestinations
import com.example.exampleproject.ui.theme.ExampleProjectTheme

// One round of the game: the options shown, and which one is the answer. `rows`
// is how many rows of 3 the options need (6 -> 2 rows, 4 -> 2, 2 -> 1).
private data class GuessRound(val options: List<Destination>, val targetIndex: Int) {
    val cols = 3
    val rows = (options.size + cols - 1) / cols              // ceil(size / 3)
}

// Build a fresh round: up to 6 random places, one picked at random as the target.
private fun newRound(all: List<Destination>): GuessRound {
    val options = all.shuffled().take(6)
    return GuessRound(options, targetIndex = options.indices.random())
}

/**
 * GuessScreen — name a place, tap it in the grid. Keeps a running score.
 *
 * @param destinations the pool of places to draw options from.
 * @param onBack       invoked to return to the Play menu.
 * @param modifier     optional layout modifier supplied by the caller.
 */
@Composable
fun GuessScreen(
    destinations: List<Destination>,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // Need at least one place to play. (Guarding BEFORE building a round also
    // avoids random() on an empty range.)
    if (destinations.isEmpty()) {
        Column(
            modifier = modifier.fillMaxSize().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            Text(
                "Nothing to find yet — add some places first.",
                style = MaterialTheme.typography.bodyLarge,
                textAlign = TextAlign.Center,
            )
            Spacer(Modifier.height(16.dp))
            OutlinedButton(onClick = onBack) { Text("Back to games") }
        }
        return
    }

    var score by rememberSaveable { mutableIntStateOf(0) }
    var round by remember { mutableStateOf(newRound(destinations)) }
    var feedback by remember { mutableStateOf("Tap the place we name.") }
    val target = round.options[round.targetIndex]

    // Called once we've figured out which cell was tapped. Scores it and deals a
    // new round. (Kept here so the hit-test code below stays about geometry only.)
    fun pick(index: Int) {
        val chosen = round.options[index]
        feedback = if (chosen.id == target.id) {
            score++
            "✅ Correct — that's ${target.name}!"
        } else {
            "❌ That was ${chosen.name}. We wanted ${target.name}."
        }
        round = newRound(destinations)
    }

    Column(modifier = modifier.fillMaxSize().padding(16.dp)) {
        Text("Score: $score", style = MaterialTheme.typography.labelLarge)
        Spacer(Modifier.height(8.dp))
        Text("I spy…", style = MaterialTheme.typography.titleSmall)
        Text(target.name, style = MaterialTheme.typography.headlineSmall)
        Text("in ${target.country}", style = MaterialTheme.typography.bodyMedium)
        Spacer(Modifier.height(16.dp))

        // THE SCENE. One tap handler on the whole square does the hit-testing; the
        // grid inside is just what you SEE (its cells are not individually clickable).
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                // pointerInput(round): restart the gesture detector each new round.
                .pointerInput(round) {
                    detectTapGestures { offset ->
                        // `size` is the scene's pixel size; `offset` is where the
                        // tap landed. Map them to a cell with plain arithmetic.
                        val cellWidth = size.width / round.cols
                        val cellHeight = size.height / round.rows
                        val col = (offset.x / cellWidth).toInt().coerceIn(0, round.cols - 1)
                        val row = (offset.y / cellHeight).toInt().coerceIn(0, round.rows - 1)
                        val index = row * round.cols + col
                        // Ignore taps on empty trailing cells (fewer than a full last row).
                        if (index < round.options.size) pick(index)
                    }
                },
        ) {
            // The visible grid — even rows/columns so the math above lines up with
            // what the player sees. weight(1f) makes every cell the same size.
            Column(modifier = Modifier.fillMaxSize()) {
                for (r in 0 until round.rows) {
                    Row(modifier = Modifier.fillMaxWidth().weight(1f)) {
                        for (c in 0 until round.cols) {
                            val index = r * round.cols + c
                            Box(
                                modifier = Modifier.weight(1f).fillMaxHeight().padding(4.dp),
                                contentAlignment = Alignment.Center,
                            ) {
                                if (index < round.options.size) {
                                    val option = round.options[index]
                                    Box(
                                        modifier = Modifier
                                            .fillMaxSize()
                                            .background(
                                                MaterialTheme.colorScheme.surfaceVariant,
                                                RoundedCornerShape(12.dp),
                                            ),
                                        contentAlignment = Alignment.Center,
                                    ) {
                                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                            Text(option.emoji, fontSize = 34.sp)
                                            Text(option.name, style = MaterialTheme.typography.labelMedium)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        Spacer(Modifier.height(16.dp))
        Text(feedback, style = MaterialTheme.typography.bodyLarge)
        Spacer(Modifier.height(16.dp))
        OutlinedButton(onClick = onBack, modifier = Modifier.fillMaxWidth()) {
            Text("Back to games")
        }
    }
}

@Preview(name = "Guess", showBackground = true, widthDp = 320, heightDp = 640)
@Composable
fun GuessScreenPreview() {
    ExampleProjectTheme {
        GuessScreen(destinations = initialDestinations, onBack = {})
    }
}
