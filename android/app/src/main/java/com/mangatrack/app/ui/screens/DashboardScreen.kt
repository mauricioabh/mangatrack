package com.mangatrack.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.mangatrack.app.data.api.ApiClient
import com.mangatrack.app.data.api.BookmarkItem

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onOpenManga: (String) -> Unit,
    onOpenSearch: () -> Unit,
    onOpenSettings: () -> Unit,
) {
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var bookmarks by remember { mutableStateOf<List<BookmarkItem>>(emptyList()) }

    LaunchedEffect(Unit) {
        loading = true
        error = null
        runCatching {
            val response = ApiClient.api.getBookmarks()
            if (response.success && response.data != null) {
                bookmarks = response.data
            } else {
                error = response.error ?: "Failed to load library"
            }
        }.onFailure {
            error = it.message
        }
        loading = false
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Library") },
                actions = {
                    Text(
                        "Search",
                        modifier = Modifier
                            .padding(end = 12.dp)
                            .clickable { onOpenSearch() },
                        style = MaterialTheme.typography.labelLarge,
                    )
                    Text(
                        "Settings",
                        modifier = Modifier
                            .padding(end = 16.dp)
                            .clickable { onOpenSettings() },
                        style = MaterialTheme.typography.labelLarge,
                    )
                },
            )
        },
    ) { padding ->
        when {
            loading -> CircularProgressIndicator(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
            )

            error != null -> Text(
                text = error ?: "",
                modifier = Modifier.padding(padding).padding(16.dp),
                color = MaterialTheme.colorScheme.error,
            )

            bookmarks.isEmpty() -> Text(
                text = "No favorites yet. Search manga and add to your library.",
                modifier = Modifier.padding(padding).padding(16.dp),
            )

            else -> LazyVerticalGrid(
                columns = GridCells.Adaptive(140.dp),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.padding(padding),
            ) {
                items(bookmarks, key = { it.mangaDexId }) { item ->
                    val manga = item.manga
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onOpenManga(item.mangaDexId) },
                    ) {
                        Column {
                            AsyncImage(
                                model = manga?.coverImage,
                                contentDescription = manga?.title,
                                modifier = Modifier.fillMaxWidth(),
                                contentScale = ContentScale.Crop,
                            )
                            Text(
                                text = manga?.title ?: "Manga",
                                modifier = Modifier.padding(8.dp),
                                style = MaterialTheme.typography.titleSmall,
                            )
                        }
                    }
                }
            }
        }
    }
}
