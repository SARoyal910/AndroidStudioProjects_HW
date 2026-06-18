// =============================================================================
// MainActivity.kt  —  HOMEWORK 5: "Profile Card"
//
// THE ASSIGNMENT:
//   Build a single profile card centered on the screen, like you'd see at the
//   top of a social-app profile. We have already done the SCAFFOLDING for you;
//   you finish THREE numbered TODOs that bring it to life.
//
// THE TARGET ("done") SCREEN:
//   • A circular avatar showing the person's initials, with a small GREEN
//     "online" dot pinned to its BOTTOM-RIGHT corner.
//   • The person's NAME (bold) and "@handle · Role" (muted) beneath it.
//   • A row of THREE stats (Posts / Followers / Following) that split the width
//     EVENLY — a big bold number on top, a small muted label below.
//   • A row of TWO equal-width buttons: a filled "Follow" and an outlined
//     "Message".
//
// WHAT YOU IMPLEMENT (search for the "TODO (you)" banners below):
//   TODO 1 — Online badge:  add a small green dot to the avatar's BOTTOM-END
//            corner.                         [builds on Lab 10: Box + align]
//   TODO 2 — Stats row:     make the three stats split the row EVENLY, number
//            bold on top / label muted below.   [builds on Labs 8 & 9: weight]
//   TODO 3 — Action buttons: a Row with a filled Button("Follow") and an
//            OutlinedButton("Message"), each equal width, with a gap between.
//                                          [builds on Labs 7 & 8: arrangement + weight]
//
// IT ALREADY COMPILES AND RUNS: each TODO currently shows a small grey
// PLACEHOLDER so the app never crashes. Replace each placeholder with the real
// thing, one TODO at a time, and re-run after each step.
// =============================================================================
package com.example.hw5profilecard

// --- Android framework --------------------------------------------------------
import android.os.Bundle                                     // savedInstanceState type passed to onCreate
import androidx.activity.ComponentActivity                   // base Activity that can host a Compose UI
import androidx.activity.compose.setContent                  // installs a Compose UI tree as the Activity content
import androidx.activity.enableEdgeToEdge                    // draw behind the system bars for a modern look

// --- Compose foundation: layout, drawing, shapes ------------------------------
import androidx.compose.foundation.background                // modifier: paint a color/shape behind content
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
import androidx.compose.foundation.border
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
import androidx.compose.ui.text.style.TextAlign              // horizontal text alignment (center the stat labels)
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

                // ─────────── TODO 1 (you): Online badge ───────────
                // Add a small (~16.dp) GREEN dot pinned to the avatar's
                // BOTTOM-RIGHT corner, so it reads as "this person is online".
                // HOW: add another Box INSIDE this outer Box. Give it
                //   Modifier.size(16.dp).clip(CircleShape).background(Online)
                // and position it with Modifier.align(Alignment.BottomEnd).
                // (Optional polish: a thin white ring so the dot pops off the
                // avatar — you can skip that for now.)
                // Until you build it, this grey placeholder marks the dot — but it
                // does NOT pin it yet: with no .align it sits at the Box's default
                // TOP-START corner. Your job is to make it GREEN and add
                // .align(Alignment.BottomEnd) so it lands on the bottom-right.

                // TODO1
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .size(16.dp)
                        .border(2.dp, Color.White, CircleShape)
                        .clip(CircleShape)
                        .background(Online)
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

        // ─────────── TODO 2 (you): Stats row ───────────
        // Make the THREE stats split this Row EVENLY, each one its own column:
        // a big BOLD number on top and a small MUTED label below, both centered.
        // HOW:
        //   • For each stat, emit a small Column wrapped in a cell that uses
        //     Modifier.weight(1f) — equal weights make the three cells share the
        //     width evenly (1 : 1 : 1).
        //   • Inside each cell: a Text for the NUMBER (fontWeight = Bold, large)
        //     above a Text for the LABEL (small, color = onSurfaceVariant),
        //     with horizontalAlignment = Alignment.CenterHorizontally.
        //   • The three stats are:
        //       profile.posts -> "Posts"
        //       profile.followers -> "Followers"
        //       profile.following -> "Following"
        //   • TIP: write one small StatCell(number, label) composable and call it
        //     three times so you don't repeat yourself.
        // Until you build it, this single placeholder fills the row:

        //TODO 2
        StatCell(profile.posts.toString(), "Posts", Modifier.weight(1f))
        StatCell(profile.followers.toString(), "Followers", Modifier.weight(1f))
        StatCell(profile.following.toString(), "Following", Modifier.weight(1f))
        // ───────────────────────────────────────────────
    }
}

@Composable
private fun StatCell(number: String, label: String, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = number,
            fontWeight = FontWeight.Bold,
            fontSize = 22.sp
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
        )
    }
}

// ===========================================================================
// ACTION BUTTONS — a "Follow" (filled) and a "Message" (outlined), side by side.
// ===========================================================================
@Composable
private fun ActionButtons() {
    // A full-width Row to hold the two buttons next to each other.
    Row(modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {

        // ─────────── TODO 3 (you): Action buttons ───────────
        // Put TWO equal-width buttons in this Row:
        //   • a filled Button with Text("Follow")
        //   • an OutlinedButton with Text("Message")
        // HOW:
        //   • Give the Row horizontalArrangement = Arrangement.spacedBy(12.dp)
        //     so there's a gap BETWEEN the two buttons.
        //   • Give EACH button Modifier.weight(1f) so they share the width
        //     evenly (each takes half the row).
        //   • onClick can stay empty for now: onClick = { }
        // Until you build it, this placeholder marks the spot:

        //TODO 3
        Button(
            onClick = {},
            modifier = Modifier.weight(1F)
        ) {
            Text("Follow")
        }
        OutlinedButton(
            onClick = {},
            modifier = Modifier.weight(1F)
        ) {
            Text("Message")
        }

        // ─────────────────────────────────────────────────────

        // (Once you've written the real buttons above, you can DELETE the
        // placeholder Text. These imports are already here for you to use:
        // Button, OutlinedButton, Arrangement, and Modifier.weight.)
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
