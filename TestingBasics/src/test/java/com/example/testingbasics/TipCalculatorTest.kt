// =============================================================================
// TipCalculatorTest.kt  —  THE STAR OF THIS PROJECT: how to write unit tests
//
// WHERE THIS FILE LIVES (this matters!):
//   src/test/java/...   <-- "local" unit tests. Run on your computer's JVM, fast,
//                           no emulator. THIS is what you write most of the time.
//   src/androidTest/... <-- "instrumented" tests. Run on a device/emulator (they
//                           need Android). See TipUiTest.kt for one example.
// Android Studio creates both folders for you in every new project.
//
// HOW TO RUN THESE:
//   • Click the green ▶ in the gutter next to the class name (runs all) or next
//     to one @Test (runs just that one).
//   • Or in a terminal:  ./gradlew testDebugUnitTest
//   A green check = pass; a red X = fail, with a message telling you what differed.
//
// WHAT IS A UNIT TEST? A small function that calls your real code with a known
// input and ASSERTS the output is what you expect. If the assertion is false, the
// test fails. That's it. Tests are just code that checks other code.
//
// THE SHAPE OF EVERY TEST — "Arrange, Act, Assert" (AAA):
//   1. ARRANGE — set up the inputs.
//   2. ACT     — call the function under test.
//   3. ASSERT  — check the result matches what you expect.
// Read the first test below; it is labelled with those three steps.
// =============================================================================

package com.example.testingbasics

// --- The testing toolkit (JUnit 4 — the framework Android uses by default) ---
import org.junit.Assert.assertEquals   // assertEquals(expected, actual) — the workhorse
import org.junit.Assert.assertThrows   // assertThrows(Type) { ... } — checks code throws
import org.junit.Assert.assertTrue     // assertTrue(condition) — checks a boolean
import org.junit.Test                  // @Test marks a function as a test the runner executes

/**
 * Tests for [TipCalculator]. One class, many @Test functions. Each test should
 * check ONE behaviour and read like a sentence describing that behaviour.
 */
class TipCalculatorTest {

    // -------------------------------------------------------------------------
    // 1) Your very first test — fully labelled with Arrange / Act / Assert.
    //
    // The function name uses Kotlin's backtick syntax so it can be a readable
    // sentence: "tipAmount of 100 at 20 percent is 20". Good test names say
    // WHAT is tested and WHAT is expected — when one fails, the name alone tells
    // you what broke.
    // -------------------------------------------------------------------------
    @Test
    fun `tipAmount of 100 at 20 percent is 20`() {
        // ARRANGE — the inputs.
        val bill = 100.0
        val tipPercent = 20

        // ACT — call the real function.
        val tip = TipCalculator.tipAmount(bill, tipPercent)

        // ASSERT — state what we expect. assertEquals(EXPECTED, ACTUAL, DELTA).
        //
        // Why the third number (the "delta")? `tip` is a Double, and computers
        // can't store most decimals EXACTLY (e.g. 0.1 + 0.2 is 0.30000000000000004).
        // So for Doubles we don't demand an exact match — we allow a tiny tolerance.
        // 0.001 means "within a tenth of a cent", which is plenty for money.
        assertEquals(20.0, tip, 0.001)
    }

    @Test
    fun `tipAmount of 100 at 10 percent is 10`() {
        // ARRANGE — the inputs.
        val bill = 100.0
        val tipPercent = 10

        // ACT — call the real function.
        val tip = TipCalculator.tipAmount(bill, tipPercent)

        // ASSERT — state what we expect. assertEquals(EXPECTED, ACTUAL, DELTA).
        //
        // Why the third number (the "delta")? `tip` is a Double, and computers
        // can't store most decimals EXACTLY (e.g. 0.1 + 0.2 is 0.30000000000000004).
        // So for Doubles we don't demand an exact match — we allow a tiny tolerance.
        // 0.001 means "within a tenth of a cent", which is plenty for money.
        assertEquals(10.0, tip, 0.001)
    }

    // -------------------------------------------------------------------------
    // 2) A few more cases. ONE behaviour per test keeps failures easy to read:
    //    if "10 percent" breaks but "15 percent" passes, you instantly know which.
    // -------------------------------------------------------------------------
    @Test
    fun `tipAmount of 50 at 10 percent is 5`() {
        assertEquals(5.0, TipCalculator.tipAmount(50.0, 10), 0.001)
    }

    @Test
    fun `tipAmount of 80 at 15 percent is 12`() {
        assertEquals(12.0, TipCalculator.tipAmount(80.0, 15), 0.001)
    }

    // -------------------------------------------------------------------------
    // 3) BOUNDARY / EDGE CASES — the inputs people forget. Zero is the classic.
    //    Testing the "boring" extremes (0, empty, 1, the max) is where bugs hide.
    // -------------------------------------------------------------------------
    @Test
    fun `tipAmount is 0 when the bill is 0`() {
        assertEquals(0.0, TipCalculator.tipAmount(0.0, 20), 0.001)
    }

    @Test
    fun `tipAmount is 0 when the tip percent is 0`() {
        assertEquals(0.0, TipCalculator.tipAmount(100.0, 0), 0.001)
    }

    // -------------------------------------------------------------------------
    // 4) Testing a function that BUILDS ON another. totalWithTip uses tipAmount;
    //    we test it through its own public behaviour (total = bill + tip).
    // -------------------------------------------------------------------------
    @Test
    fun `totalWithTip adds the tip to the bill`() {
        assertEquals(120.0, TipCalculator.totalWithTip(100.0, 20), 0.001)
    }

    // -------------------------------------------------------------------------
    // 5) The split. A normal case, plus the "split by 1 == the whole total" case.
    // -------------------------------------------------------------------------
    @Test
    fun `perPerson splits the total evenly`() {
        // total = 100 + 20% = 120; split 4 ways = 30 each.
        assertEquals(30.0, TipCalculator.perPerson(100.0, 20, 4), 0.001)
    }

    @Test
    fun `perPerson with one person equals the whole total`() {
        assertEquals(120.0, TipCalculator.perPerson(100.0, 20, 1), 0.001)
    }

    // -------------------------------------------------------------------------
    // 6) Testing that bad input is REJECTED. perPerson requires people >= 1, so
    //    asking for 0 people must THROW. assertThrows passes ONLY if the code in
    //    the { } block throws the given exception type — a great way to prove your
    //    guards (require/check/throw) actually fire.
    // -------------------------------------------------------------------------
    @Test
    fun `perPerson throws when people is 0`() {
        assertThrows(IllegalArgumentException::class.java) {
            TipCalculator.perPerson(100.0, 20, 0)
        }
    }

    // -------------------------------------------------------------------------
    // 7) assertTrue / assertFalse — for when the thing you're checking is a
    //    yes/no fact rather than an exact value. Here: a tip is never negative.
    // -------------------------------------------------------------------------
    @Test
    fun `tip is never negative for normal input`() {
        val tip = TipCalculator.tipAmount(42.50, 18)
        assertTrue("tip should be >= 0 but was $tip", tip >= 0.0)
    }
}
