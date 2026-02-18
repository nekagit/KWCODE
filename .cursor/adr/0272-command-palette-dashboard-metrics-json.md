# ADR 0272 — Command palette: Copy and Download dashboard metrics as JSON

## Status

Accepted.

## Context

- The Dashboard displays overview metrics (tickets count, prompts count, designs count, active/all projects count) via `getDashboardMetrics()`.
- There was no way to export these metrics; users could not snapshot or share the overview counts.
- The command palette already offers many "Copy X as JSON" and "Download X as JSON" actions (app info, documentation, ideas, run history, etc.).

## Decision

- Add two command palette actions:
  - **Copy dashboard metrics as JSON** — fetches metrics, adds `exportedAt` (ISO string), pretty-prints JSON, copies to clipboard, shows success toast.
  - **Download dashboard metrics as JSON** — same payload; triggers file download with filename `dashboard-metrics-{timestamp}.json` using `filenameTimestamp()` and `triggerFileDownload()` from `download-helpers`.
- Implement in new lib modules:
  - `src/lib/copy-dashboard-metrics.ts` — `buildDashboardMetricsJsonPayload()`, `copyDashboardMetricsToClipboard()`.
  - `src/lib/download-dashboard-metrics-json.ts` — `downloadDashboardMetricsAsJson()` (reuses payload builder from copy-dashboard-metrics).
- Register both actions in the command palette (e.g. after app info JSON entries); handlers call the lib and close the palette.

## Consequences

- Users can quickly export dashboard metrics from the command palette (⌘K) for sharing or backup.
- Payload shape is consistent (metrics fields plus `exportedAt`); same structure for copy and download.
- No new UI on the Dashboard; minimal touch to CommandPalette (imports, two handlers, two entries, dependency array).
