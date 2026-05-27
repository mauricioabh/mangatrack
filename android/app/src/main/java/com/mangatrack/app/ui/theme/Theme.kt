package com.mangatrack.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

private val LightColors = lightColorScheme(
    primary = Indigo600,
    secondary = Purple600,
    tertiary = Blue600,
    background = Slate50,
    surface = Color.White,
)

private val DarkColors = darkColorScheme(
    primary = Blue600,
    secondary = Purple600,
    tertiary = Indigo600,
    background = Slate900,
    surface = Color(0xFF1E293B),
)

@Composable
fun MangaTrackTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        content = content,
    )
}

val MangaTrackGradient: Brush
    @Composable get() = Brush.linearGradient(
        colors = listOf(Blue600, Purple600, Indigo600),
    )
