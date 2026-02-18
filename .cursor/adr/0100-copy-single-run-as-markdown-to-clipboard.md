# ADR 0100: Copy single run as Markdown to clipboard

## Status

Accepted. Implemented 2025-02-18 (night shift).

## Context

Run history supports "Copy as Markdown" for the full history (ADR 0090). Each run entry has "Copy" (plain output), "Download", "Export JSON", "Export MD" (file), and "Export CSV". For consistency with prompt, design, architecture, and full run history, a single run entry should support copying that run's formatted markdown (heading, metadata, fenced output) to the clipboard without downloading a file.

## Decision

- **Add `copyRunAsMarkdownToClipboard(entry)`** in `src/lib/download-run-as-md.ts` (same module as `downloadRunAsMarkdown`). Reuse the existing `formatEntryAsMarkdown` output: `## Run: label`, metadata list, fenced code block, plus export timestamp. Delegate to `copyTextToClipboard`; return `Promise<boolean>`.
- **Add "Copy as Markdown" / "Copy MD" button** in ProjectRunTab: (1) in the run history table row actions (next to MD download), (2) in the expanded run dialog (next to Export Markdown). FileText icon, aria-label and title for accessibility.

## Consequences

- Users can copy a single run as markdown from both the table row and the full-output dialog, aligned with other copy-as-markdown behaviour.
- Same format as "Export MD" for that run; no new format.
- Run `npm run verify` to confirm tests, build, and lint pass.
