# ADR 0154: Configuration page — show data directory path

## Status

Accepted.

## Context

The Configuration page offers "Open data folder" and "Copy app info" (which includes the data path in the copied content), but the actual data directory path (where app.db and data files live) was not visible on the page. Users had to open the folder or copy app info to discover the path. Showing the path on the page improves transparency and helps with troubleshooting or documentation.

## Decision

- **ConfigurationPageContent.tsx**: Display the app data directory path in the existing "Data" section. Fetch the path via Tauri `get_data_dir` when running in the desktop app; in browser mode show "—".
- Show the path as a read-only line: label "Data directory:" plus the path in a muted monospace style, with a "Copy path" button that reuses the existing `copyAppDataFolderPath()` helper (Tauri only; in browser the path line still shows "—" and no Copy button).
- No new Tauri commands or API routes; use existing `get_data_dir`. No new lib files; use existing `copyAppDataFolderPath` and `invoke` from `@/lib/tauri`.

## Consequences

- Users can see at a glance where app data is stored from the Configuration page.
- Copy path remains a single action via the new button when in Tauri; "Open data folder" and "Copy app info" are unchanged.
- In browser mode the line shows "—" so the layout is consistent; no Copy path button in browser.
