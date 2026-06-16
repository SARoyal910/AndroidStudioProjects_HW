// =============================================================================
// Color.kt
//
// The raw color palette for the app's Material 3 theme. These are just named
// Color constants — they don't decide where each color is used. Theme.kt maps
// them onto Material "roles" (primary, secondary, tertiary) for light and dark.
//
// Naming convention (from the Material 3 / Android Studio template):
//   • The "80" suffix means a high tone (~80) — light, pastel colors used for
//     the DARK theme (light accents read well on a dark background).
//   • The "40" suffix means a lower tone (~40) — deeper, saturated colors used
//     for the LIGHT theme (darker accents read well on a light background).
//
// Each color is an ARGB value written as 0xAARRGGBB: AA = alpha (FF = opaque),
// then red, green, blue. Example: 0xFFD0BCFF -> opaque, R=D0, G=BC, B=FF.
// =============================================================================
package com.example.navviewmodelstate.ui.theme

import androidx.compose.ui.graphics.Color                  // Compose's color type

// --- Dark-theme accents (light/pastel tones) ---------------------------------
val Purple80 = Color(0xFFD0BCFF)                            // primary accent in dark theme
val PurpleGrey80 = Color(0xFFCCC2DC)                        // secondary accent in dark theme
val Pink80 = Color(0xFFEFB8C8)                              // tertiary accent in dark theme

// --- Light-theme accents (deeper/saturated tones) ----------------------------
val Purple40 = Color(0xFF6650a4)                            // primary accent in light theme
val PurpleGrey40 = Color(0xFF625b71)                        // secondary accent in light theme
val Pink40 = Color(0xFF7D5260)                              // tertiary accent in light theme
