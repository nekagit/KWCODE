# ADR 0115 — Configuration: Copy app info as JSON to clipboard

## Status

Accepted.

## Context

The Configuration page exposes app info (version, theme, mode, data folder) for support and bug reports. It already had "Copy app info" (plain text), "Download as Markdown" (ADR 0111), and "Download as JSON" (ADR 0114). Adding a "Copy as JSON" action lets users paste the same machine-readable JSON into support tools or scripts without creating a file, complementing the existing clipboard plain-text option.

## Decision

- In **`src/lib/download-app-info-json.ts`**, add async **`copyAppInfoAsJsonToClipboard(params: CopyAppInfoParams)`** that:
  - Resolves data folder (Tauri `get_data_dir`) and mode (Tauri | Browser), builds the same payload as download via `buildAppInfoJsonPayload`, then copies `JSON.stringify(payload, null, 2)` to the clipboard via `copyTextToClipboard`. Shows success or failure toast.
- In **ConfigurationPageContent**, in the Data section next to "Download as JSON", add a **Copy as JSON** button (Copy icon) that calls `copyAppInfoAsJsonToClipboard` with the current version and theme.

## Consequences

- Users can copy app info as pretty-printed JSON to the clipboard from the Configuration page.
- Same data and format as "Download as JSON"; only the destination (clipboard vs file) differs.
- Complements existing Copy app info (plain text) and Download as JSON for flexible support and tooling workflows.
