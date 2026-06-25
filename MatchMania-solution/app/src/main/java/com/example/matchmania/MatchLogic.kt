package com.example.matchmania

// ─────────────────────────────────────────────────────────────────────────────
// MatchLogic.kt  —  the PURE game rules (Part B).  SOLUTION (answer key).
//
// This file has NO Android / no Compose imports on purpose: that's what lets the
// unit tests in MatchLogicTest.kt run on a plain JVM in milliseconds.
//
// The data model (TileState / Tile / Board + helpers) is the same scaffolding the
// starter ships; below it, the three functions newBoard (B2), Board.flip (B3),
// and Board.reset (B4) are fully implemented — the finished answer.
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
//  SOLUTION — the three functions implemented (B2, B3, B4).
// ═════════════════════════════════════════════════════════════════════════════

// ── B2 (SOLVED): build a fresh, shuffled board ───────────────────────────────
fun newBoard(symbols: List<String>, random: Random = Random.Default): Board {
    // 1. Take the first PAIR_COUNT (8) symbols and DOUBLE the list (+ joins two
    //    lists), so every symbol now appears exactly twice → 16 faces in all.
    // 2. shuffled(random) returns a NEW randomly-ordered copy. We pass `random`
    //    in (rather than calling Random.Default here) so a test can hand us a
    //    seeded Random and get a repeatable board — that's the testability hook.
    // 3. map wraps each face in a FaceDown Tile.
    val tiles = (symbols.take(PAIR_COUNT) + symbols.take(PAIR_COUNT))
        .shuffled(random)
        .map { face -> Tile(face, TileState.FaceDown) }
    return Board(tiles = tiles, moves = 0) // a brand-new board: nothing revealed, no moves yet.
}

// ── B3 (SOLVED): flip a tile — THE HEART OF THE GAME ─────────────────────────
// Pure function: read the current board, return a NEW one. The whole rule set is
// driven by how many tiles are currently face-up (0, 1, or 2). We list the cases
// most-specific first so each `when` branch is unambiguous.
fun Board.flip(index: Int): Board {
    val up = faceUpIndices() // the 0, 1, or 2 tiles currently showing their face.

    return when {
        // (a) A leftover, non-matching pair is still showing from the previous
        //     turn. This tap's ONLY job is to clear it: flip those two back down.
        //     We do NOT reveal the tapped tile and we do NOT count a move — the
        //     player taps again to start the next pair.
        up.size == 2 ->
            withState(up.toSet(), TileState.FaceDown)

        // (b) The tap is a no-op: an out-of-range index, or a tile that is already
        //     FaceUp or Matched. Only FaceDown tiles can be revealed. Hand back
        //     the unchanged board (referential no-op — Compose won't redraw).
        index !in tiles.indices || tiles[index].state != TileState.FaceDown ->
            this

        // (c) Nothing is up yet → simply reveal the tapped tile.
        up.isEmpty() ->
            withState(setOf(index), TileState.FaceUp)

        // (d) Exactly one tile is already up → reveal the tapped one to make two,
        //     then judge the pair. Either way a pair ATTEMPT just happened, so
        //     moves goes up by one.
        else -> {
            val other = up.first()
            val isMatch = tiles[index].face == tiles[other].face
            // Match → lock BOTH as Matched; mismatch → leave BOTH FaceUp so the
            // player sees the miss (it gets cleared by their next tap, case (a)).
            val newState = if (isMatch) TileState.Matched else TileState.FaceUp
            withState(setOf(index, other), newState, moveDelta = 1)
        }
    }
}

// ── B4 (SOLVED): reset (clear) the board ─────────────────────────────────────
// Keep the same faces in the same positions; just turn every tile FaceDown and
// zero the move counter. (Reset = same layout cleared; New Game = a new shuffle.)
fun Board.reset(): Board =
    copy(tiles = tiles.map { it.copy(state = TileState.FaceDown) }, moves = 0)

// ── Private helper used by flip() ────────────────────────────────────────────
// Return a NEW board where the tiles at [indices] are set to [state] and moves is
// bumped by [moveDelta]. Centralizing the "rebuild the list immutably" step keeps
// each flip() branch a single readable line — and guarantees we never mutate the
// original list (mapIndexed builds a fresh List; untouched tiles are reused as-is).
private fun Board.withState(indices: Set<Int>, state: TileState, moveDelta: Int = 0): Board =
    copy(
        tiles = tiles.mapIndexed { i, tile ->
            if (i in indices) tile.copy(state = state) else tile
        },
        moves = moves + moveDelta,
    )
