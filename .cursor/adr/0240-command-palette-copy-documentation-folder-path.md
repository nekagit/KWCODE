# ADR 0240: Command palette — Copy documentation folder path

## Status

Accepted.

## Context

The Documentation page offers "Open documentation folder in file manager" and "Copy documentation folder path" (via `open-documentation-folder.ts` and `copy-documentation-folder-path.ts`). The command palette already had "Open documentation folder" but no way to copy the documentation folder path from ⌘K. Keyboard-first users had to open the Documentation page to copy the path.

## Decision

- Add one command palette action: **Copy documentation folder path**.
- Reuse existing `copyDocumentationFolderPath()` from `@/lib/copy-documentation-folder-path` (Tauri-only; in browser shows an info toast per ADR 0215).
- Add the action after "Open documentation folder" in the palette and document it in the Command palette group in `keyboard-shortcuts.ts`.

## Consequences

- Users can copy the app repo's documentation folder path (.cursor/documentation or .cursor) from ⌘K without opening the Documentation page.
- Parity with "Copy technologies folder path" and "Copy data directory path" in the palette.
