// =============================================================================
// Type.kt
//
// Defines the app's Material 3 type scale (Typography). MaterialTheme exposes
// this as MaterialTheme.typography, and screens reference named styles such as
// titleMedium, bodyMedium, headlineSmall, bodyLarge (see MainActivity.kt).
//
// Material 3 ships sensible defaults for every text style; this file only
// customizes the ones you choose to override. Here just `bodyLarge` is set
// explicitly — every other style keeps its Material default.
// =============================================================================
package com.example.exampleproject.ui.theme

import androidx.compose.material3.Typography                // the container for the full text style set
import androidx.compose.ui.text.TextStyle                   // describes one text style (font, size, spacing...)
import androidx.compose.ui.text.font.FontFamily             // which typeface to use (Default = system font)
import androidx.compose.ui.text.font.FontWeight             // weight: Normal, Medium, Bold, ...
import androidx.compose.ui.unit.sp                          // scale-independent pixels (respects user font scaling)

// Set of Material typography styles to start with.
val Typography = Typography(
    // bodyLarge — the default style for primary body copy (used by DetailScreen).
    bodyLarge = TextStyle(
        fontFamily = FontFamily.Default,                   // use the platform's default typeface
        fontWeight = FontWeight.Normal,                    // regular (non-bold) weight
        fontSize = 16.sp,                                  // text size
        lineHeight = 24.sp,                                // vertical space per line (controls line spacing)
        letterSpacing = 0.5.sp                             // slight extra space between characters
    )
    /* Other default text styles to override.
       Uncomment and customize any additional roles you want to restyle; anything
       left out simply keeps the Material 3 default:
    titleLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 22.sp,
        lineHeight = 28.sp,
        letterSpacing = 0.sp
    ),
    labelSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 11.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.5.sp
    )
    */
)
