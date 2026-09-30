# UnderGround Android Cleaner (com.underground.cleaner)

Production-ready, forensic-grade Android storage cleaner and app manager engineered with Jetpack Compose, Material 3, Hilt, Room, and Coroutines/Flow, targeting **compileSdk 36 / targetSdk 36 (Android 16)**.

---

## 1. Architectural Highlights
- **Target SDK**: Android 16 (API 36), minimum SDK 26 (Android 8.0 Oreo).
- **16 KB Page-Size Alignment**: Pre-configured for Android 15/16 16 KB page-size kernel devices.
- **Android 16 Guided Cache Clearance**: Automated fallback overlay using Storage Settings intent when system-level background cache clearing is restricted.
- **Local-First & Zero Telemetry**: Zero ads in v1. No third-party network analytics or telemetry.
- **DataStore Matrix Theme Engine**: 4 locked OLED palettes:
  - Matrix Default: `#00FF41` on `#000000`
  - Cyber Pink / Black: `#FF2D95` on `#0A0A0A`
  - Crimson / Black: `#FF1A1A` on `#0A0A0A`
  - Amber / Black: `#FF7A00` on `#0A0A0A`

---

## 2. Play Console Permissions Justification

### `android.permission.MANAGE_EXTERNAL_STORAGE`
- **Play Policy Category**: File Management / Cleaner app utility.
- **Justification**: Needed to discover and purge orphaned residual files left behind in `/sdcard/Android/data/` by uninstalled apps, scan for zero-byte empty directories across `/sdcard/Download`, and compute chunked SHA-256 duplicate hashes across the file system that Scoped Storage MediaStore cannot index.
- **Submission Note**: Submit a screencast showing the Quick Clean residual file scanning and duplicate file deletion.

### `android.permission.PACKAGE_USAGE_STATS`
- **Justification**: Required for the **Unused Apps Detector** (locating apps unlaunched for 30, 60, or 90 days) and calculating background battery impact. The app shows an in-app educational dialog before dispatching the user to `Settings.ACTION_USAGE_ACCESS_SETTINGS`.

### `android.permission.READ_CALL_LOG` / `WRITE_CALL_LOG` & `READ_SMS` / `WRITE_SMS`
- **Justification**: Optional, strictly runtime-prompted Privacy Clean tools. Never requested at first app launch. Allows purging call history entries and expired OTP SMS messages older than 7 days.

---

## 3. 16 KB Page Alignment Verification

Ensure native libraries in your AAB and APK are aligned to 16 KB:
```bash
# Verify alignment of ELF binaries inside the APK
python3 tools/check_page_alignment.py app/build/outputs/apk/release/app-release.apk
```

---

## 4. Building Signed Release AAB & APK

```bash
# 1. Build signed Android App Bundle (AAB) for Google Play Console:
./gradlew bundleRelease

# 2. Build debug APK for testing & sideloading:
./gradlew assembleDebug

# Output files:
# app/build/outputs/bundle/release/app-release.aab
# app/build/outputs/apk/debug/app-debug.apk
```

---

## 5. Play Store Listing Copy

**App Name**: UnderGround Android Cleaner  
**Short Description (80 chars)**: High-performance terminal cleaner, storage analyzer & app manager for Android.  
**Full Description**: See `SettingsScreen.tsx` or in-app Settings > Play Store Copy.
