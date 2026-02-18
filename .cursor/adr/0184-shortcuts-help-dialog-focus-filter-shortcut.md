# ADR 0184: Shortcuts Help dialog — Focus filter with "/"

## Status

Accepted.

## Context

The Keyboard shortcuts dialog (Shift+?) has a "Filter by action or keys…" input (ADR 0160). Users had to click into the field before typing. The Projects, Prompts, Ideas, Technologies, and Run tab pages already use "/" to focus their filter (ADRs 0180, 0174, 0177, 0182, 0183). Adding the same pattern when the Shortcuts Help dialog is open completes the behavior for this dialog and speeds up finding a shortcut.

## Decision

- **New hook** `useShortcutsHelpFocusFilterShortcut(inputRef, dialogOpen)` in `src/lib/shortcuts-help-focus-filter-shortcut.ts`. The hook listens for keydown "/" in **capture phase** when `dialogOpen === true`; if the active element is not an input, textarea, or select, it focuses the ref and calls `preventDefault()`. Capture phase ensures this handler runs before page-level "/" handlers when the dialog is open.
- **ShortcutsHelpDialog**: Add a ref for the filter Input, call `useShortcutsHelpFocusFilterShortcut(filterInputRef, open)`, and attach the ref to that Input.
- **keyboard-shortcuts.ts**: Add one shortcut entry under Help: key "/ (Shortcuts dialog)", description "Focus filter".
- No new Tauri commands or API routes.

## Consequences

- When the Shortcuts Help dialog is open, users can press "/" to focus the filter input and type immediately.
- If the user is already typing in an input/textarea/select (e.g. the filter field), "/" is not intercepted.
- The shortcut is documented in the Keyboard shortcuts help dialog.
- Run `npm run verify` to confirm tests, build, and lint pass.
