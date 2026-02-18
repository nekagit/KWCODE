# ADR 0183: Run tab — Focus run history filter with "/"

## Status

Accepted.

## Context

On a project's Run tab (Worker), the run history section has a "Filter by label…" input to narrow completed runs. Users had to click into the field before typing. The Projects, Prompts, Ideas, and Technologies pages already use "/" to focus their filter (ADRs 0180, 0174, 0177, 0182). Adding the same pattern on the project Run tab (`/projects/[id]?tab=worker`) completes the behavior and improves keyboard-driven workflow when filtering run history.

## Decision

- **New hook** `useRunHistoryFocusFilterShortcut(inputRef)` in `src/lib/run-history-focus-filter-shortcut.ts`. The hook listens for keydown "/" when the pathname matches `/projects/[id]` (project detail, not `/projects` or `/projects/new`) and the search param `tab` is `worker`, and the active element is not an input, textarea, or select; then it focuses the ref and calls `preventDefault()`. Uses Next.js `usePathname()`, `useSearchParams()`, and a single `useEffect` with cleanup. Same pattern as other focus-filter hooks.
- **ProjectRunTab**: In `WorkerHistorySection`, add a ref for the "Filter by label…" Input, attach the ref to that Input, and call `useRunHistoryFocusFilterShortcut(filterInputRef)`.
- **keyboard-shortcuts.ts**: Add one shortcut entry under Help: key "/ (Run tab)", description "Focus filter".
- No new Tauri commands or API routes.

## Consequences

- Users on a project's Run tab can press "/" to focus the run history filter input and type immediately.
- If the user is already typing in an input/textarea/select, "/" is not intercepted.
- The shortcut is documented in the Keyboard shortcuts help dialog.
- Run `npm run verify` to confirm tests, build, and lint pass.
