# ADR 0128 — Configuration: Copy app info as Markdown to clipboard

## Status

Accepted.

## Context

The Configuration page (ADR 0110, 0114, 0115) exposes app info (version, theme, mode, data folder) with "Copy app info" (plain text), "Download as Markdown", "Copy as JSON", and "Download as JSON". The Documentation page offers both "Download as Markdown" and "Copy as Markdown" for parity. Adding "Copy as Markdown" to Configuration gives users the same Markdown content on the clipboard without downloading a file, matching that pattern.

## Decision

- In **`src/lib/download-app-info-md.ts`**:
  - Export async **`copyAppInfoAsMarkdownToClipboard(params: CopyAppInfoParams)`** that resolves data folder (Tauri `get_data_dir`) and mode, builds markdown via existing `buildAppInfoMarkdown`, copies via `copyTextToClipboard`, and shows success or "Failed to copy to clipboard" toast.
- In **ConfigurationPageContent**, in the Data section after "Copy app info" and before "Download as Markdown", add a **Copy as Markdown** button (Copy icon) that calls `copyAppInfoAsMarkdownToClipboard` with the current version and theme.

## Consequences

- Users can copy app info as Markdown from the Configuration page, in addition to plain text and file download.
- Same content as "Download as Markdown"; only the delivery (clipboard vs file) differs.
- Aligns Configuration with the Documentation page pattern (both Download and Copy as Markdown).
