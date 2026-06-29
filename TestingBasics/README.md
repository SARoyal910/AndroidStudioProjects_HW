# TestingBasics — how to write tests (a very simple project)

A deliberately tiny Compose app whose real purpose is to teach **how to create and run tests**. The app is a
one-screen **tip calculator**; the interesting part is the tests around it.

## The files that matter

| File | What it is |
|---|---|
| `src/main/java/.../TipCalculator.kt` | the **pure logic** under test — three functions, zero Android imports (which is exactly what makes it easy to test) |
| `src/test/java/.../TipCalculatorTest.kt` | **11 heavily-commented unit tests** — the star of the project. Read it top to bottom: it explains Arrange/Act/Assert, test naming, the Double delta, edge cases, and `assertThrows` |
| `src/androidTest/java/.../TipUiTest.kt` | one **Compose UI test** as a reference for the on-device kind |
| `src/main/java/.../MainActivity.kt` | the very basic UI (a bill field, tip % buttons, a people stepper, results) |

## Run the tests

```bash
# fast JVM unit tests (no emulator) — using the Android Studio JBR (JDK 21):
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./gradlew testDebugUnitTest

# the on-device UI test (needs a running emulator / device):
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./gradlew connectedDebugAndroidTest
```

In Android Studio: click the green ▶ in the gutter next to a test class or a single `@Test`.

## Interactive companion

Open **[`testing-explained.html`](./testing-explained.html)** in a browser — a self-contained, interactive intro to
testing. It has a **live test runner**: edit the calculator, press **Run tests**, and watch the same 11 tests pass or
fail (click **Break it** to see red). It also covers the anatomy of a test, how to add one in Android Studio, and an
assertion cheat-sheet.

> Built on the same Kotlin / Compose / Material 3 stack as the rest of the repo (Compose BOM 2026.02.01, JUnit 4).
> Verified: `assembleDebug` + `testDebugUnitTest` green (11/11), and the UI test compiles.
