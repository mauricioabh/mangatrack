package com.mangatrack.app.notifications

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat
import com.google.firebase.messaging.FirebaseMessaging
import com.mangatrack.app.data.api.ApiClient
import com.mangatrack.app.data.api.PushTokenBody
import kotlinx.coroutines.tasks.await

object PushTokenRegistrar {
    suspend fun registerCurrentDevice(context: Context): Result<Unit> {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val granted = ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS,
            ) == PackageManager.PERMISSION_GRANTED
            if (!granted) {
                return Result.failure(IllegalStateException("Notification permission not granted"))
            }
        }

        val token = FirebaseMessaging.getInstance().token.await()
        val response = ApiClient.api.registerPushToken(
            PushTokenBody(token = token, platform = "ANDROID"),
        )

        return if (response.success) {
            Result.success(Unit)
        } else {
            Result.failure(IllegalStateException(response.error ?: "Failed to register push token"))
        }
    }

    suspend fun unregisterToken(token: String): Result<Unit> {
        val response = ApiClient.api.removePushToken(PushTokenBody(token = token, platform = "ANDROID"))
        return if (response.success) {
            Result.success(Unit)
        } else {
            Result.failure(IllegalStateException(response.error ?: "Failed to remove push token"))
        }
    }
}
