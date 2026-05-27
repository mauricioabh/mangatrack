package com.mangatrack.app.ui.navigation

object Routes {
    const val Auth = "auth"
    const val Dashboard = "dashboard"
    const val Search = "search"
    const val MangaDetail = "manga/{mangaId}"
    const val Settings = "settings"
    const val Reader = "reader/{chapterId}"

    fun mangaDetail(mangaId: String) = "manga/$mangaId"
    fun reader(chapterId: String) = "reader/$chapterId"
}
