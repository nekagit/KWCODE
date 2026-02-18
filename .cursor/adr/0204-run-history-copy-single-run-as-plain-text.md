# ADR 0204 — Run history: Copy single run as plain text

## Status

Accepted.

## Context

The Run tab History section has "Copy all" (plain text) for the full history and per-run Copy as Markdown / JSON / CSV. There was no way to copy a single run's output as plain text in the same format as "Copy all" (header line + output). Users who want one run in that format had to copy all or use a different format.

## Decision

- Add **Copy single run as plain text**:
  - **Library:** `src/lib/copy-single-run-as-plain-text.ts` — `copySingleRunAsPlainTextToClipboard(entry)` formats one `TerminalOutputHistoryEntry` with the same header+output format as `copy-all-run-history.ts`, copies to clipboard, and shows success or error toast.
  - **Run row:** In the History table row actions, add a "Copy plain" button (after Copy MD) that calls `copySingleRunAsPlainTextToClipboard(h)`.
  - **Expanded dialog:** In the full-run dialog, add a "Copy as plain text" button (after Copy as Markdown) that calls `copySingleRunAsPlainTextToClipboard(entry)`.
- Reuse `copyTextToClipboard` and toast from existing copy helpers; no new UI patterns.

## Consequences

- Users can copy a single run as plain text (same section format as "Copy all") from both the run row and the expanded run dialog.
- Consistent copy behaviour across single-run and full-history plain text.
- Run `npm run verify` to confirm tests, build, and lint pass.
