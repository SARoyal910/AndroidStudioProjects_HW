package com.example.singleactivity

// --- Android framework / AndroidX imports ---
import android.os.Bundle                          // Carries saved-instance state into onCreate.
import androidx.activity.ComponentActivity        // Base class for an Activity that hosts Jetpack Compose UI.
import androidx.activity.compose.setContent       // Sets the Compose UI tree as this Activity's content.
import androidx.activity.enableEdgeToEdge         // Lets the app draw behind the system bars (modern look).
import androidx.compose.foundation.layout.Column   // B1: stack the two greeting lines vertically
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold         // Provides basic Material screen structure + insets.
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable         // Marks a function as emitting Compose UI.
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview // Enables design-time @Preview rendering in the IDE.
import com.example.singleactivity.ui.theme.SingleActivityTheme

/**
 * MainActivity — the app's single Activity and its entry point (declared as the
 * LAUNCHER activity in AndroidManifest.xml). It hosts all of the app's Compose UI.
 */
class MainActivity : ComponentActivity() {
    // onCreate is the first lifecycle callback; it runs when the Activity is created.
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge() // Draw edge-to-edge behind the status/navigation bars.
        setContent {
            // Wrap the UI in the app's Compose theme (colors, typography).
            SingleActivityTheme {
                // Scaffold supplies standard insets via innerPadding so content
                // isn't drawn under the system bars.
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    Greeting(
                        name = "Android",
                        course = "Mobile Dev",                 // B1: the new second argument
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}

/**
 * Greeting — a simple composable that displays two lines: a greeting and the course.
 * @param name the name to greet.
 * @param course the course to welcome the student to.   // B1: new parameter
 * @param modifier layout/appearance modifier passed in by the caller.
 */
@Composable
fun Greeting(name: String, course: String, modifier: Modifier = Modifier) {
    // B1: two lines of text need a container — a Column stacks them vertically.
    Column(modifier = modifier) {
        Text(text = "Hello $name!")              // line 1
        Text(text = "Welcome to $course.")       // line 2 (uses the new `course` arg)
    }
}

/**
 * A design-time preview of [Greeting] so it renders in Android Studio's Compose
 * preview pane without running the app on a device.
 */
// B1: uncommented and updated so it still compiles with the new `course` argument.
@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    SingleActivityTheme {
        Greeting("Android", "Mobile Dev")        // both args; modifier defaults
    }
}
