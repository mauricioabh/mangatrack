package com.mangatrack.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.mangatrack.app.data.api.ApiClient
import com.mangatrack.app.data.api.MangaCard
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(
    onBack: () -> Unit,
    onOpenManga: (String) -> Unit,
) {
    var query by remember { mutableStateOf("") }
    var results by remember { mutableStateOf<List<MangaCard>>(emptyList()) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Search") },
                navigationIcon = {
                    Text(
                        "Back",
                        modifier = Modifier
                            .padding(start = 16.dp)
                            .clickable { onBack() },
                    )
                },
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Search manga") },
                singleLine = true,
            )
            Button(
                onClick = {
                    scope.launch {
                        error = null
                        runCatching {
                            val response = ApiClient.api.searchManga(query)
                            if (response.success && response.data != null) {
                                results = response.data
                            } else {
                                error = response.error
                            }
                        }.onFailure {
                            error = it.message
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text("Search")
            }
            error?.let { Text(it, color = androidx.compose.material3.MaterialTheme.colorScheme.error) }
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(results, key = { it.id }) { manga ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onOpenManga(manga.id) },
                    ) {
                        Column(Modifier.padding(12.dp)) {
                            AsyncImage(
                                model = manga.coverImage,
                                contentDescription = manga.title,
                                modifier = Modifier.fillMaxWidth(),
                            )
                            Text(manga.title)
                        }
                    }
                }
            }
        }
    }
}
