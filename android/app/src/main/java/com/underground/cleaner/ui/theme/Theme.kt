package com.underground.cleaner.ui.theme

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val MatrixGreen = Color(0xFF00FF41)
val MatrixBackground = Color(0xFF000000)
val MatrixSurface = Color(0xFF080E08)

val CyberPink = Color(0xFFFF2D95)
val CrimsonRed = Color(0xFFFF1A1A)
val AmberOrange = Color(0xFFFF7A00)
val DarkOledBg = Color(0xFF0A0A0A)

enum class CleanerThemePalette {
    MATRIX, PINK, RED, ORANGE
}

fun getUnderGroundColorScheme(palette: CleanerThemePalette): ColorScheme {
    return when (palette) {
        CleanerThemePalette.MATRIX -> darkColorScheme(
            primary = MatrixGreen,
            onPrimary = Color.Black,
            background = MatrixBackground,
            surface = MatrixSurface,
            onBackground = Color(0xFFD4FFD9),
            onSurface = Color(0xFFD4FFD9),
            outline = MatrixGreen.copy(alpha = 0.4f)
        )
        CleanerThemePalette.PINK -> darkColorScheme(
            primary = CyberPink,
            onPrimary = Color.Black,
            background = DarkOledBg,
            surface = Color(0xFF140C11),
            onBackground = Color(0xFFFFE3F1),
            onSurface = Color(0xFFFFE3F1),
            outline = CyberPink.copy(alpha = 0.4f)
        )
        CleanerThemePalette.RED -> darkColorScheme(
            primary = CrimsonRed,
            onPrimary = Color.Black,
            background = DarkOledBg,
            surface = Color(0xFF150909),
            onBackground = Color(0xFFFFE3E3),
            onSurface = Color(0xFFFFE3E3),
            outline = CrimsonRed.copy(alpha = 0.4f)
        )
        CleanerThemePalette.ORANGE -> darkColorScheme(
            primary = AmberOrange,
            onPrimary = Color.Black,
            background = DarkOledBg,
            surface = Color(0xFF150E07),
            onBackground = Color(0xFFFFEACC),
            onSurface = Color(0xFFFFEACC),
            outline = AmberOrange.copy(alpha = 0.4f)
        )
    }
}

@Composable
fun UnderGroundTheme(
    palette: CleanerThemePalette = CleanerThemePalette.MATRIX,
    content: @Composable () -> Unit
) {
    val colorScheme = getUnderGroundColorScheme(palette)
    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
