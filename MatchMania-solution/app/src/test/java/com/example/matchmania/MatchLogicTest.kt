package com.example.matchmania

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.random.Random

// ─────────────────────────────────────────────────────────────────────────────
// MatchLogicTest.kt  —  Part D.  SOLUTION (answer key).
//
// A full suite for the pure rules in MatchLogic.kt. Because the rules have no
// Android dependencies, JUnit exercises them directly on the JVM — no emulator,
// milliseconds to run:  ./gradlew testDebugUnitTest
// ─────────────────────────────────────────────────────────────────────────────
class MatchLogicTest {

    // Find the OTHER tile sharing a face with tile [i] (its twin). A face appears
    // exactly twice, so there is always exactly one.
    private fun Board.twinOf(i: Int): Int =
        tiles.indices.first { it != i && tiles[it].face == tiles[i].face }

    // Find any tile whose face differs from tile [i]'s — used to force a mismatch.
    private fun Board.differentFrom(i: Int): Int =
        tiles.indices.first { tiles[it].face != tiles[i].face }

    // Play the whole board to completion by matching one pair at a time.
    private fun solved(seed: Int): Board {
        var b = newBoard(DEFAULT_SYMBOLS, Random(seed))
        repeat(PAIR_COUNT) {
            val i = b.tiles.indexOfFirst { it.state == TileState.FaceDown }
            b = b.flip(i).flip(b.twinOf(i)) // reveal one, then its twin → both Matched
        }
        return b
    }

    // ── Generation ────────────────────────────────────────────────────────────

    @Test
    fun newBoard_has16Tiles() {
        assertEquals(CELL_COUNT, newBoard(DEFAULT_SYMBOLS).tiles.size)
    }

    @Test
    fun newBoard_hasEightDistinctFacesEachUsedTwice() {
        val counts = newBoard(DEFAULT_SYMBOLS).tiles.groupingBy { it.face }.eachCount()
        assertEquals(PAIR_COUNT, counts.size)            // 8 distinct faces…
        assertTrue(counts.values.all { it == 2 })        // …each appearing exactly twice.
    }

    @Test
    fun newBoard_startsFaceDown_movesZero_notSolved() {
        val b = newBoard(DEFAULT_SYMBOLS)
        assertTrue(b.tiles.all { it.state == TileState.FaceDown })
        assertEquals(0, b.moves)
        assertFalse(b.isSolved())
    }

    @Test
    fun seededGeneration_isDeterministic() {
        val a = newBoard(DEFAULT_SYMBOLS, Random(1)).tiles.map { it.face }
        val b = newBoard(DEFAULT_SYMBOLS, Random(1)).tiles.map { it.face }
        assertEquals(a, b) // same seed → identical face order, so other tests are repeatable.
    }

    // ── Flipping ────────────────────────────────────────────────────────────────

    @Test
    fun flip_revealsAFaceDownTile_withoutCountingAMove() {
        val b = newBoard(DEFAULT_SYMBOLS).flip(0)
        assertEquals(TileState.FaceUp, b.tiles[0].state)
        assertEquals(0, b.moves) // revealing the FIRST tile is not yet a pair attempt.
    }

    @Test
    fun flip_matchingPair_locksBoth_andCountsOneMove() {
        val fresh = newBoard(DEFAULT_SYMBOLS, Random(3))
        val i = 0
        val j = fresh.twinOf(i)
        val b = fresh.flip(i).flip(j)
        assertEquals(TileState.Matched, b.tiles[i].state)
        assertEquals(TileState.Matched, b.tiles[j].state)
        assertEquals(1, b.moves)
    }

    @Test
    fun flip_mismatch_leavesBothUp_thenNextTapClearsThem() {
        val fresh = newBoard(DEFAULT_SYMBOLS, Random(5))
        val i = 0
        val j = fresh.differentFrom(i)
        val two = fresh.flip(i).flip(j)
        // Two different faces are up — both stay FaceUp so the player sees the miss.
        assertEquals(TileState.FaceUp, two.tiles[i].state)
        assertEquals(TileState.FaceUp, two.tiles[j].state)
        assertEquals(1, two.moves)

        // The next tap only clears the mismatch — it reveals nothing and adds no move.
        val k = two.tiles.indices.first { it != i && it != j }
        val cleared = two.flip(k)
        assertEquals(TileState.FaceDown, cleared.tiles[i].state)
        assertEquals(TileState.FaceDown, cleared.tiles[j].state)
        assertEquals(TileState.FaceDown, cleared.tiles[k].state) // k was NOT revealed
        assertEquals(1, cleared.moves)                           // clearing is not a move
    }

    @Test
    fun flip_isImmutable_doesNotMutateTheOriginalBoard() {
        val original = newBoard(DEFAULT_SYMBOLS)
        original.flip(0)                                  // discard the result
        assertEquals(TileState.FaceDown, original.tiles[0].state)
        assertEquals(0, original.moves)
    }

    @Test
    fun flip_ignoresOutOfRangeAndAlreadyRevealedTiles() {
        val b = newBoard(DEFAULT_SYMBOLS)
        assertSame(b, b.flip(-1))    // out of range → unchanged board (same object)
        assertSame(b, b.flip(99))    // out of range
        val one = b.flip(0)          // tile 0 is now FaceUp
        assertSame(one, one.flip(0)) // tapping an already-FaceUp tile does nothing
    }

    // ── Winning & resetting ──────────────────────────────────────────────────────

    @Test
    fun matchingEveryPair_winsWithExactlyPairCountMoves() {
        val b = solved(7)
        assertTrue(b.isSolved())
        assertEquals(PAIR_COUNT, b.moves)               // 8 pairs → 8 moves on a perfect game
        assertEquals(PAIR_COUNT, b.pairsFound())
    }

    @Test
    fun reset_returnsAllTilesFaceDown_keepsFacesAndOrder_zeroesMoves() {
        val played = solved(9)                          // a fully-played board
        val r = played.reset()
        assertTrue(r.tiles.all { it.state == TileState.FaceDown })
        assertEquals(0, r.moves)
        // Same faces in the same positions — reset clears progress, not the layout.
        assertEquals(played.tiles.map { it.face }, r.tiles.map { it.face })
    }
}
