package com.mangatrack.app.data.auth

/**
 * Holds the active Clerk session JWT for API calls.
 * Updated from MainActivity when [com.clerk.api.Clerk.sessionFlow] emits.
 */
object SessionTokenStore {
    @Volatile
    var jwt: String? = null
}
