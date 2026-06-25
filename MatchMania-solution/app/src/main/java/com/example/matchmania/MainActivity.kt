package com.example.matchmania

// ─────────────────────────────────────────────────────────────────────────────
// MainActivity.kt  —  the Compose UI (Part C).  SOLUTION (answer key).
//
// The starter shipped the Activity, the Scaffold + top bar, the hoisted board
// state, the stats line, and the buttons, plus a "build the board here"
// placeholder. This solution finishes the two UI tasks:
//   • C2 — a real 4-column grid of square, tappable tiles styled by tile state.
//   • C3 — a celebratory win banner shown once every pair is matched.
//
// The shape never changes: state flows DOWN (we pass `board` into the grid) and
// events flow UP (a tile tap calls back with its index, and THIS screen decides
// what it means: board = board.flip(i)).
// ─────────────────────────────────────────────────────────────────────────────

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.matchmania.ui.theme.MatchManiaTheme

// ── The Android entry point ──────────────────────────────────────────────────
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MatchManiaTheme {
                MatchManiaScreen()
            }
        }
    }
}

// Accent colors for the two "active" tile states (face-down uses the theme's
// neutral surfaceVariant). Defined explicitly so the board reads clearly on any
// device wallpaper.
private val FaceUpColor = Color(0xFF2563EB)  // blue: a tile you've just revealed.
private val MatchedColor = Color(0xFF1B9E5A) // green: a locked, found pair.

// ── The screen: owns the state, lays everything out ──────────────────────────
@OptIn(ExperimentalMaterial3Api::class) // TopAppBar is still experimental in Material 3.
@Composable
fun MatchManiaScreen() {
    // C1: the single source of truth for the screen. Reassigning `board` to the
    // NEW board returned by a MatchLogic function is what makes Compose redraw.
    var board by remember { mutableStateOf(newBoard(DEFAULT_SYMBOLS)) }

    // The "Check" button writes a short status message here.
    var message by remember { mutableStateOf("") }

    // C3 (derivation): the win state is NOT separate state — it falls straight out
    // of the board, so we just compute it each recomposition.
    val won = board.isSolved()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("🎮 Match Mania") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer,
                ),
            )
        },
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)            // clears the top app bar AND the bottom nav bar.
                .padding(horizontal = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Spacer(Modifier.height(8.dp))

            // Stats line — reads the helpers on Board.
            Text(
                text = "Pairs: ${board.pairsFound()} / $PAIR_COUNT   ·   Moves: ${board.moves}",
                style = MaterialTheme.typography.titleMedium,
            )

            Spacer(Modifier.height(12.dp))

            // C2: the real board. We pass the tiles DOWN and a tap (as an index) UP.
            // The screen turns that tap into the next board via board.flip(index).
            BoardGrid(
                board = board,
                onTap = { index ->
                    board = board.flip(index)
                    message = ""              // any move invalidates the last Check message.
                },
                modifier = Modifier.fillMaxWidth(),
            )

            Spacer(Modifier.height(16.dp))

            // C3: the win banner appears the moment the last pair is matched.
            if (won) {
                WinBanner(moves = board.moves)
            } else if (message.isNotEmpty()) {
                Text(message, style = MaterialTheme.typography.bodyLarge, textAlign = TextAlign.Center)
            }

            Spacer(Modifier.weight(1f)) // push the buttons to the bottom.

            // New Game + Reset, side by side.
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Button(
                    onClick = { board = newBoard(DEFAULT_SYMBOLS); message = "" },
                    modifier = Modifier.weight(1f),
                ) { Text("🔀 New Game") }

                OutlinedButton(
                    onClick = { board = board.reset(); message = "" },
                    modifier = Modifier.weight(1f),
                ) { Text("Reset") }
            }

            Spacer(Modifier.height(12.dp))

            // Check — an explicit progress / win report.
            Button(
                onClick = {
                    message = if (board.isSolved()) "You found all $PAIR_COUNT pairs! 🎉"
                              else "${PAIR_COUNT - board.pairsFound()} pairs to go."
                },
                modifier = Modifier.fillMaxWidth(),
            ) { Text("Check", fontSize = 16.sp) }

            Spacer(Modifier.height(16.dp))
        }
    }
}

// ── C2: the 4×4 board ────────────────────────────────────────────────────────
// LazyVerticalGrid with a fixed column count turns the flat list of 16 tiles into
// a 4×4 grid automatically — every 5th item wraps to a new row. itemsIndexed hands
// us both the tile and its 0..15 position, which the tap needs.
@Composable
private fun BoardGrid(
    board: Board,
    onTap: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(GRID_SIZE),                 // 4 columns → a 4×4 layout.
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(8.dp),   // gaps between columns…
        verticalArrangement = Arrangement.spacedBy(8.dp),     // …and between rows.
        userScrollEnabled = false,                            // the whole board fits on screen.
    ) {
        itemsIndexed(board.tiles) { index, tile ->
            TileView(tile = tile, onTap = { onTap(index) })
        }
    }
}

// One tile: a square, tappable Card whose look depends on its state.
@Composable
private fun TileView(tile: Tile, onTap: () -> Unit) {
    // Background by state: matched = green, revealed = blue, hidden = neutral.
    val background = when (tile.state) {
        TileState.Matched -> MatchedColor
        TileState.FaceUp -> FaceUpColor
        TileState.FaceDown -> MaterialTheme.colorScheme.surfaceVariant
    }
    // Face-down tiles hide their symbol and show a muted "?"; revealed/matched
    // tiles show the symbol (white "?" text would never appear on those).
    val faceText = if (tile.state == TileState.FaceDown) "?" else tile.face
    val faceColor = if (tile.state == TileState.FaceDown)
        MaterialTheme.colorScheme.onSurfaceVariant else Color.White

    Card(
        onClick = onTap,                              // whole face is tappable + accessible.
        modifier = Modifier.aspectRatio(1f),          // force a perfect square.
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = background),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
    ) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text(text = faceText, fontSize = 30.sp, color = faceColor)
        }
    }
}

// ── C3: the win banner ───────────────────────────────────────────────────────
@Composable
private fun WinBanner(moves: Int) {
    Text(
        text = "🎉  You win in $moves moves!",
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))          // round corners BEFORE the background…
            .background(MatchedColor)                 // …so the fill respects the shape.
            .padding(vertical = 12.dp, horizontal = 16.dp),
        color = Color.White,
        fontWeight = FontWeight.Bold,
        textAlign = TextAlign.Center,
    )
}

// ── Design-time preview ──────────────────────────────────────────────────────
@Preview(name = "Match Mania (solution)", showBackground = true, showSystemUi = true)
@Composable
private fun MatchManiaPreview() {
    MatchManiaTheme {
        MatchManiaScreen()
    }
}
