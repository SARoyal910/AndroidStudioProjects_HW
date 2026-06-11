package com.example.singleactivity

import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.ext.junit.runners.AndroidJUnit4

import org.junit.Test
import org.junit.runner.RunWith

import org.junit.Assert.*

/**
 * Instrumented test — runs on a real Android device or emulator, so it has access
 * to a real Context and the Android framework.
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
@RunWith(AndroidJUnit4::class) // Runs the test with the AndroidX JUnit4 runner.
class ExampleInstrumentedTest {
    @Test
    fun useAppContext() {
        // Get the Context of the app under test...
        val appContext = InstrumentationRegistry.getInstrumentation().targetContext
        // ...and verify the package name matches this app's applicationId.
        assertEquals("com.example.singleactivity", appContext.packageName)
    }
}
