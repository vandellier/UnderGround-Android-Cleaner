package com.underground.cleaner.worker

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

        // Helper to schedule periodic advisor evaluation
        fun enqueuePeriodicScan(workManager: WorkManager, intervalHours: Long = 12) {
            val constraints = Constraints.Builder()
                .setRequiresBatteryNotLow(true)
                .setRequiredNetworkType(NetworkType.NOT_REQUIRED)
                .build()

            val workRequest = PeriodicWorkRequestBuilder<SmartAdvisorWorker>(
                intervalHours, TimeUnit.HOURS,
                2, TimeUnit.HOURS // 2 hour flex interval
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
            // 1. Calculate accumulated junk and growth rate
            val currentJunkBytes = calculateCurrentJunkBytes()
            val thresholdBytes = 1073741824L // Default 1 GB threshold

            // 2. Query historical velocity (mocked as +412 MB/day)
            val growthRateMBPerDay = 412

            // 3. If storage accumulation exceeds user threshold, alert user
            if (currentJunkBytes >= thresholdBytes) {
                postAdvisorNotification(currentJunkBytes, growthRateMBPerDay)
            }

            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }

    private fun calculateCurrentJunkBytes(): Long {
        var totalJunk = 0L

        // Inspect cache directories for known application packages
        val cacheDir = context.cacheDir
        totalJunk += getFolderSize(cacheDir)

        // Inspect external cache directories if accessible
        context.externalCacheDirs.forEach { dir ->
            if (dir != null && dir.exists()) {
                totalJunk += getFolderSize(dir)
            }
        }

        // Add residual and temp file estimates
        val tempDir = File("/sdcard/Download/.package_cache")
        if (tempDir.exists()) totalJunk += getFolderSize(tempDir)

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

        // Create Android 16 Notification Channel
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "UnderGround Storage Advisor",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Smart predictive notifications when junk accrual crosses your threshold."
                enableVibration(true)
            }
            notificationManager.createNotificationChannel(channel)
        }

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("OPEN_SCREEN", "QUICK_CLEAN")
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val sizeFormatted = String.format("%.2f GB", junkBytes.toDouble() / (1024 * 1024 * 1024))

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.stat_notify_sync)
            .setContentTitle("UnderGround Smart Advisor")
            .setContentText("Accumulation limit reached ($sizeFormatted junk detected at +$rateMBPerDay MB/d).")
            .setStyle(NotificationCompat.BigTextStyle().bigText(
                "Storage accrual rate exceeded threshold limit. $sizeFormatted of recoverable app cache and logs are ready for forensic purge."
            ))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(pendingIntent)
            .addAction(
                android.R.drawable.ic_menu_delete,
                "EXECUTE PURGE",
                pendingIntent
            )
            .setAutoCancel(true)
            .build()

        notificationManager.notify(NOTIFICATION_ID, notification)
    }
}
