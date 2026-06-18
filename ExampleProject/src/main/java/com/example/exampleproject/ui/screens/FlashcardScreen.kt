// =============================================================================
// ui/screens/FlashcardScreen.kt  —  Play › Flashcards (a flip-card deck)
//
// A study-card screen: the FRONT shows a place's emoji and asks "Where is this?";
// tap the card and it FLIPS to reveal the answer on the BACK. Next/Previous walk
// through the deck. This is the pattern a "flashcard app" is built on.
//
// Two teaching points beyond the earlier screens:
//   • A real ANIMATION — animateFloatAsState drives a 0°→180° rotation, and
//     graphicsLayer { rotationY = … } turns that number into a 3D flip.
//   • "Which face is showing?" is pure math: while the rotation is past 90° we
//     draw the back (counter-rotated so its text isn't mirrored).
// =============================================================================
package com.example.exampleproject.ui.screens

import androidx.compose.animation.core.Animatable           // an animation value we can both animate AND snap
import androidx.compose.animation.core.tween                // a simple duration-based animation curve
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer           // applies 3D transforms (here, rotationY) to a composable
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.exampleproject.data.Destination
import com.example.exampleproject.data.initialDestinations
import com.example.exampleproject.ui.theme.ExampleProjectTheme
import kotlinx.coroutines.launch                            // launches the flip / snap animations

/**
 * FlashcardScreen — flip through a deck made from [destinations].
 *
 * @param destinations the deck (one card per place).
 * @param onBack       invoked to return to the Play menu.
 * @param modifier     optional layout modifier supplied by the caller.
 */
@Composable
fun FlashcardScreen(
    destinations: List<Destination>,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // If the deck is empty (everything was deleted), there's nothing to study.
    if (destinations.isEmpty()) {
        EmptyDeck(onBack = onBack, modifier = modifier)
        return
    }

    // Which card we're on. rememberSaveable so it survives rotation (an Int is
    // saveable for free). We coerce into range so deleting cards can't crash us.
    var index by rememberSaveable { mutableIntStateOf(0) }
    val safeIndex = index.coerceIn(0, destinations.lastIndex)
    val card = destinations[safeIndex]

    // Is the card showing its back (the answer)? Plain remember: a momentary UI detail.
    var showingBack by remember { mutableStateOf(false) }

    // The flip angle as an Animatable. Why not animateFloatAsState? Because we want
    // TWO behaviours: a smooth ANIMATE when you tap to flip, but an instant SNAP when
    // you move to another card. Snapping matters — if we animated the un-flip while
    // swapping cards, the new card's answer (the back) would flash by as the angle
    // swept past 90°. An Animatable lets us pick animateTo() vs snapTo() per action.
    val rotation = remember { Animatable(0f) }
    val scope = rememberCoroutineScope()

    // Tap to flip: toggle the face and ANIMATE the angle to it.
    fun flip() {
        showingBack = !showingBack
        scope.launch { rotation.animateTo(if (showingBack) 180f else 0f, tween(450)) }
    }
    // Move to another card: SNAP back to the front instantly (no sweep, no answer
    // leak), then swap the index.
    fun goTo(newIndex: Int) {
        scope.launch {
            rotation.snapTo(0f)
            showingBack = false
            index = newIndex
        }
    }

    Column(
        modifier = modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("Card ${safeIndex + 1} of ${destinations.size}", style = MaterialTheme.typography.labelLarge)
        Text("Tap the card to flip it", style = MaterialTheme.typography.bodySmall)
        Spacer(Modifier.height(16.dp))

        // THE CARD. graphicsLayer applies the live rotation; cameraDistance keeps
        // the 3D perspective from looking too extreme. Tapping calls flip().
        ElevatedCard(
            modifier = Modifier
                .fillMaxWidth()
                .height(260.dp)
                .graphicsLayer {
                    rotationY = rotation.value
                    cameraDistance = 12f * density
                }
                .clickable { flip() },
        ) {
            Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                // Past 90° the card's back is facing us, so swap to the answer.
                if (rotation.value <= 90f) {
                    // FRONT: the prompt.
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(card.emoji, fontSize = 72.sp)
                        Spacer(Modifier.height(12.dp))
                        Text("Where is this?", style = MaterialTheme.typography.titleMedium)
                    }
                } else {
                    // BACK: the answer. We counter-rotate by 180° so the text reads
                    // normally instead of appearing mirror-flipped.
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.graphicsLayer { rotationY = 180f },
                    ) {
                        Text(card.name, style = MaterialTheme.typography.headlineMedium)
                        Text(card.country, style = MaterialTheme.typography.titleMedium)
                        Text(card.continent, style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
        }

        Spacer(Modifier.height(20.dp))

        // Previous / Next. Each moves the index (wrapping around) and resets the
        // card to its front so the next prompt isn't shown already-answered.
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            OutlinedButton(
                onClick = { goTo((safeIndex - 1 + destinations.size) % destinations.size) },
                modifier = Modifier.weight(1f),
            ) { Text("Previous") }
            Button(
                onClick = { goTo((safeIndex + 1) % destinations.size) },
                modifier = Modifier.weight(1f),
            ) { Text("Next") }
        }
        Spacer(Modifier.height(8.dp))
        OutlinedButton(onClick = onBack, modifier = Modifier.fillMaxWidth()) {
            Text("Back to games")
        }
    }
}

// Shown when there are no cards to study.
@Composable
private fun EmptyDeck(onBack: () -> Unit, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            "No cards yet — add some places first.",
            style = MaterialTheme.typography.bodyLarge,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(16.dp))
        OutlinedButton(onClick = onBack) { Text("Back to games") }
    }
}

@Preview(name = "Flashcard", showBackground = true, widthDp = 320, heightDp = 560)
@Composable
fun FlashcardScreenPreview() {
    ExampleProjectTheme {
        FlashcardScreen(destinations = initialDestinations, onBack = {})
    }
}
