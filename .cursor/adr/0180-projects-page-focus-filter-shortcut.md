# ADR 0180: Projects page — Focus filter with "/"

## Status

Accepted.

## Context

On the Projects page, the "Filter by name…" input is the primary way to narrow the projects list. Users had to click into the field before typing. The Prompts page and Ideas page already use "/" to focus their filter (ADRs 0174, 0177). Adding the same pattern on the Projects page completes the behavior across the three list pages and improves keyboard-driven workflow without changing any existing behavior.

## Decision

- **New hook** `useProjectsFocusFilterShortcut(inputRef)` in `src/lib/projects-focus-filter-shortcut.ts`. The hook listens for keydown "/" when the pathname is `/projects` and the active element is not an input, textarea, or select; then it focuses the ref and calls `preventDefault()`. Uses Next.js `usePathname()` and a single `useEffect` with cleanup. Same pattern as `usePromptsFocusFilterShortcut` and `useIdeasFocusFilterShortcut`.
- **ProjectsListPageContent**: Add a ref for the "Filter by name…" Input, attach the ref to that Input, and call `useProjectsFocusFilterShortcut(filterInputRef)`.
- **keyboard-shortcuts.ts**: Add one shortcut entry under Help: key "/ (Projects page)", description "Focus filter".
- No new Tauri commands or API routes.

## Consequences

- Users on the Projects page can press "/" to focus the filter input and type immediately.
- If the user is already typing in an input/textarea/select, "/" is not intercepted.
- The shortcut is documented in the Keyboard shortcuts help dialog.
- Run `npm run verify` to confirm tests, build, and lint pass.
