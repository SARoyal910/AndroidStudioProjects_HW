// =============================================================================
// MainActivity.kt  —  HOMEWORK 5: "Profile Card"  ★ SOLUTION (answer key) ★
//
// This is the COMPLETED version of the assignment: every "TODO (you)" slot has
// been filled in with the real Compose code, and each spot is marked with a
// "// SOLUTION:" comment explaining WHAT it does and WHY. Compare it against
// your own attempt in the starter to see one clean way to finish the card.
//
// THE TARGET ("done") SCREEN — and what we built to get there:
//   • A circular avatar showing the person's initials, with a small GREEN
//     "online" dot pinned to its BOTTOM-RIGHT corner.            [TODO 1 ✔]
//   • The person's NAME (bold) and "@handle · Role" (muted) beneath it.
//   • A row of THREE stats (Posts / Followers / Following) that split the width
//     EVENLY — a big bold number on top, a small muted label below. [TODO 2 ✔]
//   • A row of TWO equal-width buttons: a filled "Follow" and an outlined
//     "Message".                                                  [TODO 3 ✔]
//
// WHAT THE THREE TODOs TAUGHT (all now implemented below):
//   TODO 1 — Online badge:  a small green dot pinned to the avatar's BOTTOM-END
//            corner via Box + Modifier.align.   [builds on Lab 10: Box + align]
//   TODO 2 — Stats row:     three stat cells split the row EVENLY with
//            Modifier.weight(1f), number bold on top / label muted below.
//                                               [builds on Labs 8 & 9: weight]
//   TODO 3 — Action buttons: a Row with a filled Button("Follow") and an
//            OutlinedButton("Message"), each equal width, with a gap between.
//                                          [builds on Labs 7 & 8: arrangement + weight]
// =============================================================================
package com.example.hw5profilecard

// --- Android framework --------------------------------------------------------
import android.os.Bundle                                     // savedInstanceState type passed to onCreate
import androidx.activity.ComponentActivity                   // base Activity that can host a Compose UI
import androidx.activity.compose.setContent                  // installs a Compose UI tree as the Activity content
import androidx.activity.enableEdgeToEdge                    // draw behind the system bars for a modern look

// --- Compose foundation: layout, drawing, shapes ------------------------------
import androidx.compose.foundation.background                // modifier: paint a color/shape behind content
import androidx.compose.foundation.border                    // modifier: draw a colored ring/outline around content
import androidx.compose.foundation.layout.Arrangement        // spacing BETWEEN children on the main axis
import androidx.compose.foundation.layout.Box                // overlap/stack children on the z-axis (avatar + dot)
import androidx.compose.foundation.layout.Column             // stack children vertically
import androidx.compose.foundation.layout.Row                // place children horizontally
import androidx.compose.foundation.layout.Spacer             // an empty, fixed-size gap
import androidx.compose.foundation.layout.fillMaxSize        // modifier: take all width AND height
import androidx.compose.foundation.layout.fillMaxWidth       // modifier: take all available width
import androidx.compose.foundation.layout.height             // modifier: force a specific height
import androidx.compose.foundation.layout.padding            // modifier: add empty space AROUND content
import androidx.compose.foundation.layout.size               // modifier: force a specific width AND height
import androidx.compose.foundation.shape.CircleShape         // a perfect-circle shape (for the avatar + dot)

// --- Material 3 ---------------------------------------------------------------
import androidx.compose.material3.Button                     // a filled, high-emphasis button (the "Follow" action)
import androidx.compose.material3.MaterialTheme              // the theme's colorScheme + typography
import androidx.compose.material3.OutlinedButton             // an outlined, lower-emphasis button (the "Message" action)
import androidx.compose.material3.Surface                    // a themed background container (the page background)
import androidx.compose.material3.Text                       // draws a string

// --- Compose runtime ----------------------------------------------------------
import androidx.compose.runtime.Composable                   // marks a function/lambda as emitting UI

// --- Compose UI ---------------------------------------------------------------
import androidx.compose.ui.Alignment                         // how children align (Center, BottomEnd, …)
import androidx.compose.ui.Modifier                          // the "how to size/decorate/position" object
import androidx.compose.ui.draw.clip                         // modifier: clip content to a shape (round the avatar)
import androidx.compose.ui.graphics.Color                    // an ARGB color value
import androidx.compose.ui.text.font.FontWeight              // bold/normal weight (used on the name + stat numbers)
import androidx.compose.ui.tooling.preview.Preview           // @Preview rendering in Android Studio
import androidx.compose.ui.unit.dp                           // density-independent pixels (16.dp)
import androidx.compose.ui.unit.sp                           // scale-independent pixels for font sizes (22.sp)

