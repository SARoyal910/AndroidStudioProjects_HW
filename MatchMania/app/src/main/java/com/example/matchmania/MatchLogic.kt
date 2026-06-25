package com.example.matchmania

// ─────────────────────────────────────────────────────────────────────────────
// MatchLogic.kt  —  the PURE game rules (Part B).  STARTER FILE.
//
// This file has NO Android / no Compose imports on purpose: that's what lets the
// unit tests in MatchLogicTest.kt run on a plain JVM in milliseconds.
//
//   ✅ PROVIDED FOR YOU (study it — don't rewrite): the constants, the data model
//      (TileState / Tile / Board) and Board's three read-only helpers.
//   ✍️ YOUR JOB: replace the three TODO stubs — newBoard (B2), Board.flip (B3),
//      and Board.reset (B4). Each currently returns a safe placeholder so the app
//      still COMPILES AND RUNS before you start; the game just doesn't play yet.
//
// Golden rule (same as everywhere in Compose): never mutate a board in place —
// always build and return a NEW Board. Use list.map { } / mapIndexed { } and
// tile.copy(state = …). That immutability is what makes the UI redraw correctly.
// ─────────────────────────────────────────────────────────────────────────────

import kotlin.random.Random // the RNG; callers can pass Random(seed) so tests are repeatable.

// ── Board geometry (PROVIDED) ────────────────────────────────────────────────
const val GRID_SIZE = 4                       // a 4×4 board…
const val CELL_COUNT = GRID_SIZE * GRID_SIZE  // …= 16 tiles…
const val PAIR_COUNT = CELL_COUNT / 2         // …= 8 pairs (8 symbols, each used twice).

// The symbol pool (PROVIDED). Pick your OWN theme — swap these emoji for fruit,
// flags, planets, whatever — just keep at least PAIR_COUNT (8) distinct entries.
val DEFAULT_SYMBOLS: List<String> = listOf(
    "🐶", "🐱", "🦊", "🐼", "🦁", "🐸", "🐵", "🐷",
)

// ── The three tile states (PROVIDED) ─────────────────────────────────────────
enum class TileState { FaceDown, FaceUp, Matched }

// ── One tile on the board (PROVIDED) ─────────────────────────────────────────
// A data class auto-generates copy()/equals()/etc. We use copy() to make a
// changed clone of a tile without touching the original.
data class Tile(val face: String, val state: TileState)

// ── The whole board (PROVIDED) ───────────────────────────────────────────────
// The list of 16 tiles plus a moves counter (one per pair attempt). The three
// helper methods below are done for you — both the rules and the UI use them.
data class Board(val tiles: List<Tile>, val moves: Int) {

    // A board must always be exactly 16 tiles — fail loudly if a bug builds it wrong.
    init {
        require(tiles.size == CELL_COUNT) {
            "A board must have exactly $CELL_COUNT tiles, but got ${tiles.size}."
        }
    }

    // The indices of every tile currently FaceUp (not counting Matched ones).
    // Your flip() logic branches on how many of these there are (0, 1, or 2).
    fun faceUpIndices(): List<Int> =
        tiles.indices.filter { tiles[it].state == TileState.FaceUp }

    // The win test: every tile has been Matched.
    fun isSolved(): Boolean = tiles.all { it.state == TileState.Matched }

    // How many pairs are found so far (each matched pair = two Matched tiles).
    fun pairsFound(): Int = tiles.count { it.state == TileState.Matched } / 2
}

// ═════════════════════════════════════════════════════════════════════════════
//  ✍️  YOUR WORK STARTS HERE — replace the three stubs below.
// ═════════════════════════════════════════════════════════════════════════════

// ── B2 (assignment Part B): build a fresh, shuffled board ────────────────────
// Return a board that satisfies the spec: PAIR_COUNT symbols, each used twice,
// shuffled into the 16 positions, all FaceDown, moves = 0. Use the `random`
// you're handed (so tests can seed it). See hw7 for the full contract.
//
// TODO (B2): the stub returns the pairs UNSHUFFLED so the app still runs and the
//            grid renders 16 tiles. Replace it with the real, shuffled version.
fun newBoard(symbols: List<String>, random: Random = Random.Default): Board {
    val chosenSymbols = symbols.take(PAIR_COUNT)
    val tiles = (chosenSymbols + chosenSymbols)
        .shuffled(random)
        .map { Tile(it, TileState.FaceDown) }
    return Board(tiles = tiles, moves = 0)
}

// ── B3 (assignment Part B): flip a tile — THE HEART OF THE GAME ──────────────
// Apply the tap rules (hw7 "The exact rules", rule 3) and return a NEW board.
// The outcome depends on how many tiles are currently face-up — start there.
// Work out for yourself: which taps do nothing, when does `moves` increase, and
// how do you change only the tiles involved without mutating the original board?
//
// TODO (B3): the stub below is a no-op so tapping doesn't crash. Implement it.
fun Board.flip(index: Int): Board {
    if (index !in tiles.indices) return this
    
    val faceUp = faceUpIndices()

    // Rule 3 branch 3: 2 face-up and mismatch. ANY tap clears them.
    if (faceUp.size == 2) {
        val newTiles = tiles.map { tile ->
            if (tile.state == TileState.FaceUp) tile.copy(state = TileState.FaceDown) else tile
        }
        return Board(newTiles, moves)
    }

    val tappedTile = tiles[index]
    
    // Rule: Tapping a Matched tile, or the same tile that is already FaceUp, does nothing.
    if (tappedTile.state != TileState.FaceDown) return this

    return when (faceUp.size) {
        0 -> {
            // 0 face-up: the tapped FaceDown tile flips to FaceUp.
            val newTiles = tiles.mapIndexed { i, tile ->
                if (i == index) tile.copy(state = TileState.FaceUp) else tile
            }
            Board(newTiles, moves)
        }
        1 -> {
            // 1 face-up: the tapped FaceDown tile flips to FaceUp, making two.
            // Immediately compare them: if match -> Matched; if not -> leave both FaceUp.
            // moves increments by 1.
            val firstIndex = faceUp[0]
            val firstTile = tiles[firstIndex]
            val isMatch = firstTile.face == tappedTile.face
            
            val newState = if (isMatch) TileState.Matched else TileState.FaceUp
            
            val newTiles = tiles.mapIndexed { i, tile ->
                when (i) {
                    index -> tile.copy(state = newState)
                    firstIndex -> tile.copy(state = newState)
                    else -> tile
                }
            }
            Board(newTiles, moves + 1)
        }
        2 -> {
            // 2 face-up and they did NOT match: the next tap first flips those two back to FaceDown
            // and reveals nothing else.
            val newTiles = tiles.map { tile ->
                if (tile.state == TileState.FaceUp) tile.copy(state = TileState.FaceDown) else tile
            }
            Board(newTiles, moves)
        }
        else -> this
    }
}

// ── B4 (assignment Part B): reset (clear) the board ─────────────────────────
// Same faces in the same positions, but every tile FaceDown and moves = 0.
// (Reset = same layout cleared; New Game = a fresh shuffle.)
//
// TODO (B4): the stub returns the board unchanged. Implement the real reset.
fun Board.reset(): Board {
    val newTiles = tiles.map { it.copy(state = TileState.FaceDown) }
    return Board(newTiles, 0)
}
