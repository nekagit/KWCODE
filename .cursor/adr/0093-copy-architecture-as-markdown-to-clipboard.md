# ADR 0093 — Copy architecture record as Markdown to clipboard

## Status

Accepted.

## Context

Prompt (ADR 0088), design (existing `copyDesignRecordToClipboard`), and run history (ADR 0090) already expose a "Copy as Markdown" action via a shared lib function and UI button. The architecture view dialog previously built markdown inline and called `copyTextToClipboard(architectureRecordToMarkdown(viewItem))` directly. For consistency and reuse (empty-check, toasts, single place for format), we wanted the same pattern as design and prompt.

## Decision

- Add `copyArchitectureRecordToClipboard(record: ArchitectureRecord)` in `src/lib/download-architecture-record.ts`. It uses `architectureRecordToMarkdown(record)`, shows a toast when there is nothing to copy, and calls `copyTextToClipboard(markdown)`.
- Use this function in `ArchitectureViewDialog` for the "Copy as Markdown" button instead of inline markdown + copy. Button label set to "Copy as Markdown" and `aria-label` added for accessibility.

## Consequences

- Architecture copy-as-markdown behaviour is aligned with design and prompt (same module as download, shared empty handling and toasts).
- One place to change architecture copy behaviour or format (download-architecture-record.ts).
- Developers should run `npm run verify` locally after pulling.
