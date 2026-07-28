## 1. API pagination contract

- [x] 1.1 Propagate `hasNextPage` through `searchMangaMultiProvider` and return `hasMore` (OR across providers)
- [x] 1.2 Update `GET /api/manga/search` pagination to include `hasMore` and pass `page` correctly for multi-provider fetch
- [x] 1.3 Note search submit / pagination behavior in `docs/MANGA_SOURCE.md`

## 2. Shared book loading mark

- [x] 2.1 Add reusable book-only loading component (animation, no status text)
- [x] 2.2 Update reader cold-path to use book-only mark (remove COLD_STATUS_LINES / instructional copy)

## 3. Search page: explicit submit + lock + loading

- [x] 3.1 Remove debounce auto-search; search only on button/Enter and initial `?q=`
- [x] 3.2 AbortController + generation guard; lock input/Search/Filters/grid during primary search
- [x] 3.3 Show book loading mark during primary search; clear results heading totals
- [x] 3.4 Clear filters resets query/filters/results without auto-fetch

## 4. Search page: infinite scroll

- [x] 4.1 Track `page` / `hasMore`; IntersectionObserver sentinel for load-more
- [x] 4.2 Append with `provider:id` dedupe; sentinel loading / end states
- [x] 4.3 Abort load-more on new primary search

## 5. Verify

- [x] 5.1 Run `openspec validate search-explicit-infinite-scroll --strict`
- [x] 5.2 Run typecheck/lint on touched files
