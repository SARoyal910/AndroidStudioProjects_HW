package com.example.composecatalog

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

//T1
@Composable
fun T1ColumnDemo() {
    Column(
        modifier = Modifier.fillMaxWidth()
            .padding(16.dp),
        //Changing this from 8.dp to 24.dp makes the items further apart
        verticalArrangement = Arrangement.spacedBy(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Mercury", style = MaterialTheme.typography.titleLarge)
        Text("Closest to the Sun")
        Text("88-day year")
        Button(onClick = {}) {
            Text("Open")
        }
    }
}
@Preview(showBackground = true)
@Composable
fun T1ColumnDemoPreview() {
    T1ColumnDemo()
}

//T2
// Version 1 - 1:2:1 ratio
@Composable
fun T2WeightedRowDemo() {
    Row(modifier = Modifier.fillMaxWidth()
            .padding(16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Button(onClick = {}, modifier = Modifier.weight(1F)) {
            Text("A")
        }
        Button(onClick = {}, modifier = Modifier.weight(2F)) {
        Text("B(wide)")
        }
        Button(onClick = {}, modifier = Modifier.weight(1F)) {
            Text("C")
        }
    }
}
@Preview(showBackground = true)
@Composable
fun T2WeightedRowDemoPreview() {
    T2WeightedRowDemo()
}
// Version 2 no weight on middle button
@Composable
fun T2NoMiddleWeightDemo() {
    // T2
    // I think B will only be as wide as its text, and A and C will split the leftover space.
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Button(onClick = {}, modifier = Modifier.weight(1f)) {
            Text("A")
        }
        Button(onClick = {}) {
            Text("B (wide)")
        }
        Button(onClick = {}, modifier = Modifier.weight(1f)) {
            Text("C")
        }
    }
}

@Preview(showBackground = true)
@Composable
fun T2NoMiddleWeightDemoPreview() {
    T2NoMiddleWeightDemo()
}
//T3 a box that layers and aligns
@Composable
fun T3BoxBadgeDemo() {
    // T3
    // Box works best here because the badges need to sit on top of the banner.
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(140.dp)
            .background(Color(0xFF22314A)),
        contentAlignment = Alignment.Center
    ) {
        Text("Featured planet", color = Color.White)
        Text(
            "HOT",
            color = Color.White,
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(8.dp)
        )
        Text(
            "NEW",
            color = Color.White,
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(8.dp)
        )
    }
}

@Preview(showBackground = true)
@Composable
fun T3BoxBadgeDemoPreview() {
    T3BoxBadgeDemo()
}

//T7 a counter (state & recomposition)
@Composable
fun Counter() {
    var count by remember { mutableIntStateOf(0) }

    Column(
        modifier = Modifier.padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Count: $count", style = MaterialTheme.typography.headlineSmall)
        Spacer(Modifier.height(8.dp))
        Button(onClick = { count++ }) {
            Text("Add one")
        }
        // without remember and mutableStateOf, the number does not update correctly because Compose doesn't track the state
    }
}
@Preview(showBackground = true)
@Composable
fun CounterPreview() {
    Counter()
}

//T8 a real toggle that drives the UI (state hosting)
@Composable
fun ToggleDemo() {
    var on by remember { mutableStateOf(false) }

    Column {
        ToggleRow(
            checked = on,
            onCheckedChange = { on = it }
        )

        if (on) {
            Card(modifier = Modifier.padding(16.dp)) {
                Text (
                    "Notifications are turned on.",
                    modifier = Modifier.padding(16.dp)
                )
            }
        }
    }
}
@Composable
fun ToggleRow(
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
   Row(
       verticalAlignment = Alignment.CenterVertically,
       modifier = Modifier.padding(16.dp)
   ) {
       Text(
           text = if (checked) "Notifications: ON" else "Notifications: OFF",
           modifier = Modifier.weight(1f)
       )
       Switch(
           checked = checked,
           onCheckedChange = onCheckedChange
       )
   }
}

@Preview(showBackground = true)
@Composable
fun ToggleDemoPreview() {
    ToggleDemo()
}
@Preview(showBackground = true)
@Composable
fun ToggleOffPreview() {
    ToggleRow(checked = false, onCheckedChange = {})
}

@Preview(showBackground = true)
@Composable
fun ToggleOnPreview() {
    ToggleRow(checked = true, onCheckedChange = {})
}

//T9 a bound TextField
@Composable
fun NameField() {
    var name by remember { mutableStateOf("") }

    Column(modifier = Modifier.padding(16.dp)){
        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Your Name") },
            singleLine = true
        )
        Spacer(Modifier.height(8.dp))
        Text("Hello, ${name.ifBlank { "stranger" }} (${name.length} chars)")
        // Typing updates state, then Compose redraws the field and the text below it.
    }
}
@Preview(showBackground = true)
@Composable
fun NameFieldPreview() {
    NameField()
}

//T10 a real interactive screen
data class Planet(val id: Int, val name: String, val detail: String)

private val planets = listOf(
    Planet(1, "Mercury", "Closest to the Sun - 88-day year"),
    Planet(2, "Venus", "Hottest planet - thick clouds"),
    Planet(3, "Earth", "The only known living world"),
    Planet(4, "Mars", "The red planet - home of Olympus Mons"),
    Planet(5, "Jupiter", "Largest planet - the Great Red Spot"),
    Planet(6, "Saturn", "Ringed gas giant")
)

@Composable
fun InteractivePlanetScreen() {
    // T10
    var favorites by remember { mutableStateOf(setOf<Int>()) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(Color(0xFF22314A)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                "Planet Picks",
                color = Color.White,
                style = MaterialTheme.typography.headlineSmall
            )
            Text(
                "★ ${favorites.size}",
                color = Color.White,
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(12.dp)
            )
        }

        Spacer(Modifier.height(16.dp))
        HorizontalDivider()
        Spacer(Modifier.height(8.dp))

        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(planets, key = { it.id }) { planet ->
                PlanetRow(
                    planet = planet,
                    isFavorite = planet.id in favorites,
                    onFavoriteClick = {
                        favorites = if (planet.id in favorites) {
                            favorites - planet.id
                        } else {
                            favorites + planet.id
                        }
                    }
                )
            }
        }
    }
}

@Composable
fun PlanetRow(
    planet: Planet,
    isFavorite: Boolean,
    onFavoriteClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth() // size
            .shadow(4.dp, RoundedCornerShape(12.dp)) // draw
            .alpha(0.98f) // draw
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(planet.name, style = MaterialTheme.typography.titleMedium)
                Text(planet.detail)
            }
            Text(
                text = if (isFavorite) "★" else "☆",
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.clickable { onFavoriteClick() }
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
fun InteractivePlanetScreenPreview() {
    InteractivePlanetScreen()
}





