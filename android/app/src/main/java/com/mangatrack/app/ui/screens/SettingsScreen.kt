package com.mangatrack.app.ui.screens

import android.Manifest
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.mangatrack.app.billing.StripeCheckout
import com.mangatrack.app.data.api.ApiClient
import com.mangatrack.app.data.api.NotificationItem
import com.mangatrack.app.notifications.PushTokenRegistrar
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onBack: () -> Unit,
    initialMessage: String? = null,
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var emailNotifications by remember { mutableStateOf(true) }
    var deviceNotifications by remember { mutableStateOf(false) }
    var statusMessage by remember { mutableStateOf(initialMessage) }
    var notifications by remember { mutableStateOf<List<NotificationItem>>(emptyList()) }
    var tier by remember { mutableStateOf("BASIC") }
    var monthlyPriceId by remember { mutableStateOf("") }
    var yearlyPriceId by remember { mutableStateOf("") }
    var checkoutBusy by remember { mutableStateOf(false) }
    var loadingPremium by remember { mutableStateOf(true) }

    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) { granted ->
        if (granted) {
            scope.launch {
                PushTokenRegistrar.registerCurrentDevice(context)
                    .onSuccess {
                        deviceNotifications = true
                        statusMessage = "Device notifications enabled"
                    }
                    .onFailure {
                        statusMessage = it.message
                    }
            }
        } else {
            statusMessage = "Notification permission denied"
        }
    }

    LaunchedEffect(Unit) {
        runCatching {
            val profile = ApiClient.api.getProfile()
            tier = profile.user?.tier ?: "BASIC"
            val prefs = ApiClient.api.getPreferences()
            emailNotifications = prefs.preferences?.emailNotifications ?: true
            val notif = ApiClient.api.getNotifications()
            if (notif.success && notif.data != null) {
                notifications = notif.data
            }
            val prices = ApiClient.api.getStripePriceIds()
            if (prices.success && prices.priceIds != null) {
                monthlyPriceId = prices.priceIds.monthly
                yearlyPriceId = prices.priceIds.yearly
            }
        }
        loadingPremium = false
    }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Settings") }) },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            if (tier == "PREMIUM") {
                Card(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(16.dp)) {
                        Text("Premium", style = MaterialTheme.typography.titleMedium)
                        Text("You have unlimited bookmarks and full access.")
                    }
                }
            } else if (loadingPremium) {
                CircularProgressIndicator()
            } else {
                Card(Modifier.fillMaxWidth()) {
                    Column(
                        Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        Text("Upgrade to Premium", style = MaterialTheme.typography.titleMedium)
                        Text(
                            "Unlimited bookmarks. Checkout opens in your browser and returns to the app.",
                            style = MaterialTheme.typography.bodySmall,
                        )
                        Button(
                            onClick = {
                                checkoutBusy = true
                                scope.launch {
                                    StripeCheckout.createAndOpen(context, monthlyPriceId)
                                        .onSuccess {
                                            statusMessage = "Complete payment in the browser…"
                                        }
                                        .onFailure {
                                            statusMessage = it.message
                                        }
                                    checkoutBusy = false
                                }
                            },
                            enabled = !checkoutBusy && monthlyPriceId.isNotBlank(),
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text(if (checkoutBusy) "Opening…" else "Monthly plan")
                        }
                        Button(
                            onClick = {
                                checkoutBusy = true
                                scope.launch {
                                    StripeCheckout.createAndOpen(context, yearlyPriceId)
                                        .onSuccess {
                                            statusMessage = "Complete payment in the browser…"
                                        }
                                        .onFailure {
                                            statusMessage = it.message
                                        }
                                    checkoutBusy = false
                                }
                            },
                            enabled = !checkoutBusy && yearlyPriceId.isNotBlank(),
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text("Yearly plan")
                        }
                    }
                }
            }

            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Email notifications")
                    Switch(
                        checked = emailNotifications,
                        onCheckedChange = { checked ->
                            emailNotifications = checked
                            scope.launch {
                                ApiClient.api.updatePreferences(
                                    mapOf("emailNotifications" to checked),
                                )
                            }
                        },
                    )
                }
            }

            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Device notifications")
                    Text(
                        "Alerts for new chapters on this phone. Same account as the web app.",
                        style = MaterialTheme.typography.bodySmall,
                    )
                    Button(
                        onClick = {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                permissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                            } else {
                                scope.launch {
                                    PushTokenRegistrar.registerCurrentDevice(context)
                                        .onSuccess {
                                            deviceNotifications = true
                                            statusMessage = "Device notifications enabled"
                                        }
                                        .onFailure {
                                            statusMessage = it.message
                                        }
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text(if (deviceNotifications) "Registered" else "Enable on this device")
                    }
                }
            }

            statusMessage?.let {
                Text(it, style = MaterialTheme.typography.bodyMedium)
            }

            Text("Recent in-app notifications", style = MaterialTheme.typography.titleSmall)
            notifications.take(10).forEach { item ->
                Card(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(12.dp)) {
                        Text(item.title, style = MaterialTheme.typography.titleSmall)
                        Text(item.message, style = MaterialTheme.typography.bodySmall)
                    }
                }
            }

            Button(onClick = onBack, modifier = Modifier.fillMaxWidth()) {
                Text("Back")
            }
        }
    }
}
