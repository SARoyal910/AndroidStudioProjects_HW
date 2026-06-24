// =============================================================================
// Theme.kt
//
// Defines Hw6TaskListTheme — the single Composable that wraps the entire app
// UI and supplies its Material 3 design system: the color scheme, typography,
// and (implicitly) shapes. Every screen reads from this via MaterialTheme.*.
//
// Three sources of colors are supported, chosen at runtime:
//   1. Dynamic color  — on Android 12+ (API 31 / "S"), colors are derived from
//                        the user's wallpaper for a personalized look.
//   2. DarkColorScheme — the static dark palette (used pre-12 or if dynamic off).
//   3. LightColorScheme— the static light palette (used pre-12 or if dynamic off).
// =============================================================================
package com.example.hw6tasklist.ui.theme

import android.app.Activity                                 // (template import; available if window tweaks are added)
import android.os.Build                                     // to check the device's Android version (SDK_INT)
import androidx.compose.foundation.isSystemInDarkTheme      // reads the system-wide light/dark setting
import androidx.compose.material3.MaterialTheme             // the provider that exposes colors/typography to children
import androidx.compose.material3.darkColorScheme           // builder for a dark color scheme
import androidx.compose.material3.dynamicDarkColorScheme    // wallpaper-based dark scheme (Android 12+)
import androidx.compose.material3.dynamicLightColorScheme   // wallpaper-based light scheme (Android 12+)
import androidx.compose.material3.lightColorScheme          // builder for a light color scheme
import androidx.compose.runtime.Composable                  // marks the theme function as a Composable
import androidx.compose.ui.platform.LocalContext            // grabs the current Context (needed for dynamic color)

// The static DARK palette, used when dynamic color is unavailable/disabled and
// the system is in dark mode. Maps the "80" tones from Color.kt onto roles.
private val DarkColorScheme = darkColorScheme(
    primary = Purple80,                                     // main accent (buttons, highlights)
    secondary = PurpleGrey80,                               // supporting accent
    tertiary = Pink80                                       // occasional contrast accent
)

// The static LIGHT palette, used when dynamic color is unavailable/disabled and
// the system is in light mode. Maps the "40" tones from Color.kt onto roles.
private val LightColorScheme = lightColorScheme(
    primary = Purple40,                                     // main accent (buttons, highlights)
    secondary = PurpleGrey40,                               // supporting accent
    tertiary = Pink40                                       // occasional contrast accent

    /* Other default colors to override.
       Uncomment and set any of these to customize surfaces/text colors beyond
       the three accents above:
    background = Color(0xFFFFFBFE),
    surface = Color(0xFFFFFBFE),
    onPrimary = Color.White,
    onSecondary = Color.White,
    onTertiary = Color.White,
    onBackground = Color(0xFF1C1B1F),
    onSurface = Color(0xFF1C1B1F),
    */
)

/**
 * Hw6TaskListTheme — wrap the app's content in this to apply the design system.
 *
 * @param darkTheme    whether to use dark colors. Defaults to following the
 *                     system setting via isSystemInDarkTheme().
 * @param dynamicColor whether to use wallpaper-based dynamic color when the
 *                     device supports it (Android 12+). Defaults to true.
 * @param content      the UI to render inside this theme.
 */
@Composable
fun Hw6TaskListTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Dynamic color is available on Android 12+ (API level 31).
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    // Decide which color scheme to hand to MaterialTheme, in priority order.
    val colorScheme = when {
        // 1. Prefer dynamic (wallpaper-derived) color when both requested AND the
        //    device runs Android 12 (codename "S") or newer.
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current             // dynamic schemes need a Context
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }

        // 2. Otherwise fall back to our static palettes based on dark/light mode.
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    // MaterialTheme makes the chosen colors and the Typography (see Type.kt)
    // available to every Composable in `content` through MaterialTheme.colorScheme
    // and MaterialTheme.typography.
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
