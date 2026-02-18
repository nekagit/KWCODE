# ADR 0177: Ideas page — Focus filter with "/"

## Status

Accepted.

## Context

On the Ideas page, the "Filter My ideas by title" input is the primary way to narrow the ideas list. Users had to click into the field before typing. The Prompts page already uses "/" to focus its filter (ADR 0174). Adding the same pattern on the Ideas page keeps behavior consistent and improves keyboard-driven workflow without changing any existing behavior.

## Decision

- **New hook** `useIdeasFocusFilterShortcut(inputRef)` in `src/lib/ideas-focus-filter-shortcut.ts`. The hook listens for keydown "/" when the pathname is `/ideas` and the active element is not an input, textarea, or select; then it focuses the ref and calls `preventDefault()`. Uses Next.js `usePathname()` and a single `useEffect` with cleanup. Same pattern as `usePromptsFocusFilterShortcut`.
- **IdeasPageContent**: Add a ref for the "Filter My ideas by title" Input, attach the ref to that Input, and call `useIdeasFocusFilterShortcut(filterInputRef)`.
- **keyboard-shortcuts.ts**: Add one shortcut entry under Help: key "/ (Ideas page)", description "Focus filter".
- No new Tauri commands or API routes.

## Consequences

- Users on the Ideas page can press "/" to focus the filter input and type immediately.
- If the user is already typing in an input/textarea/select, "/" is not intercepted.
- The shortcut is documented in the Keyboard shortcuts help dialog.
- Run `npm run verify` to confirm tests, build, and lint pass.
