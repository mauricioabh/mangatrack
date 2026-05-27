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
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Scaffold
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
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.mangatrack.app.data.api.ApiClient
import com.mangatrack.app.data.api.MangaDetail
import com.mangatrack.app.data.api.MangaIdBody
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MangaDetailScreen(
    mangaId: String,
    onBack: () -> Unit,
    onOpenChapter: (String) -> Unit,
) {
    var loading by remember { mutableStateOf(true) }
    var detail by remember { mutableStateOf<MangaDetail?>(null) }
    var bookmarked by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(mangaId) {
        loading = true
        runCatching {
            val mangaResponse = ApiClient.api.getManga(mangaId)
            val status = ApiClient.api.getBookmarkStatus(mangaId)
            if (mangaResponse.success && mangaResponse.data != null) {
                detail = mangaResponse.data
                bookmarked = status.isBookmarked
            } else {
                error = mangaResponse.error
            }
        }.onFailure {
            error = it.message
        }
        loading = false
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(detail?.title ?: "Manga") },
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
        when {
            loading -> CircularProgressIndicator(Modifier.padding(padding).padding(16.dp))
            error != null -> Text(error ?: "", Modifier.padding(padding).padding(16.dp))
            detail != null -> {
                val manga = detail!!
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    AsyncImage(
                        model = manga.coverImage,
                        contentDescription = manga.title,
                        modifier = Modifier.fillMaxWidth(),
                    )
                    Text(manga.description)
                    Button(
                        onClick = {
                            scope.launch {
                                if (bookmarked) {
                                    ApiClient.api.removeBookmark(MangaIdBody(mangaId))
                                    bookmarked = false
                                } else {
                                    ApiClient.api.addBookmark(MangaIdBody(mangaId))
                                    bookmarked = true
                                }
                            }
                        },
                    ) {
                        Text(if (bookmarked) "Remove from library" else "Add to library")
                    }
                    LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(manga.chapters, key = { it.id }) { chapter ->
                            Text(
                                text = chapter.title.ifBlank { "Chapter ${chapter.chapterNumber ?: ""}" },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { onOpenChapter(chapter.id) }
                                    .padding(8.dp),
                            )
                        }
                    }
                }
            }
        }
    }
}
