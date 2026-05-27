package com.mangatrack.app

import android.app.Application
import com.clerk.api.Clerk

class MangaTrackApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        val key = BuildConfig.CLERK_PUBLISHABLE_KEY
        if (key.isNotBlank()) {
            Clerk.initialize(
                context = this,
                publishableKey = key,
            )
        }
    }
}
