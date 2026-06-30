// =============================================================================
// TipCalculator.kt  —  the PURE LOGIC we are going to TEST
//
// THE WHOLE POINT OF THIS PROJECT: show how to write tests. The easiest code to
// test is PURE logic — functions that take inputs and return outputs, with NO
// Android, NO UI, NO clock, NO randomness, NO network. Same input -> same output,
// every time. That is exactly what makes a function testable: you can state
// "for THIS input I expect THAT output" and check it automatically.
//
// Notice there is not a single Android import in this file. Because of that, the
// tests in src/test/.../TipCalculatorTest.kt run on your laptop's plain JVM in
// milliseconds — no emulator, no device. Keep your important logic in pure files
// like this and testing becomes easy.
// =============================================================================

package com.example.testingbasics

// kotlin.math.round is used to round money to whole cents in one helper below.
import kotlin.math.round

/**
 * TipCalculator — a tiny bill/tip/split calculator.
 *
 * It is an `object` (a singleton) holding three pure functions. The UI
 * (MainActivity) calls these; the tests call the exact same functions. There is
 * only ONE copy of the rules, so if the tests pass, the app is using correct math.
 */
object TipCalculator {

    /**
     * The tip in dollars for a [bill] at a whole-number [tipPercent].
     *
     * Example: tipAmount(100.0, 20) -> 20.0
     *
     * (Assumes bill >= 0 and tipPercent >= 0 — the UI never sends anything else.)
     */
    fun tipAmount(bill: Double, tipPercent: Int): Double =
        bill * tipPercent / 100.0

    /**
     * The grand total: the [bill] plus its tip.
     *
     * Example: totalWithTip(100.0, 20) -> 120.0
     */
    fun totalWithTip(bill: Double, tipPercent: Int): Double =
        bill + tipAmount(bill, tipPercent)

    /**
     * The amount each person owes when the total is split [people] ways.
     *
     * Example: perPerson(100.0, 20, 4) -> 30.0   (total 120 / 4 people)
     *
     * GUARD: you cannot split a bill among zero people, so this REQUIRES at least
     * one. `require` throws IllegalArgumentException when the condition is false —
     * and "does this throw when it should?" is itself something we test (see the
     * `perPerson … throws` test). The result is rounded to whole cents.
     */
    fun perPerson(bill: Double, tipPercent: Int, people: Int): Double {
        require(people >= 1) { "people must be at least 1, was $people" }
        val share = totalWithTip(bill, tipPercent) / people
        return roundToCents(share)
    }

    /** Round a dollar amount to 2 decimal places (whole cents). 30.005 -> 30.01. */
    private fun roundToCents(amount: Double): Double =
        round(amount * 100.0) / 100.0
}
