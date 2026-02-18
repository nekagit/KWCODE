# ADR 0114 — Configuration: Download app info as JSON

## Status

Accepted.

## Context

The Configuration page exposes app info (version, theme, mode, data folder) for support and bug reports. It already had "Copy app info" (plain text) and "Download as Markdown" (ADR 0111). Adding a JSON export provides a machine-readable format for the same data, useful for tooling, scripting, and consistent parsing.

## Decision

- Add **`src/lib/download-app-info-json.ts`** that:
  - Exports `buildAppInfoJsonPayload(params)` for a JSON-serializable object: `{ exportedAt, version, theme, mode, dataFolder }`.
  - Exports async `downloadAppInfoAsJson(params: CopyAppInfoParams)` that resolves data folder (Tauri `get_data_dir`) and mode (Tauri | Browser), builds the payload, and triggers file download as `app-info-{timestamp}.json` via `download-helpers`. Shows success toast.
- In **ConfigurationPageContent**, in the Data section next to "Download as Markdown", add a **Download as JSON** button (FileJson icon) that calls `downloadAppInfoAsJson` with the current version and theme.

## Consequences

- Users can download app info as a JSON file from the Configuration page, in addition to Markdown and clipboard.
- Same data source as "Copy app info" and "Download as Markdown"; only the format (JSON) differs.
- Machine-readable export supports automation and consistent parsing.
