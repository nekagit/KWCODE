# ADR 0241: Command palette — Open ideas folder & Copy ideas folder path

## Status

Accepted.

## Context

The Ideas page offers "Open ideas folder in file manager" and "Copy ideas folder path" via existing libs (`open-ideas-folder.ts`, `copy-ideas-folder-path.ts`). The command palette had Ideas export/copy (Markdown, JSON, CSV) but no way to open the ideas folder or copy its path from ⌘K, so keyboard-first users had to open the Ideas page to use these actions.

## Decision

- Add two command palette actions:
  - **Open ideas folder in file manager** — calls `openIdeasFolderInFileManager()` from `@/lib/open-ideas-folder`.
  - **Copy ideas folder path** — calls `copyIdeasFolderPath()` from `@/lib/copy-ideas-folder-path`.
- No new libs: reuse existing modules. Handlers close the palette after invoking the lib (same pattern as "Open documentation folder", "Open technologies folder").
- Document both actions in the Command palette group in `keyboard-shortcuts.ts`.

## Consequences

- Users can open the app repo's `.cursor/0. ideas` folder in the file manager or copy its path from ⌘K without opening the Ideas page.
- Behavior matches the Ideas page (Tauri-only; browser shows toast). Single source of truth in existing libs.
