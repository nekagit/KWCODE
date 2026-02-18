# ADR 0257: Run tab — Copy last run and Download last run in History toolbar

## Status

Accepted.

## Context

The command palette (⌘K) already offered "Copy last run to clipboard" and "Download last run as file". The Run tab History section had bulk actions (Copy all, Download all, Copy/Download as JSON, CSV, Markdown) but no one-click actions for the single most recent run in the toolbar. Users on the Run page had to open the command palette to copy or download only the last run.

## Decision

Add two buttons to the Run tab History toolbar:

- **Copy last run** — Copies the chronologically most recent run to the clipboard (plain text), using existing `copySingleRunAsPlainTextToClipboard`. Disabled when there is no run history.
- **Download last run** — Downloads the most recent run as a plain text file via `downloadSingleRunAsPlainText` from `@/lib/download-single-run-as-plain-text`. Disabled when there is no run history.

"Last run" is defined as the entry in `history` with the latest `timestamp`, matching command palette semantics. Buttons are placed at the start of the History toolbar row (before "Copy all") so last-run actions are prominent.

No new lib code; reuse existing `copy-single-run-as-plain-text` and `download-single-run-as-plain-text`.

## Consequences

- Users can copy or download the most recent run from the Run tab without opening the command palette.
- Same behavior and format as the existing command palette actions.
- Minimal change: one new import, one `lastRun` useMemo, two buttons in `ProjectRunTab.tsx`.
