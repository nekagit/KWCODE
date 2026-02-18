# ADR 0090: Copy run history as Markdown to clipboard

## Status

Accepted. Implemented 2025-02-18 (night shift).

## Context

Run history supports "Copy all" (plain text) and "Download as Markdown" (file). Prompt, Design, and Architecture records support both download and "Copy as Markdown" to clipboard. For consistency and UX, run history should also support copying the same markdown format to the clipboard so users can paste into docs or other tools without downloading a file.

## Decision

- **Add `copyAllRunHistoryMarkdownToClipboard(entries)`** in `src/lib/download-all-run-history-md.ts` (same module as `downloadAllRunHistoryMarkdown`). Reuse the existing markdown format: `# Run history`, export timestamp, then for each entry (chronological) `## Run: label`, metadata list, fenced code block for output. Empty entries show a toast and return false; otherwise delegate to `copyTextToClipboard`.
- **Extract `buildRunHistoryMarkdown(entries)`** so both download and copy use the same string; no format drift.
- **Add "Copy as Markdown" button** in the Run tab history toolbar (ProjectRunTab), next to "Copy all", calling the new function with the visible run history. Same toolbar pattern as existing Copy all / Download as Markdown.

## Consequences

- Users can copy run history as a markdown document to the clipboard, aligned with prompt/design/architecture copy behaviour.
- Single markdown builder used for both download and copy; format stays in sync.
- Run `npm run verify` to confirm tests, build, and lint pass.
