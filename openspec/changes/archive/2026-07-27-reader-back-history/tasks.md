## 1. Reader Back

- [x] 1.1 Replace header Back `Link` to `mangaPath` with a client handler: `router.back()` when same-origin history is usable; otherwise `router.push(mangaPath)`
- [x] 1.2 Keep explicit “Back to Manga” / series CTAs as `mangaPath` links (intentional up navigation)

## 2. Chapter navigation

- [x] 2.1 Change prev/next chapter navigation from `window.location.href` to `window.location.replace(readerPath(...))`

## 3. Verify

- [x] 3.1 Run `openspec validate reader-back-history --strict`
- [x] 3.2 Run typecheck/lint for touched files
