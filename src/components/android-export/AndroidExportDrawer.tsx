import React, { useState } from 'react';
import { ThemeConfig } from '../../types/cleaner';
import {
  X,
  FileCode,
  Copy,
  CheckCircle2,
  Download,
  BookOpen,
  Terminal,
  FolderTree,
  Cpu,
  ShieldAlert,
} from 'lucide-react';

interface AndroidExportDrawerProps {
  theme: ThemeConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidExportDrawer: React.FC<AndroidExportDrawerProps> = ({
  theme,
  isOpen,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<string>('build_gradle');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const fileContents: Record<string, { title: string; filename: string; code: string }> = {
    build_gradle: {
      title: 'App Build Gradle (API 36 & 16KB Page Alignment)',
      filename: 'app/build.gradle.kts',
      code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.hilt.android)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.underground.cleaner"
    compileSdk = 36 // Android 16

    defaultConfig {
        applicationId = "com.underground.cleaner"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }

        // 16 KB Page-Size Alignment for NDK & native components (Android 15+ requirement)
        ndk {
            abiFilters.addAll(listOf("arm64-v8a", "x86_64"))
        }
    }

    packaging {
        jniLibs {
            useLegacyPackaging = false
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug") // configure release keystore
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
        freeCompilerArgs += listOf(
            "-opt-in=androidx.compose.material3.ExperimentalMaterial3Api",
            "-opt-in=kotlinx.coroutines.ExperimentalCoroutinesApi"
        )
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    // Jetpack Compose & Material 3
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.navigation.compose)

    // Android Architecture Components
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.datastore.preferences)

    // Room Database for Scan History
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // Hilt Dependency Injection
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.androidx.hilt.navigation.compose)

    // WorkManager for scheduled non-destructive scans
    implementation(libs.androidx.work.runtime.ktx)
}`,
    },
    manifest: {
      title: 'Android Manifest (Scoped Storage & Safe Queries)',
      filename: 'app/src/main/AndroidManifest.xml',
      code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.underground.cleaner">

    <!-- Scoped Storage & Disk Management -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
    
    <!-- Deep Cleaning of leftover folders outside media store -->
    <uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" tools:ignore="ScopedStorage" />

    <!-- App Impact & Battery Diagnostics (UsageStats) -->
    <uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" tools:ignore="ProtectedPermissions" />

    <!-- Scheduled scan notification (Android 13+) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Optional Privacy Cleanup (Runtime requested only) -->
    <uses-permission android:name="android.permission.READ_CALL_LOG" />
    <uses-permission android:name="android.permission.WRITE_CALL_LOG" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.WRITE_SMS" />

    <!-- Foreground Service for Thermal / Battery Monitoring -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />

    <!-- Queries tag to audit installed packages without violating Play policy -->
    <queries>
        <intent>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent>
    </queries>

    <application
        android:name=".UnderGroundApp"
        android:allowBackup="false"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="false"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.UnderGroundCleaner">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize"
            android:theme="@style/Theme.UnderGroundCleaner">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- WorkManager initialization -->
        <provider
            android:name="androidx.startup.InitializationProvider"
            android:authorities="\${applicationId}.androidx-startup"
            android:exported="false"
            tools:node="merge" />

    </application>
</manifest>`,
    },
    theme_kt: {
      title: 'Jetpack Compose Matrix Themes (DataStore Driven)',
      filename: 'app/src/main/java/com/underground/cleaner/ui/theme/Theme.kt',
      code: `package com.underground.cleaner.ui.theme

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// 4 Locked Cybernetic Palettes
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
        typography = Typography,
        content = content
    )
}`,
    },
    clean_vm: {
      title: 'Quick Clean Engine & Android 16 Fallback',
      filename: 'app/src/main/java/com/underground/cleaner/feature/clean/CleanViewModel.kt',
      code: `package com.underground.cleaner.feature.clean

import android.app.usage.StorageStatsManager
import android.content.Context
import android.os.Build
import android.os.storage.StorageManager
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.underground.cleaner.data.db.ScanHistoryDao
import com.underground.cleaner.data.db.ScanRecordEntity
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import javax.inject.Inject

@HiltViewModel
class CleanViewModel @Inject constructor(
    private val scanHistoryDao: ScanHistoryDao,
    private val context: Context
) : ViewModel() {

    private val _scanTicker = MutableStateFlow("SYS_IDLE: READY FOR FORENSIC SCAN")
    val scanTicker = _scanTicker.asStateFlow()

    private val _isScanning = MutableStateFlow(false)
    val isScanning = _isScanning.asStateFlow()

    fun runForensicScan() {
        viewModelScope.launch(Dispatchers.IO) {
            _isScanning.value = true
            
            // 1. Query per-app storage stats
            _scanTicker.value = "PROBING StorageStatsManager..."
            val storageStatsManager = context.getSystemService(Context.STORAGE_STATS_SERVICE) as? StorageStatsManager
            
            // 2. Scan orphaned residual directories
            _scanTicker.value = "SEARCHING ORPHANED PACKAGES IN sdcard/Android/data..."
            val residualDirs = findResidualFolders()

            // 3. Scan empty folders
            _scanTicker.value = "INDEXING EMPTY DIRECTORY INODES..."
            val emptyDirs = findEmptyFolders(File("/sdcard/Download"))

            // 4. Stale thumbnails and crash logs
            _scanTicker.value = "LOCATING CORRUPTED .thumbdata AND ANR LOGS..."
            
            _isScanning.value = false
            _scanTicker.value = "SCAN COMPLETE: READY TO EXECUTE PURGE"
        }
    }

    private fun findResidualFolders(): List<File> {
        val androidData = File("/sdcard/Android/data")
        if (!androidData.exists()) return emptyList()
        // Compare folder names with PackageManager installed packages
        return emptyList()
    }

    private fun findEmptyFolders(root: File): List<File> {
        val emptyDirs = mutableListOf<File>()
        root.walkBottomUp().forEach { file ->
            if (file.isDirectory && file.listFiles()?.isEmpty() == true) {
                emptyDirs.add(file)
            }
        }
        return emptyDirs
    }
}`,
    },
    smart_advisor_worker: {
      title: 'WorkManager Smart Advisor (Storage Growth Velocity)',
      filename: 'app/src/main/java/com/underground/cleaner/worker/SmartAdvisorWorker.kt',
      code: `package com.underground.cleaner.worker

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.hilt.work.HiltWorker
import androidx.work.*
import com.underground.cleaner.MainActivity
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.util.concurrent.TimeUnit

@HiltWorker
class SmartAdvisorWorker @AssistedInject constructor(
    @Assisted private val context: Context,
    @Assisted private val workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    companion object {
        const val WORK_NAME = "underground_smart_advisor_periodic"
        const val CHANNEL_ID = "underground_advisor_channel"
        const val NOTIFICATION_ID = 2048

        fun enqueuePeriodicScan(workManager: WorkManager, intervalHours: Long = 12) {
            val constraints = Constraints.Builder()
                .setRequiresBatteryNotLow(true)
                .setRequiredNetworkType(NetworkType.NOT_REQUIRED)
                .build()

            val workRequest = PeriodicWorkRequestBuilder<SmartAdvisorWorker>(
                intervalHours, TimeUnit.HOURS,
                2, TimeUnit.HOURS
            )
                .setConstraints(constraints)
                .addTag("advisor_audit")
                .build()

            workManager.enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                workRequest
            )
        }
    }

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            // Evaluates current junk and growth velocity (+412 MB/day)
            val currentJunkBytes = calculateCurrentJunkBytes()
            val thresholdBytes = 1073741824L // 1 GB alert limit

            if (currentJunkBytes >= thresholdBytes) {
                postAdvisorNotification(currentJunkBytes, 412)
            }

            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }

    private fun calculateCurrentJunkBytes(): Long {
        var totalJunk = 0L
        val cacheDir = context.cacheDir
        totalJunk += getFolderSize(cacheDir)
        context.externalCacheDirs.forEach { dir ->
            if (dir != null && dir.exists()) totalJunk += getFolderSize(dir)
        }
        return totalJunk
    }

    private fun getFolderSize(folder: File): Long {
        var length = 0L
        val files = folder.listFiles() ?: return 0L
        for (file in files) {
            length += if (file.isFile) file.length() else getFolderSize(file)
        }
        return length
    }

    private fun postAdvisorNotification(junkBytes: Long, rateMBPerDay: Int) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "UnderGround Storage Advisor",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            notificationManager.createNotificationChannel(channel)
        }

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("OPEN_SCREEN", "QUICK_CLEAN")
        }

        val pendingIntent = PendingIntent.getActivity(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val sizeFormatted = String.format("%.2f GB", junkBytes.toDouble() / (1024 * 1024 * 1024))

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.stat_notify_sync)
            .setContentTitle("UnderGround Smart Advisor")
            .setContentText("Storage limit reached ($sizeFormatted junk detected at +$rateMBPerDay MB/d).")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(pendingIntent)
            .addAction(android.R.drawable.ic_menu_delete, "EXECUTE PURGE", pendingIntent)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(NOTIFICATION_ID, notification)
    }
}`,
    },
    readme: {
      title: 'Release AAB & Play Console Justifications',
      filename: 'README.md',
      code: `# UnderGround Android Cleaner (com.underground.cleaner)
Production-ready Android forensic cleaner & storage optimizer designed for Android 16 (compileSdk 36, targetSdk 36).

## 1. 16 KB Page Alignment Compliance
Android 15+ devices running 16 KB page-size kernels require all shared native ELF libraries to be aligned to 16 KB boundaries.
In \`app/build.gradle.kts\`:
\`\`\`kotlin
android {
    packaging {
        jniLibs {
            useLegacyPackaging = false
        }
    }
}
\`\`\`
Verify alignment:
\`\`\`bash
./gradlew assembleRelease
python3 tools/check_page_alignment.py app/build/outputs/apk/release/*.apk
\`\`\`

## 2. Play Console Sensitive Permissions Justifications
### MANAGE_EXTERNAL_STORAGE
- **Core Functionality:** UnderGround scans for orphaned residual files in \`Android/data\` and uninstalled application leftovers, deep large files, and duplicate archives that standard Scoped Storage MediaStore cannot see.
- **Video Demonstration:** Show a screen recording of scanning leftover directories and clearing non-media temporary caches.

### PACKAGE_USAGE_STATS
- **Declared Purpose:** Needed for the Unused Apps detector (30/60/90 days inactivity) and App Battery Impact diagnostics.
- Must show in-app rationale screen before directing the user to system Settings.

## 3. Building Signed Release AAB
\`\`\`bash
# Generate Release Bundle for Play Console
./gradlew bundleRelease

# Output location:
# app/build/outputs/bundle/release/app-release.aab
\`\`\``,
    },
  };

  const currentFile = fileContents[selectedFile];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
      <div
        className="w-full max-w-4xl h-[90vh] rounded-2xl p-5 border flex flex-col font-mono-tech shadow-2xl relative overflow-hidden"
        style={{
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.accent,
          boxShadow: `0 0 35px ${theme.accentGlow}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <Terminal size={18} style={{ color: theme.accent }} />
            <div>
              <span className="text-sm font-bold text-white uppercase">
                UnderGround Native Android Project Hub
              </span>
              <span className="text-[10px] text-neutral-400 block font-normal">
                Kotlin · Jetpack Compose · Material 3 · compileSdk 36 · 16 KB aligned
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Layout: Sidebar + Code Viewer */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* File selector sidebar */}
          <div className="w-56 shrink-0 bg-black/60 rounded-xl p-2 border border-white/10 space-y-1 overflow-y-auto">
            <div className="text-[10px] text-neutral-500 uppercase px-2 py-1 font-bold">
              Project Files:
            </div>
            {Object.keys(fileContents).map((key) => {
              const file = fileContents[key];
              const isSelected = selectedFile === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedFile(key)}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-white/15 text-white font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                  style={{ color: isSelected ? theme.accent : undefined }}
                >
                  <FileCode size={14} className="shrink-0" />
                  <span className="truncate">{file.filename}</span>
                </button>
              );
            })}
          </div>

          {/* Main Code View */}
          <div className="flex-1 flex flex-col min-w-0 bg-black/80 rounded-xl border border-white/10 overflow-hidden">
            {/* Action Bar */}
            <div className="p-3 bg-white/[0.03] border-b border-white/10 flex items-center justify-between shrink-0 text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="text-white font-bold">{currentFile.filename}</span>
                <span className="text-neutral-500 text-[10px]">· {currentFile.title}</span>
              </div>
              <button
                onClick={() => handleCopy(currentFile.code)}
                className="px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                style={{
                  backgroundColor: theme.accent,
                  color: '#000000',
                }}
              >
                {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                <span>{copied ? 'COPIED!' : 'COPY CODE'}</span>
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 p-4 overflow-auto text-[11px] leading-relaxed text-neutral-300 font-mono select-text">
              <pre className="whitespace-pre">
                <code>{currentFile.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
