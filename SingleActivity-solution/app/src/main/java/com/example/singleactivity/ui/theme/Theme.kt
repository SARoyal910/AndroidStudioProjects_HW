package com.example.singleactivity.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme   // Detects the device's light/dark setting.
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme  // Android 12+ wallpaper-based colors (dark).
import androidx.compose.material3.dynamicLightColorScheme // Android 12+ wallpaper-based colors (light).
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

// The set of colors used when the app is in DARK mode (uses the lighter "80" shades).
private val DarkColorScheme = darkColorScheme(
    primary = Purple80,
    secondary = PurpleGrey80,
    tertiary = Pink80,
)

// The set of colors used when the app is in LIGHT mode (uses the deeper "40" shades).
private val LightColorScheme = lightColorScheme(
    primary = Purple40,
    secondary = PurpleGrey40,
    tertiary = Pink40,

    /* Other default colors to override
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
 * SingleActivityTheme — wraps the app's UI and supplies colors + typography so the
 * whole app looks consistent. MainActivity calls this in setContent { }.
 *
 * @param darkTheme whether to use dark colors (defaults to the system setting).
 * @param dynamicColor whether to derive colors from the user's wallpaper on Android 12+.
 * @param content the UI to display inside the theme.
 */
@Composable
fun SingleActivityTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Dynamic color is available on Android 12+ (API 31 / Build.VERSION_CODES.S).
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit,
) {
    // Decide which color scheme to use, in priority order:
    val colorScheme = when {
        // 1) If dynamic color is on AND the device is Android 12+, use wallpaper colors.
        dynamicColor && (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }

        // 2) Otherwise fall back to our hand-picked dark scheme...
        darkTheme -> DarkColorScheme
        // 3) ...or light scheme.
        else -> LightColorScheme
    }

    // Apply the chosen colors and the typography (from Type.kt) to all child content.
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content,
    )
}
