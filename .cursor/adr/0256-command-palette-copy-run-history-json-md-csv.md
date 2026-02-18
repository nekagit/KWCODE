# ADR 0256: Command palette — Copy run history as JSON, Markdown, CSV

## Status

Accepted.

## Context

The Run tab already offers "Copy as JSON", "Copy as Markdown", and "Copy as CSV" for the full run history. The command palette (⌘K) had "Copy run history to clipboard" (plain text) and "Copy run history stats summary" but not the format-specific copy actions. Keyboard-first users could not copy run history in structured formats from the palette without opening the Run tab.

## Decision

- Add **"Copy run history as JSON"**, **"Copy run history as Markdown"**, and **"Copy run history as CSV"** to the command palette (⌘K).
- Reuse existing libs: `copyAllRunHistoryJsonToClipboard`, `copyAllRunHistoryMarkdownToClipboard`, `copyAllRunHistoryCsvToClipboard` from `@/lib/download-all-run-history-json`, `@/lib/download-all-run-history-md`, `@/lib/download-all-run-history-csv`. No new lib code.
- **CommandPalette.tsx:** Add three handlers that call the copy functions with `terminalOutputHistory` and close the palette; add three action entries (FileJson, FileText, FileSpreadsheet icons).
- **keyboard-shortcuts.ts:** Add the three actions in the Command palette group.

## Consequences

- Users can copy run history as JSON, Markdown, or CSV from ⌘K without opening the Run tab, achieving parity with the Run tab copy actions.
- The actions are documented in the Keyboard shortcuts help dialog.
- Run `npm run verify` to confirm tests, build, and lint pass.
