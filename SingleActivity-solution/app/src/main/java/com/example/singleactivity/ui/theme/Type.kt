package com.example.singleactivity.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

// The app's typography. Material 3 defines many named text styles (bodyLarge,
// titleLarge, etc.); here we customize only bodyLarge and let the rest use defaults.
val Typography = Typography(
    bodyLarge = TextStyle(
        fontFamily = FontFamily.Default,  // Use the platform's default font.
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,                 // `.sp` = scale-independent pixels (respects user font size).
        lineHeight = 24.sp,
        letterSpacing = 0.5.sp,
    )
    /* Other default text styles to override
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
        letterSpacing = 0.5.sp,
    )
    */
)
