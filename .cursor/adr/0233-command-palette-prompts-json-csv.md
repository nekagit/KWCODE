# ADR 0233: Command palette — Download/Copy prompts as JSON and CSV

## Status

Accepted.

## Context

The Prompts page offers Export and Copy for general prompts in three formats: Markdown, JSON, and CSV (via `download-all-prompts-json` and `download-all-prompts-csv`). The command palette had only "Copy prompts" and "Download prompts" (Markdown). Keyboard-first users could not export or copy prompts as JSON or CSV from ⌘K without opening the Prompts page. This was a parity gap compared to the Ideas palette (ADR 0232 added Download/Copy ideas as CSV).

## Decision

- Add four command palette actions: **Download prompts as JSON**, **Copy prompts as JSON**, **Download prompts as CSV**, **Copy prompts as CSV**.
- Handlers use existing store `prompts` (via `promptsForExport`: id, title, content) and call `downloadAllPromptsAsJson`, `copyAllPromptsAsJsonToClipboard`, `downloadAllPromptsAsCsv`, `copyAllPromptsAsCsvToClipboard` from the existing libs. Same toasts and empty-list handling as the Prompts page.
- Document the four actions in the Command palette group in `keyboard-shortcuts.ts`.

## Consequences

- Users can export or copy the general prompt records as JSON or CSV from ⌘K without navigating to the Prompts page.
- Behavior and formats match the Prompts page (JSON: `{ exportedAt, prompts }`; CSV: id, title, content, category, created_at, updated_at).
- No new lib; reuses existing `download-all-prompts-json` and `download-all-prompts-csv`.
