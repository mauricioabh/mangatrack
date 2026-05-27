package com.mangatrack.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import coil.compose.LocalImageLoader
import com.mangatrack.app.data.api.ApiClient
import com.mangatrack.app.data.api.ChapterNav
import com.mangatrack.app.data.api.ChapterReader

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReaderScreen(
    chapterId: String,
    onBack: () -> Unit,
    onOpenChapter: (String) -> Unit,
) {
    val context = LocalContext.current
    val imageLoader = remember { ApiClient.imageLoader(context) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var chapter by remember { mutableStateOf<ChapterReader?>(null) }
    var mangaTitle by remember { mutableStateOf("") }
    var chapterList by remember { mutableStateOf<List<ChapterNav>>(emptyList()) }
    var currentIndex by remember { mutableIntStateOf(0) }

    LaunchedEffect(chapterId) {
        loading = true
        error = null
        runCatching {
            val response = ApiClient.api.getChapter(chapterId)
            if (response.success && response.chapter != null) {
                chapter = response.chapter
                mangaTitle = response.manga?.title ?: ""
                chapterList = response.chapters
                currentIndex = response.chapters.indexOfFirst { it.id == chapterId }.coerceAtLeast(0)
            } else {
                error = response.error ?: "Chapter not found"
            }
        }.onFailure {
            error = it.message
        }
        loading = false
    }

    CompositionLocalProvider(LocalImageLoader provides imageLoader) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Column {
                            Text(mangaTitle, style = MaterialTheme.typography.labelSmall)
                            Text(chapter?.title ?: "Reader")
                        }
                    },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Text("Back")
                        }
                    },
                )
            },
        ) { padding ->
            when {
                loading -> Box(
                    Modifier.fillMaxSize().padding(padding),
                    contentAlignment = Alignment.Center,
                ) {
                    CircularProgressIndicator()
                }
                error != null -> Box(
                    Modifier.fillMaxSize().padding(padding).padding(16.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(error ?: "")
                }
                chapter != null -> {
                    val pages = chapter!!.pages
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(padding),
                    ) {
                        if (chapterList.isNotEmpty()) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 8.dp, vertical = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                            ) {
                                IconButton(
                                    enabled = currentIndex > 0,
                                    onClick = {
                                        val prev = chapterList.getOrNull(currentIndex - 1) ?: return@IconButton
                                        onOpenChapter(prev.id)
                                    },
                                ) {
                                    Text("Prev")
                                }
                                Text(
                                    "${currentIndex + 1} / ${chapterList.size}",
                                    modifier = Modifier.align(Alignment.CenterVertically),
                                )
                                IconButton(
                                    enabled = currentIndex < chapterList.lastIndex,
                                    onClick = {
                                        val next = chapterList.getOrNull(currentIndex + 1) ?: return@IconButton
                                        onOpenChapter(next.id)
                                    },
                                ) {
                                    Text("Next")
                                }
                            }
                        }
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            verticalArrangement = Arrangement.spacedBy(4.dp),
                        ) {
                            itemsIndexed(pages, key = { index, _ -> "$chapterId-$index" }) { _, path ->
                                AsyncImage(
                                    model = ApiClient.absoluteApiUrl(path),
                                    contentDescription = null,
                                    modifier = Modifier.fillMaxWidth(),
                                    contentScale = ContentScale.FillWidth,
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
