package com.mangatrack.app.billing

import android.content.Context
import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent
import com.mangatrack.app.data.api.ApiClient
import com.mangatrack.app.data.api.StripeCheckoutRequest

object StripeCheckout {
    private fun mobileReturnUrl(status: String): String =
        ApiClient.absoluteApiUrl("/stripe/mobile-return?status=$status")

    suspend fun createAndOpen(context: Context, priceId: String): Result<Unit> {
        if (priceId.isBlank()) {
            return Result.failure(IllegalStateException("Price ID not configured"))
        }

        val response = ApiClient.api.createCheckout(
            StripeCheckoutRequest(
                priceId = priceId,
                successUrl = mobileReturnUrl("success"),
                cancelUrl = mobileReturnUrl("cancel"),
            ),
        )

        val url = response.url
        return if (response.success && !url.isNullOrBlank()) {
            openUrl(context, url)
            Result.success(Unit)
        } else {
            Result.failure(IllegalStateException(response.error ?: "Checkout failed"))
        }
    }

    fun openUrl(context: Context, url: String) {
        CustomTabsIntent.Builder()
            .setShowTitle(true)
            .build()
            .launchUrl(context, Uri.parse(url))
    }

    fun messageFromDeepLink(uri: Uri?): String? = when (uri?.host) {
        "checkout" -> when (uri.pathSegments.firstOrNull()) {
            "success" -> "Premium activated. Welcome!"
            "cancel" -> "Checkout canceled."
            else -> null
        }
        else -> null
    }
}
