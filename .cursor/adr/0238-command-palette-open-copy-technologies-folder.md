# ADR 0238: Command palette — Open technologies folder & Copy technologies folder path

## Status

Accepted.

## Context

The Technologies page offers "Open technologies folder in file manager" and "Copy technologies folder path" via existing libs (`open-technologies-folder.ts`, `copy-technologies-folder-path.ts`). The command palette had no equivalent, so keyboard-first users had to open the Technologies page to use these actions.

## Decision

- Add two command palette actions:
  - **Open technologies folder in file manager** — calls `openTechnologiesFolderInFileManager()` from `@/lib/open-technologies-folder`.
  - **Copy technologies folder path** — calls `copyTechnologiesFolderPath()` from `@/lib/copy-technologies-folder-path`.
- No new libs: reuse existing modules. Handlers close the palette after invoking the lib (same pattern as "Open data folder", "Open documentation folder").
- Document both actions in the Command palette group in `keyboard-shortcuts.ts`.

## Consequences

- Users can open the app repo's `.cursor/technologies` folder in the file manager or copy its path from ⌘K without opening the Technologies page.
- Behavior matches the Technologies page (Tauri-only; browser shows toast). Single source of truth in existing libs.