import com.example.hw5profilecard.ui.theme.Hw5ProfileCardTheme // our Material 3 theme wrapper

// ===========================================================================
// COLORS — a couple of fixed brand colors so the card reads clearly on any theme.
// ===========================================================================
private val Brand = Color(0xFF2563EB)   // the avatar's circle fill (a confident blue)
private val Online = Color(0xFF22C55E)  // the GREEN "online" dot you'll add in TODO 1

// ===========================================================================
// DATA — a tiny model for one person's profile, plus a sample to render.
// A data class bundles related fields together and gives us a clean `ada.name`
// style of access (instead of juggling six separate variables).
// ===========================================================================
private data class Profile(
    val name: String,        // display name, e.g. "Ada Lovelace"
    val handle: String,      // the @username (without the @), e.g. "ada"
    val role: String,        // a short role/title, e.g. "Mathematician"
    val posts: Int,          // how many posts — shown in the stats row
    val followers: Int,      // how many followers — shown in the stats row
    val following: Int,      // how many accounts they follow — shown in the stats row
)

// The sample profile this screen renders. (In a real app this would come from a
// network call or database; here a constant keeps the focus on layout.)
private val ada = Profile(
    name = "Ada Lovelace",
    handle = "ada",
    role = "Mathematician",
    posts = 128,
    followers = 9400,
    following = 312,
)

// A helper that turns a full name into INITIALS for the avatar, e.g.
// "Ada Lovelace" -> "AL". We split on spaces, take the first letter of each of
// the first two words, uppercase them, and join. (Safe on a one-word name too.)
private fun initialsOf(name: String): String =
    name.trim().split(" ")                 // ["Ada", "Lovelace"]
        .filter { it.isNotEmpty() }        // drop any blank chunks from double spaces
        .take(2)                           // at most two initials
        .map { it.first().uppercaseChar() } // ['A', 'L']
        .joinToString("")                  // "AL"

// ===========================================================================
// THE SCREEN — a single centered profile card. (This whole outer structure is
// DONE for you; your work happens inside the three TODO slots it calls.)
// ===========================================================================
@Composable
fun ProfileScreen(modifier: Modifier = Modifier) {
    // Surface paints the themed page background behind everything.
    Surface(modifier = modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {

        // The outer column centers the whole card: fillMaxSize so it owns the
        // screen, generous padding so nothing hugs the edges, and
        // horizontalAlignment = CenterHorizontally so the avatar/name/rows all
        // sit on the vertical center line.
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp), // even gaps between the card's sections
        ) {

            // ---- AVATAR (with its online badge) ---------------------------------
            // A Box lets us STACK children on the z-axis: the big circle first,
            // then the small dot painted ON TOP of it (you add the dot in TODO 1).
            Box {
                // The avatar itself: a 96.dp square, clipped to a circle, filled
                // with the brand color, with the initials centered inside.
                Box(
                    modifier = Modifier
                        .size(96.dp)                 // 96 x 96 dp square…
                        .clip(CircleShape)           // …clipped to a perfect circle
                        .background(Brand),          // filled with the brand blue
                    contentAlignment = Alignment.Center, // center the initials text
                ) {
                    Text(
                        text = initialsOf(ada.name), // "AL"
                        color = Color.White,
                        fontSize = 34.sp,
                        fontWeight = FontWeight.Bold,
                    )
                }

                // SOLUTION (TODO 1 — online badge): a small GREEN dot pinned to
                // the avatar's BOTTOM-END corner. Because this Box is a child of
                // the OUTER Box (not the avatar circle), it's painted ON TOP of
                // the avatar on the z-axis. The key piece is .align(BottomEnd):
                // inside a Box, .align tells THIS child where to sit relative to
                // the Box's bounds — here the bottom-right corner — which is what
                // makes it read as a status badge on the rim of the avatar.
                //
                // POLISH: the order of modifiers is the order they're applied, so
                // we put .border UNDER the .background — the white 2.dp ring is
                // drawn slightly OUTSIDE the green fill, giving the dot a crisp
                // white halo so it pops off the blue avatar. We size this Box at
                // 18.dp (16 dot + the 2.dp ring) so the ring isn't clipped.
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)          // pin to bottom-right of the outer Box
                        .size(18.dp)                         // 16.dp dot + 2.dp white ring around it
                        .border(2.dp, Color.White, CircleShape) // thin white halo (drawn first/underneath)
                        .clip(CircleShape)                   // round the green fill to a circle
                        .background(Online),                 // the GREEN "online" fill on top
                )
            }

            // ---- NAME + HANDLE · ROLE -------------------------------------------
            // The display name, bold and large (titleLarge from the theme).
            Text(
                text = ada.name,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
            )
            // The secondary line: "@handle · Role" in a muted color so the name
            // stays the star. onSurfaceVariant is the theme's "muted text" color.
            Text(
                text = "@${ada.handle} · ${ada.role}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            // ---- STATS ROW (Posts / Followers / Following) ----------------------
            StatsRow(ada)

            // ---- ACTION BUTTONS (Follow / Message) ------------------------------
            ActionButtons()
        }
    }
}

