# ADR 0185: Dashboard tab — Filter projects by name and "/" to focus filter

## Status

Accepted.

## Context

The Dashboard (home page, first tab) shows a fixed set of recent project cards but had no way to filter them by name. The Projects, Prompts, Ideas, and Technologies pages already have a filter input and "/" shortcut to focus it (ADRs 0180, 0174, 0177, 0182). Adding a "Filter by name…" input on the Dashboard that filters the project cards, plus the same "/" shortcut when the Dashboard tab is active, completes the pattern and lets users quickly narrow the list without leaving the home page.

## Decision

- **New hook** `useDashboardFocusFilterShortcut(inputRef)` in `src/lib/dashboard-focus-filter-shortcut.ts`. The hook listens for keydown "/" when pathname is "/" (Dashboard is only rendered when the home Dashboard tab is active); if focus is not in an input, textarea, or select, it focuses the ref and calls `preventDefault()`. Uses Next.js `usePathname()` and a single `useEffect` with cleanup. Same pattern as other focus-filter hooks.
- **DashboardOverview**: Add local state `filterQuery` and a "Filter by name…" Input above the Projects section (only when `projects.length > 0`). Filter the project list by name (case-insensitive), then sort by recent, then slice(0, 6) for display. Add a ref for the Input, call `useDashboardFocusFilterShortcut(filterInputRef)`, and attach the ref. When the filter is non-empty and no projects match, show "No projects match \"…\"." empty state.
- **keyboard-shortcuts.ts**: Add one shortcut entry under Help: key "/ (Dashboard)", description "Focus filter".
- No new Tauri commands or API routes.

## Consequences

- Users on the Dashboard tab can filter project cards by name and press "/" to focus the filter input without clicking.
- If the user is already typing in an input/textarea/select, "/" is not intercepted.
- The shortcut is documented in the Keyboard shortcuts help dialog.
- Run `npm run verify` to confirm tests, build, and lint pass.
