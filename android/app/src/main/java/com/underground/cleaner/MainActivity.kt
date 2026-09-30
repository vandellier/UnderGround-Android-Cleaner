package com.underground.cleaner

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.underground.cleaner.ui.theme.CleanerThemePalette
import com.underground.cleaner.ui.theme.UnderGroundTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            UnderGroundTheme(palette = CleanerThemePalette.MATRIX) {
                Surface(
                    modifier = Modifier.fillMaxSize()
                ) {
                    // Compose NavHost for Clean, Storage, Apps, Monitor, Settings
                }
            }
        }
    }
}