// ===========================================================================
// STATS ROW — three side-by-side stats that share the row's width EVENLY.
// ===========================================================================
@Composable
private fun StatsRow(profile: Profile) {
    // A Row places its three stat cells horizontally; fillMaxWidth gives it the
    // whole card width to divide up among the three cells.
    Row(modifier = Modifier.fillMaxWidth()) {

        // SOLUTION (TODO 2 — stats row): three StatCell columns, each handed
        // Modifier.weight(1f). Inside a Row, weight asks for a SHARE of the
        // leftover space; three equal weights (1 : 1 : 1) split the full width
        // evenly, so the three stats line up in neat thirds no matter the screen
        // size. We factored the repeated "big number over small label" layout
        // into ONE StatCell composable (below) and call it three times — same
        // shape, different data — instead of copy-pasting the Column thrice.
        StatCell(value = profile.posts,     label = "Posts",     modifier = Modifier.weight(1f))
        StatCell(value = profile.followers, label = "Followers", modifier = Modifier.weight(1f))
        StatCell(value = profile.following, label = "Following", modifier = Modifier.weight(1f))
    }
}

// ===========================================================================
// STAT CELL — one stat: a big BOLD number stacked over a small MUTED label.
// Pulling this out into its own composable means the three stats can't drift
// out of sync (they're literally the same code), and the caller just supplies
// the data + a Modifier (we pass Modifier.weight(1f) so each cell claims an
// equal third of the row).
// ===========================================================================
@Composable
private fun StatCell(value: Int, label: String, modifier: Modifier = Modifier) {
    // A Column stacks the number above the label; CenterHorizontally lines them
    // up on the cell's center so the stat reads as one tidy unit.
    Column(modifier = modifier, horizontalAlignment = Alignment.CenterHorizontally) {
        // The NUMBER: large and bold so it's the eye-catching part of the stat.
        Text(
            text = value.toString(),
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
        )
        // The LABEL: small and muted (onSurfaceVariant) so it sits quietly
        // UNDER the number and explains what it counts.
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

// ===========================================================================
// ACTION BUTTONS — a "Follow" (filled) and a "Message" (outlined), side by side.
// ===========================================================================
@Composable
private fun ActionButtons() {
    // SOLUTION (TODO 3 — action buttons): a full-width Row with two buttons.
    // horizontalArrangement = Arrangement.spacedBy(12.dp) inserts a 12.dp gap
    // BETWEEN the children (so the buttons don't touch), and giving EACH button
    // Modifier.weight(1f) makes them share the remaining width evenly — each
    // takes half the row after that gap is reserved. The filled Button is the
    // high-emphasis primary action ("Follow"); the OutlinedButton is the
    // lower-emphasis secondary action ("Message"). onClick is empty for now
    // since this homework is about LAYOUT, not behavior.
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp), // 12.dp gap between the two buttons
    ) {
        // Filled, high-emphasis primary action; weight(1f) -> left half of the row.
        Button(onClick = {}, modifier = Modifier.weight(1f)) {
            Text("Follow")
        }
        // Outlined, lower-emphasis secondary action; weight(1f) -> right half.
        OutlinedButton(onClick = {}, modifier = Modifier.weight(1f)) {
            Text("Message")
        }
    }
}

// ===========================================================================
// MainActivity — the app's single Activity and Android's entry point.
// ===========================================================================
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()                              // draw edge-to-edge behind the system bars
        setContent {
            Hw5ProfileCardTheme {                       // apply our Material 3 theme
                ProfileScreen()                         // render the profile screen
            }
        }
    }
}

// ===========================================================================
// @Preview — render the screen in Android Studio's design pane without running
// the app on a device. As you complete each TODO, the preview updates too.
// ===========================================================================
@Preview(name = "Profile Card", showBackground = true, widthDp = 380, heightDp = 700)
@Composable
private fun ProfileScreenPreview() {
    Hw5ProfileCardTheme { ProfileScreen() }
}
