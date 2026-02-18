# ADR 0290 — Dashboard metrics: Export as Markdown

## Status

Accepted.

## Context

The Dashboard shows metrics (tickets count, prompts count, designs count, active/all projects count) and already supports exporting them as JSON and CSV (toolbar and command palette). There was no Markdown export for dashboard metrics. A human-readable snapshot (e.g. table or list) is useful for documentation and sharing.

## Decision

- **New lib** `src/lib/download-dashboard-metrics-md.ts`: build Markdown (title, exportedAt, table: Metric | Value); `dashboardMetricsToMarkdown(metrics)`, `downloadDashboardMetricsAsMarkdown()`, `copyDashboardMetricsAsMarkdownToClipboard()`; reuse `getDashboardMetrics`, `filenameTimestamp`, `triggerFileDownload`, `copyTextToClipboard`; toast on success/error.
- **DashboardOverview:** Add "Copy as Markdown" and "Download as Markdown" buttons in the Export metrics row (after CSV).
- **Command palette:** Add "Copy dashboard metrics as Markdown" and "Download dashboard metrics as Markdown" (handlers + entries after dashboard CSV).
- **keyboard-shortcuts.ts:** Add two Command palette entries for dashboard metrics Markdown.

## Consequences

- Users can export dashboard metrics as Markdown from both the Dashboard Export toolbar and the command palette (⌘K).
- Format aligns with other metrics/list exports (table with metadata header).
- Single new lib and minimal touches to DashboardOverview, CommandPalette, and keyboard-shortcuts.
