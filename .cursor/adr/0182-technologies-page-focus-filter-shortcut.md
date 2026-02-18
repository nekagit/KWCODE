# ADR 0182: Technologies page — Focus filter with "/"

## Status

Accepted.

## Context

On the Technologies page, the "Filter by name or value…" input is the primary way to narrow the tech stack badges. Users had to click into the field before typing. The Projects, Prompts, and Ideas pages already use "/" to focus their filter (ADRs 0180, 0174, 0177). Adding the same pattern on the Technologies page keeps behavior consistent and improves keyboard-driven workflow without changing any existing behavior.

## Decision

- **New hook** `useTechnologiesFocusFilterShortcut(inputRef)` in `src/lib/technologies-focus-filter-shortcut.ts`. The hook listens for keydown "/" when the pathname is `/technologies` and the active element is not an input, textarea, or select; then it focuses the ref and calls `preventDefault()`. Uses Next.js `usePathname()` and a single `useEffect` with cleanup. Same pattern as `useProjectsFocusFilterShortcut`, `usePromptsFocusFilterShortcut`, and `useIdeasFocusFilterShortcut`.
- **TechnologiesPageContent**: Add a ref for the "Filter by name or value…" Input, attach the ref to that Input, and call `useTechnologiesFocusFilterShortcut(filterInputRef)`.
- **keyboard-shortcuts.ts**: Add one shortcut entry under Help: key "/ (Technologies page)", description "Focus filter".
- No new Tauri commands or API routes.

## Consequences

- Users on the Technologies page can press "/" to focus the filter input and type immediately.
- If the user is already typing in an input/textarea/select, "/" is not intercepted.
- The shortcut is documented in the Keyboard shortcuts help dialog.
- Run `npm run verify` to confirm tests, build, and lint pass.
