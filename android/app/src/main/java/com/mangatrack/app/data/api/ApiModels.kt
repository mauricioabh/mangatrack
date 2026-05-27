package com.mangatrack.app.data.api

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ApiEnvelope<T>(
    val success: Boolean,
    val data: T? = null,
    val error: String? = null,
    val pagination: Pagination? = null,
)

@Serializable
data class Pagination(
    val page: Int,
    val limit: Int,
    val total: Int,
    val pages: Int,
)

@Serializable
data class BookmarkItem(
    val id: String,
    @SerialName("mangaDexId") val mangaDexId: String,
    val manga: MangaCard? = null,
)

@Serializable
data class MangaCard(
    val id: String,
    val title: String,
    val author: String = "",
    val coverImage: String = "",
    val status: String = "",
)

@Serializable
data class MangaDetail(
    val id: String,
    val title: String,
    val author: String = "",
    val description: String = "",
    val coverImage: String = "",
    val status: String = "",
    val chapters: List<ChapterItem> = emptyList(),
)

@Serializable
data class ChapterItem(
    val id: String,
    val title: String,
    val chapterNumber: String? = null,
)

@Serializable
data class BookmarkStatusResponse(
    val success: Boolean = false,
    @SerialName("isBookmarked") val isBookmarked: Boolean = false,
)

@Serializable
data class NotificationItem(
    val id: String,
    val type: String,
    val title: String,
    val message: String,
    val read: Boolean,
    @SerialName("mangaDexId") val mangaDexId: String? = null,
    @SerialName("chapterDexId") val chapterDexId: String? = null,
)

@Serializable
data class UserProfile(
    val id: String,
    val name: String? = null,
    val email: String,
    val tier: String = "BASIC",
)

@Serializable
data class ProfileResponse(
    val success: Boolean,
    val user: UserProfile? = null,
)

@Serializable
data class PreferencesResponse(
    val success: Boolean,
    val preferences: UserPreferences? = null,
)

@Serializable
data class UserPreferences(
    val emailNotifications: Boolean,
)

@Serializable
data class PushTokenBody(
    val token: String,
    val platform: String = "ANDROID",
)

@Serializable
data class MangaIdBody(
    @SerialName("mangaId") val mangaId: String,
)

@Serializable
data class ChapterReaderResponse(
    val success: Boolean,
    val chapter: ChapterReader? = null,
    val manga: MangaRef? = null,
    val chapters: List<ChapterNav> = emptyList(),
    val error: String? = null,
)

@Serializable
data class ChapterReader(
    val id: String,
    val title: String,
    val chapterNumber: Double = 0.0,
    val pages: List<String> = emptyList(),
)

@Serializable
data class MangaRef(
    val id: String,
    val title: String,
)

@Serializable
data class ChapterNav(
    val id: String,
    val title: String,
    val chapterNumber: Double = 0.0,
)

@Serializable
data class StripePriceIdsResponse(
    val success: Boolean,
    val priceIds: StripePriceIds? = null,
    val error: String? = null,
)

@Serializable
data class StripePriceIds(
    val monthly: String = "",
    val yearly: String = "",
)

@Serializable
data class StripeCheckoutRequest(
    val priceId: String,
    val successUrl: String? = null,
    val cancelUrl: String? = null,
)

@Serializable
data class StripeCheckoutResponse(
    val success: Boolean,
    val url: String? = null,
    val error: String? = null,
)
