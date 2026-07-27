## 1. UI primitives

- [x] 1.1 Add shadcn `slider` (and `popover` if needed for the settings panel)
- [x] 1.2 Confirm `dropdown-menu` / `sheet` can host reader settings on touch devices

## 2. Reader chrome behavior

- [x] 2.1 Remove fixed footer from reader page; adjust main padding when chrome is hidden
- [x] 2.2 Add `chromeVisible` state (default true) with tap-to-toggle on reading area (ignore scroll/drag and interactive chrome)
- [x] 2.3 Gate horizontal page arrows on `chromeVisible`; move page counter into header/settings

## 3. Settings menu and brightness

- [x] 3.1 Add right-side settings icon; move chapter prev/next, orientation, and fit into the panel; keep Back on the left
- [x] 3.2 Implement software brightness overlay + slider with `localStorage` persistence (clamp min ~0.2)

## 4. Verify

- [x] 4.1 Run typecheck/lint on touched files; manually sanity-check vertical + horizontal modes
- [x] 4.2 Run `openspec validate reader-immersive-chrome --strict`
