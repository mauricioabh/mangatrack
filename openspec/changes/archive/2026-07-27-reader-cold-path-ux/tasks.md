## 1. API split + warm (shipped #47)

- [x] 1.1 Add `fields=pages` and `fields=meta` on chapter API
- [x] 1.2 Reader fetches pages/meta in parallel; unblock UI on pages
- [x] 1.3 `warmChapterPages` on detail, library continue, in-reader hop

## 2. Dynamic cold loading UX (shipped #48)

- [x] 2.1 Time-based stages: skeleton → cold-book → cold-skeleton; cancel on pages ready
- [x] 2.2 Animated book + rotating status copy for cold only
- [x] 2.3 Warm/cache path never requires book theater when pages resolve before threshold

## 3. Verify + process

- [x] 3.1 Confirm implementation on `main` matches design/specs
- [x] 3.2 `openspec validate reader-cold-path-ux --strict`
