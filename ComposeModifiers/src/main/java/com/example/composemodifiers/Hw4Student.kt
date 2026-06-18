package com.example.composemodifiers

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

//T4-T6
//T4 padding vs background
@Composable
fun T4ModifierOrderDemo() {
    // A includes the padding in the green. B leaves padding outside the green
    Column (
        modifier = Modifier.padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            "A: background then padding",
            modifier = Modifier.background(Color(0xFF3DDC84)).padding(16.dp)
        )
        Text(
            "B: padding then background",
            modifier = Modifier.padding(16.dp).background(Color(0xFF3DDC84))
        )
        // emulator matched playground and the app has the same background color
    }
}
@Preview(showBackground = true)
@Composable
fun T4ModifierOrderDemoPreview() {
    T4ModifierOrderDemo()
}

//T5 clip,border & background
@Composable
fun T5AvatarDemo() {
   //when background comes before clip, the color can bleed outside the round shape
    Box (
        modifier = Modifier.size(72.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(Color(0xFFB3E5FC))
            .border(2.dp, Color(0xFF0288D1), RoundedCornerShape(16.dp)),
        contentAlignment = Alignment.Center
    ) {
        Text("JP")
    }
}

@Preview(showBackground = true)
@Composable
fun T5AvatarDemoPreview() {
    T5AvatarDemo()
}

//T6 size-affecting vs draw-only modifiers
@Composable
fun T6ModifierTypesDemo() {
    Column {
        Card(
            modifier = Modifier
                .fillMaxWidth() // size
                .padding(16.dp) // size
                .shadow(8.dp, RoundedCornerShape(12.dp)) // draw
                .alpha(0.9f) // draw
        ) {
            Column(modifier = Modifier.padding(16.dp)) { // size
                Text("Olympus Mons", style = MaterialTheme.typography.titleMedium)
                Text("Tallest volcano in the solar system")
            }
        }

        Card(
            modifier = Modifier
                .fillMaxWidth() // size
                .padding(16.dp) // size
        ) {
            Text(
                "Padding moves layout space, but alpha only changes how faded it looks.",
                modifier = Modifier.padding(16.dp)
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
fun T6ModifierTypesDemoPreview() {
    T6ModifierTypesDemo()
}
