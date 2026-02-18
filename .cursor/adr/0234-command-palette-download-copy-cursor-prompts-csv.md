# ADR 0234: Command palette — Download .cursor prompts as CSV and Copy .cursor prompts as CSV

## Status

Accepted.

## Context

The Prompts page ".cursor prompts" tab offers "Export as CSV" and "Copy as CSV" for all `.cursor` `*.prompt.md` files (via `download-all-cursor-prompts-csv`). The command palette already had general prompts (Markdown, JSON, CSV) and ideas CSV (ADR 0232) but no actions for .cursor prompt files. Keyboard-first users could not export or copy .cursor prompts as CSV from ⌘K without opening the Prompts page.

## Decision

- Add two command palette actions: **Download .cursor prompts as CSV**, **Copy .cursor prompts as CSV**.
- Handlers call existing `downloadAllCursorPromptsAsCsv()` and `copyAllCursorPromptsAsCsvToClipboard()` from `@/lib/download-all-cursor-prompts-csv`. Those functions self-fetch from `/api/data/cursor-prompt-files-contents`; same toasts and empty handling as the Prompts page.
- Document the two actions in the Command palette group in `keyboard-shortcuts.ts`.

## Consequences

- Users can export or copy .cursor prompt files as CSV from ⌘K without navigating to the Prompts page.
- Behavior and CSV format match the Prompts page (columns: relativePath, path, name, updatedAt, content).
- No new lib; reuses existing export module. In browser mode the API route provides data; in Tauri desktop the same route is used when the app is served via Next (e.g. dev).
