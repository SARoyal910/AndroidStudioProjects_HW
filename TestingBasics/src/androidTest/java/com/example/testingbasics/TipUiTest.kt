// =============================================================================
// TipUiTest.kt  —  AN EXAMPLE UI (INSTRUMENTED) TEST
//
// This is the OTHER kind of test. It lives in src/androidTest/ and runs the real
// Compose UI, so it needs an Android runtime — a connected device or a running
// emulator. (The TipCalculator unit tests, by contrast, run on your laptop in
// milliseconds with no device.)
//
// HOW TO RUN: start an emulator (or plug in a phone), then click the green ▶ next
// to the class, or run:  ./gradlew connectedDebugAndroidTest
//
// THE PATTERN: a Compose UI test uses a "test rule" to host a composable, then
// FINDS nodes on screen and makes assertions / performs gestures:
//   • onNodeWithText("…")   — locate a node by the text it shows.
//   • assertIsDisplayed()    — assert it is on screen.
//   • performClick()         — tap it.
// Most of your tests should be fast unit tests (TipCalculatorTest); reach for UI
// tests to check that the screen WIRES the logic up correctly.
// =============================================================================

package com.example.testingbasics

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import com.example.testingbasics.ui.theme.TestingBasicsTheme
import org.junit.Rule
import org.junit.Test

class TipUiTest {

    // The rule that hosts our composable and lets us query/interact with it.
    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun screen_showsTitleTipOptionsAndResults() {
        // ARRANGE — render the real screen inside the test.
        composeTestRule.setContent {
            TestingBasicsTheme { TipScreen() }
        }

        // ASSERT — the key pieces are on screen.
        composeTestRule.onNodeWithText("Tip Tester").assertIsDisplayed()   // the title
        composeTestRule.onNodeWithText("10%").assertIsDisplayed()           // tip options
        composeTestRule.onNodeWithText("15%").assertIsDisplayed()
        composeTestRule.onNodeWithText("20%").assertIsDisplayed()
        composeTestRule.onNodeWithText("Per person").assertIsDisplayed()    // a result label

        // ACT — tapping a tip option is a one-liner. (Next step: type into the
        // bill field with performTextInput and assert the computed total appears.)
        composeTestRule.onNodeWithText("20%").performClick()
        composeTestRule.onNodeWithText("20%").assertIsDisplayed()
    }
}
