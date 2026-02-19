# ADR 0316 — Bugfix: Run tab history list items — remove copy/download buttons

## Status

Accepted.

## Context

- On the **Run** tab, the **History** section shows a list of completed agent runs. Each list item had many copy/download actions (Copy ID, Copy, Download, JSON, MD, Copy MD, Copy plain, Copy JSON, Copy CSV, CSV). The expanded “Full” dialog also had a full set of copy/download buttons. This was requested to be simplified.

## Decision

1. **History table row (per run)**
   - **Remove** from `ProjectRunTab.tsx` (WorkerHistorySection) all copy/download buttons on each row: Copy ID, Copy, Download, JSON, MD, Copy MD, Copy plain, Copy JSON, Copy CSV, CSV.
   - **Keep** on each row: “Remove” (remove run from history) and “Full” (open expanded view).

2. **Expanded run dialog**
   - **Remove** from the dialog toolbar all copy/download buttons: Copy run ID, Copy output, Download output, Export JSON, Export Markdown, Copy as Markdown, Copy as plain text, Copy as JSON, Copy as CSV, Export CSV.
   - **Keep** in the dialog: “Remove from history” only.

3. **Imports**
   - Remove unused: `Hash` from lucide-react; `copyTextToClipboard`, `downloadRunOutput`, `downloadRunAsJson`, `copyRunAsJsonToClipboard`, `downloadRunAsMarkdown`, `copyRunAsMarkdownToClipboard`, `downloadRunAsCsv`, `copyRunAsCsvToClipboard` from ProjectRunTab (single-run copy/download helpers used only by list items and dialog).

## Consequences

- History list items are simpler: only Remove and Full per row; expanded dialog only has Remove from history.
- Bulk copy/download for the whole history remains in the History section header toolbar (Copy last run, Download last run, Copy summary, Download/Copy stats as JSON/CSV, Copy all, Copy as Markdown/JSON/CSV, Download all / as CSV/JSON/Markdown, Clear history).
- Command palette run-history copy/download actions are unchanged.
