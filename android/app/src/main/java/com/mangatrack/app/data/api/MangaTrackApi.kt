package com.mangatrack.app.data.api

import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.HTTP
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface MangaTrackApi {
    @GET("api/manga/bookmarks")
    suspend fun getBookmarks(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 50,
    ): ApiEnvelope<List<BookmarkItem>>

    @GET("api/manga/{mangaId}")
    suspend fun getManga(@Path("mangaId") mangaId: String): ApiEnvelope<MangaDetail>

    @GET("api/manga/search")
    suspend fun searchManga(
        @Query("query") query: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
    ): ApiEnvelope<List<MangaCard>>

    @GET("api/manga/bookmark")
    suspend fun getBookmarkStatus(
        @Query("mangaId") mangaId: String,
    ): BookmarkStatusResponse

    @POST("api/manga/bookmark")
    suspend fun addBookmark(@Body body: MangaIdBody): ApiEnvelope<Unit?>

    @HTTP(method = "DELETE", path = "api/manga/bookmark", hasBody = true)
    suspend fun removeBookmark(@Body body: MangaIdBody): ApiEnvelope<Unit?>

    @GET("api/notifications")
    suspend fun getNotifications(): ApiEnvelope<List<NotificationItem>>

    @PATCH("api/notifications/{id}/read")
    suspend fun markNotificationRead(@Path("id") id: String): ApiEnvelope<Unit?>

    @GET("api/user/profile")
    suspend fun getProfile(): ProfileResponse

    @GET("api/user/preferences")
    suspend fun getPreferences(): PreferencesResponse

    @PATCH("api/user/preferences")
    suspend fun updatePreferences(
        @Body body: Map<String, Boolean>,
    ): PreferencesResponse

    @POST("api/user/push-token")
    suspend fun registerPushToken(@Body body: PushTokenBody): ApiEnvelope<Map<String, String>>

    @HTTP(method = "DELETE", path = "api/user/push-token", hasBody = true)
    suspend fun removePushToken(@Body body: PushTokenBody): ApiEnvelope<Unit?>

    @GET("api/chapters/{chapterId}")
    suspend fun getChapter(@Path("chapterId") chapterId: String): ChapterReaderResponse

    @GET("api/stripe/price-ids")
    suspend fun getStripePriceIds(): StripePriceIdsResponse

    @POST("api/stripe/create-checkout")
    suspend fun createCheckout(@Body body: StripeCheckoutRequest): StripeCheckoutResponse
}
