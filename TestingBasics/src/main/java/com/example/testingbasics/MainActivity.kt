// =============================================================================
// MainActivity.kt  —  the VERY BASIC UI (deliberately small)
//
// This screen exists only to give the testable logic a face. It is one Activity,
// one Composable, a little hoisted state (the bill text, the chosen tip %, the
// number of people), and three result lines. Every number it shows comes from
// TipCalculator — the same functions the tests check — so the UI can stay dumb.
//
// THE TESTING LESSON HERE: notice the screen has NO math of its own. It reads
// state and calls TipCalculator.tipAmount(...) / totalWithTip(...) / perPerson(...).
// Pushing the logic into a pure object (instead of writing `bill * pct / 100`
// inline in the Composable) is what makes it unit-testable. UI is hard to test;
// pure functions are easy. Keep the brains out of the UI.
// =============================================================================

package com.example.testingbasics

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.example.testingbasics.ui.theme.TestingBasicsTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            TestingBasicsTheme {
                TipScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)             // TopAppBar is an experimental Material 3 API
@Composable
fun TipScreen() {
    // --- Hoisted UI state (the only state this app has) ---------------------
    var billText by remember { mutableStateOf("") }     // what the user typed in the bill field
    var tipPercent by remember { mutableIntStateOf(15) } // which tip % is selected
    var people by remember { mutableIntStateOf(1) }      // how many ways to split

    // Parse the typed text into a number (blank/garbage -> 0.0). The UI does this
    // tiny bit of input handling; all the actual MATH lives in TipCalculator.
    val bill = billText.toDoubleOrNull() ?: 0.0

    Scaffold(
        topBar = { TopAppBar(title = { Text("Tip Tester") }) },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            // 1) Bill amount
            OutlinedTextField(
                value = billText,
                onValueChange = { billText = it },
                label = { Text("Bill amount") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth(),
            )

            // 2) Tip % — the selected option is a filled Button, the rest outlined.
            Text("Tip %", style = MaterialTheme.typography.labelLarge)
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                listOf(10, 15, 20).forEach { pct ->
                    if (pct == tipPercent) {
                        Button(onClick = { tipPercent = pct }) { Text("$pct%") }
                    } else {
                        OutlinedButton(onClick = { tipPercent = pct }) { Text("$pct%") }
                    }
                }
            }

            // 3) People stepper:  −   N   +   (clamped at 1)
            Text("Split between", style = MaterialTheme.typography.labelLarge)
            Row(
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
            ) {
                OutlinedButton(onClick = { if (people > 1) people-- }) { Text("−") }
                Text("$people", style = MaterialTheme.typography.titleLarge)
                OutlinedButton(onClick = { people++ }) { Text("+") }
            }

            // 4) Results — every value comes straight from TipCalculator.
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    ResultRow("Tip", TipCalculator.tipAmount(bill, tipPercent))
                    ResultRow("Total", TipCalculator.totalWithTip(bill, tipPercent))
                    ResultRow("Per person", TipCalculator.perPerson(bill, tipPercent, people))
                }
            }
        }
    }
}

/** One "Label …… $0.00" line. */
@Composable
private fun ResultRow(label: String, amount: Double) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, style = MaterialTheme.typography.bodyLarge)
        Text("$%.2f".format(amount), style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Bold)
    }
}
