package com.example.matchmania

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
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
    fun newBoard_has16Tiles() {
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
    //   (the other tile sharing its face) to force a guaranteed match — figure it out.
    // ═══════════════════════════════════════════════════════════════════════════
}
