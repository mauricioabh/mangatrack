package com.mangatrack.app

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.clerk.api.Clerk
import com.clerk.ui.auth.AuthView
import com.mangatrack.app.data.auth.SessionTokenStore
import com.mangatrack.app.ui.navigation.Routes
import com.mangatrack.app.billing.StripeCheckout
import com.mangatrack.app.ui.screens.DashboardScreen
import com.mangatrack.app.ui.screens.MangaDetailScreen
import com.mangatrack.app.ui.screens.ReaderScreen
import com.mangatrack.app.ui.screens.SearchScreen
import com.mangatrack.app.ui.screens.SettingsScreen
import com.mangatrack.app.ui.theme.MangaTrackTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val checkoutMessage = StripeCheckout.messageFromDeepLink(intent?.data)
        setContent {
            MangaTrackTheme {
                MangaTrackRoot(initialCheckoutMessage = checkoutMessage)
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        val message = StripeCheckout.messageFromDeepLink(intent.data)
        if (message != null) {
            setContent {
                MangaTrackTheme {
                    MangaTrackRoot(initialCheckoutMessage = message)
                }
            }
        }
    }
}

@Composable
private fun MangaTrackRoot(initialCheckoutMessage: String? = null) {
    val navController = rememberNavController()
    val session by Clerk.sessionFlow.collectAsState(initial = Clerk.session)
    val isInitialized by Clerk.isInitialized.collectAsState()

    LaunchedEffect(session) {
        session?.let { active ->
            runCatching {
                SessionTokenStore.jwt = active.getToken()?.jwt
            }
        } ?: run {
            SessionTokenStore.jwt = null
        }
    }

    if (!isInitialized) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
        return
    }

    LaunchedEffect(session) {
        if (session != null) {
            val route = navController.currentDestination?.route
            if (route == Routes.Auth || route == null) {
                navController.navigate(Routes.Dashboard) {
                    popUpTo(Routes.Auth) { inclusive = true }
                }
            }
        }
    }

    LaunchedEffect(initialCheckoutMessage, session) {
        if (session != null && initialCheckoutMessage != null) {
            navController.navigate(Routes.Settings) {
                launchSingleTop = true
            }
        }
    }

    NavHost(
        navController = navController,
        startDestination = Routes.Auth,
    ) {
        composable(Routes.Auth) {
            AuthView(modifier = Modifier.fillMaxSize())
        }
        composable(Routes.Dashboard) {
            DashboardScreen(
                onOpenManga = { id -> navController.navigate(Routes.mangaDetail(id)) },
                onOpenSearch = { navController.navigate(Routes.Search) },
                onOpenSettings = { navController.navigate(Routes.Settings) },
            )
        }
        composable(Routes.Search) {
            SearchScreen(
                onBack = { navController.popBackStack() },
                onOpenManga = { id -> navController.navigate(Routes.mangaDetail(id)) },
            )
        }
        composable(
            route = Routes.MangaDetail,
            arguments = listOf(navArgument("mangaId") { type = NavType.StringType }),
        ) { entry ->
            val mangaId = entry.arguments?.getString("mangaId") ?: return@composable
            MangaDetailScreen(
                mangaId = mangaId,
                onBack = { navController.popBackStack() },
                onOpenChapter = { chapterId ->
                    navController.navigate(Routes.reader(chapterId))
                },
            )
        }
        composable(
            route = Routes.Reader,
            arguments = listOf(navArgument("chapterId") { type = NavType.StringType }),
        ) { entry ->
            val chapterId = entry.arguments?.getString("chapterId") ?: return@composable
            ReaderScreen(
                chapterId = chapterId,
                onBack = { navController.popBackStack() },
                onOpenChapter = { nextId ->
                    navController.navigate(Routes.reader(nextId)) {
                        popUpTo(Routes.Reader) { inclusive = true }
                    }
                },
            )
        }
        composable(Routes.Settings) {
            SettingsScreen(
                onBack = { navController.popBackStack() },
                initialMessage = initialCheckoutMessage,
            )
        }
    }
}
