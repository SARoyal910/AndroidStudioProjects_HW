package com.example.matchmania

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotSame
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.random.Random

// ─────────────────────────────────────────────────────────────────────────────
// MatchLogicTest.kt  —  Part D.  STARTER FILE.
//
// These run on a plain JVM (no emulator): right-click ▸ Run, or
//   ./gradlew testDebugUnitTest
//
// Two example tests are PROVIDED and already pass (they only check structure that
// is true even before you finish the logic). Below them is your TODO list — write
// the remaining tests. As you implement newBoard/flip/reset in MatchLogic.kt, your
// tests should turn green; while a function is still a stub, its test will fail —
// that's the test doing its job.
// ─────────────────────────────────────────────────────────────────────────────
class MatchLogicTest {

    // ── PROVIDED example #1: a fresh board has the right number of tiles. ──────
    @Test
    fun newBoard_hasCorrectTileCount() {
        assertEquals(CELL_COUNT, newBoard(DEFAULT_SYMBOLS).tiles.size)
    }

    // ── PROVIDED example #2: a fresh board is all face-down and not yet solved. ─
    @Test
    fun newBoard_startsUnsolvedAndFaceDown() {
        val board = newBoard(DEFAULT_SYMBOLS)
        assertEquals(0, board.moves)
        assertFalse(board.isSolved())
        assertTrue(board.tiles.all { it.state == TileState.FaceDown })
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  ✍️  YOUR TESTS (Part D) — write at least these (see hw7 for the full list).
    //      These are the behaviors to VERIFY; working out HOW to verify each one is
    //      part of the assignment.
    //
    //   1. composition   — PAIR_COUNT distinct faces, each used exactly twice.
    //   2. determinism   — the same seed (Random(n)) gives the same board twice.
    //   3. flip reveals  — flipping a face-down tile makes it FaceUp.
    //   4. flip matches  — a tile + its twin both become Matched; moves == 1.
    //   5. flip mismatch — two different tiles both stay FaceUp (moves == 1); the
    //                      next flip clears them back to FaceDown (moves stays 1).
    //   6. immutability  — flip() returns a NEW board; the original is unchanged.
    //   7. win & reset   — a fully-matched board isSolved(); reset() puts every
    //                      tile FaceDown, moves == 0, same faces in the same order.
    //
    //   You'll need to seed Random for repeatable boards, and find a tile's TWIN
    //   (the other tile sharing its face) so you can force a guaranteed match — figure it out.
    // ═══════════════════════════════════════════════════════════════════════════

    // Makes sure every symbol appears exactly twice.
    @Test
    fun newBoard_hasEachSymbolTwice() {
        val board = newBoard(DEFAULT_SYMBOLS, Random(1))
        val counts = board.tiles.groupingBy { it.face }.eachCount()
        assertEquals(PAIR_COUNT, counts.size)
        assertTrue(counts.values.all { it == 2 })
    }

    // Using the same seed should build the same board every time.
    @Test
    fun sameSeed_makesSameBoard() {
        val board1 = newBoard(DEFAULT_SYMBOLS, Random(5))
        val board2 = newBoard(DEFAULT_SYMBOLS, Random(5))
        assertEquals(board1.tiles, board2.tiles)
    }

    // Flipping one tile should only reveal that tile.
    @Test
    fun flip_firstTile_revealsOnlyThatTile() {
        val board = newBoard(DEFAULT_SYMBOLS, Random(2))
        val flipped = board.flip(0)
        assertEquals(TileState.FaceUp, flipped.tiles[0].state)
        assertEquals(1, flipped.faceUpIndices().size)
        assertEquals(0, flipped.moves)
    }

    // Flipping two matching tiles should mark them as matched.
    @Test
    fun flip_matchingPair_becomesMatchedAndAddsMove() {
        val board0 = newBoard(DEFAULT_SYMBOLS, Random(3))
        val firstIndex = 0
        val face = board0.tiles[firstIndex].face
        val secondIndex = board0.tiles.indices.find { it != firstIndex && board0.tiles[it].face == face }!!

        val board1 = board0.flip(firstIndex)
        val board2 = board1.flip(secondIndex)

        assertEquals(TileState.Matched, board2.tiles[firstIndex].state)
        assertEquals(TileState.Matched, board2.tiles[secondIndex].state)
        assertEquals(1, board2.moves)
    }

    // A mismatch stays face up until the next tap clears it.
    @Test
    fun flip_mismatch_staysFaceUpThenNextTapClears() {
        val board0 = newBoard(DEFAULT_SYMBOLS, Random(4))
        val firstIndex = 0
        val face = board0.tiles[firstIndex].face
        val mismatchIndex = board0.tiles.indices.find { board0.tiles[it].face != face }!!
        val thirdIndex = board0.tiles.indices.first { it != firstIndex && it != mismatchIndex }

        val board1 = board0.flip(firstIndex)
        val board2 = board1.flip(mismatchIndex)

        assertEquals(TileState.FaceUp, board2.tiles[firstIndex].state)
        assertEquals(TileState.FaceUp, board2.tiles[mismatchIndex].state)
        assertEquals(1, board2.moves)

        val board3 = board2.flip(thirdIndex)
        assertEquals(TileState.FaceDown, board3.tiles[firstIndex].state)
        assertEquals(TileState.FaceDown, board3.tiles[mismatchIndex].state)
        assertEquals(TileState.FaceDown, board3.tiles[thirdIndex].state)
        assertEquals(1, board3.moves)
    }

    // flip() should return a new board without changing the old one.
    @Test
    fun flip_doesNotMutateOriginalBoard() {
        val board = newBoard(DEFAULT_SYMBOLS, Random(6))
        val flipped = board.flip(0)
        assertNotSame(board, flipped)
        assertEquals(TileState.FaceDown, board.tiles[0].state)
        assertEquals(TileState.FaceUp, flipped.tiles[0].state)
    }

    // Matching every pair should solve the game.
    @Test
    fun matchingEveryPair_solvesBoard() {
        var board = newBoard(DEFAULT_SYMBOLS, Random(7))
        val faces = board.tiles.map { it.face }.distinct()
        for (face in faces) {
            val indices = board.tiles.indices.filter { board.tiles[it].face == face }
            board = board.flip(indices[0]).flip(indices[1])
        }
        assertTrue(board.isSolved())
        assertEquals(PAIR_COUNT, board.pairsFound())
    }

    // Reset should keep the same board layout but clear everything.
    @Test
    fun reset_keepsFacesButClearsStatesAndMoves() {
        val board0 = newBoard(DEFAULT_SYMBOLS, Random(8))
        val originalFaces = board0.tiles.map { it.face }
        val board1 = board0.flip(0).flip(1)
        val reset = board1.reset()

        assertEquals(originalFaces, reset.tiles.map { it.face })
        assertTrue(reset.tiles.all { it.state == TileState.FaceDown })
        assertEquals(0, reset.moves)
    }
}
