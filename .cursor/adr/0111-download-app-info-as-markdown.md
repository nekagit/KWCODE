# ADR 0111 — Configuration: Download app info as Markdown

## Status

Accepted.

## Context

The Configuration page exposes app info (version, theme, mode, data folder) for support and bug reports. It had only "Copy app info" (plain text to clipboard). Other pages (Tech Stack, Ideas, Run history, Prompts) offer both copy and "Download as Markdown"; adding a file-based Markdown export for app info extends that pattern and gives users a storable snapshot.

## Decision

- Add **`src/lib/download-app-info-md.ts`** that:
  - Exports `buildAppInfoMarkdown(params)` for deterministic Markdown (heading, exported-at, Version/Theme/Mode/Data folder).
  - Exports async `downloadAppInfoAsMarkdown(params: CopyAppInfoParams)` that resolves data folder (Tauri `get_data_dir`) and mode (Tauri | Browser), builds markdown, and triggers file download as `app-info-{timestamp}.md` via `download-helpers`. Shows success toast.
- In **ConfigurationPageContent**, in the Data section next to "Copy app info", add a **Download as Markdown** button (FileText icon) that calls `downloadAppInfoAsMarkdown` with the current version and theme.

## Consequences

- Users can download app info as a Markdown file from the Configuration page, in addition to copying it to the clipboard.
- Same data source and format as "Copy app info"; only the delivery (file vs clipboard) differs.
- Aligns Configuration with the export pattern used elsewhere (Tech Stack, Ideas, etc.).
