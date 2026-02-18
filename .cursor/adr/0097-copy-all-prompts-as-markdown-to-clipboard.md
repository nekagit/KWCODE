# ADR 0097: Copy all general prompts as Markdown to clipboard

## Status

Accepted. Implemented 2025-02-18 (night shift).

## Context

The Prompts page (general prompts tab) supports "Export JSON", "Export MD", and "Export CSV". Ideas, Run history, Keyboard shortcuts, Tech Stack, and per-record prompt/design/architecture views support both download and "Copy as Markdown" to clipboard. For consistency and UX, the general prompts list should also support copying the same markdown format to the clipboard so users can paste into docs or other tools without downloading a file.

## Decision

- **Add `copyAllPromptsAsMarkdownToClipboard(prompts)`** in `src/lib/download-all-prompts-md.ts`. Reuse the existing `promptsToMarkdown` builder (same format as `downloadAllPromptsAsMarkdown`). Empty list shows toast and returns false; otherwise build markdown and call `copyTextToClipboard`.
- **Add "Copy as Markdown" button** in PromptRecordsPageContent in the general prompts Export group, next to "Export MD", calling the new function with `generalPrompts`. Same toolbar pattern as Ideas and Run history (FileText icon, aria-label, title).

## Consequences

- Users can copy the full general prompts list as a markdown document to the clipboard, aligned with Ideas, Run history, and other copy-as-markdown behaviour.
- Same markdown format as "Export MD"; no new format to maintain.
- Run `npm run verify` to confirm tests, build, and lint pass.
