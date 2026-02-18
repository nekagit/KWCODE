# ADR 0130 — Keyboard shortcuts: Download as JSON and Copy as JSON

## Status

Accepted.

## Context

The Keyboard shortcuts help dialog (Shift+?) supports "Copy list" (plain text), "Copy as Markdown", and "Download as Markdown" (ADR 0094). Configuration (app info), Documentation, and other areas support both Markdown and JSON export (download and copy). Adding JSON export to the shortcuts dialog gives users machine-readable data for tooling and parity with the rest of the app.

## Decision

- In **`src/lib/export-keyboard-shortcuts.ts`**:
  - Export **`KeyboardShortcutsJsonPayload`** type and **`buildKeyboardShortcutsJsonPayload(groups?)`** returning `{ exportedAt, groups: { title, shortcuts: { keys, description }[] }[] }`.
  - Export **`downloadKeyboardShortcutsAsJson()`** — build payload, `triggerFileDownload` with filename `keyboard-shortcuts-{filenameTimestamp()}.json`, toast on success.
  - Export async **`copyKeyboardShortcutsAsJsonToClipboard()`** — build payload, copy via `copyTextToClipboard`, toast success or "Failed to copy to clipboard".
- In **ShortcutsHelpDialog** footer, add **Copy as JSON** and **Download as JSON** buttons (Copy and FileJson icons) with aria-labels and titles.

## Consequences

- Users can export keyboard shortcuts as JSON (file or clipboard) for scripts and tooling.
- Same payload for download and copy; format aligns with other JSON exports in the app.
- Run `npm run verify` to confirm tests, build, and lint pass.
