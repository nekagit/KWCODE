# ADR 0174: Prompts page — Focus filter with "/"

## Status

Accepted.

## Context

On the Prompts page, the "Filter by title" input is the primary way to narrow the prompt list. Users had to click into the field before typing. Many applications (e.g. GitHub, Slack, Notion) use "/" to focus the main search or filter so users can start typing immediately. Adding the same pattern on the Prompts page improves keyboard-driven workflow without changing any existing behavior.

## Decision

- **New hook** `usePromptsFocusFilterShortcut(inputRef)` in `src/lib/prompts-focus-filter-shortcut.ts`. The hook listens for keydown "/" when the pathname is `/prompts` and the active element is not an input, textarea, or select; then it focuses the ref and calls `preventDefault()` so "/" is not inserted elsewhere. Uses Next.js `usePathname()` and a single `useEffect` with cleanup.
- **PromptRecordsPageContent**: Add a ref for the General-tab "Filter by title" Input, attach the ref to that Input, and call `usePromptsFocusFilterShortcut(filterInputRef)`. The Cursor prompts tab has no single filter input; the shortcut applies when the page is /prompts and focuses the General-tab filter when that tab is visible (ref is the same input).
- **keyboard-shortcuts.ts**: Add one shortcut entry (e.g. under Help or a page-specific group): key "/", description "Prompts page: Focus filter".
- No new Tauri commands or API routes.

## Consequences

- Users on the Prompts page can press "/" to focus the filter input and type immediately.
- If the user is already typing in an input/textarea/select, "/" is not intercepted.
- The shortcut is documented in the Keyboard shortcuts help dialog.
- Run `npm run verify` to confirm tests, build, and lint pass.
