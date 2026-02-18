# ADR 0098: Copy all .cursor prompts as Markdown to clipboard

## Status

Accepted. Implemented 2025-02-18 (night shift).

## Context

The Prompts page has two tabs: ".cursor prompts" (files from `.cursor/` like `*.prompt.md`) and "General" (stored prompt records). The General tab supports "Copy as Markdown" for the list (ADR 0097). The .cursor prompts tab had "Export JSON" and "Export MD" only; for consistency and UX, the .cursor prompts list should also support copying the same markdown format to the clipboard.

## Decision

- **Add `copyAllCursorPromptsAsMarkdownToClipboard()`** in `src/lib/download-all-cursor-prompts-md.ts`. Reuse the existing `cursorPromptsToMarkdown` builder (same format as `downloadAllCursorPromptsAsMarkdown`). Fetch content from `/api/data/cursor-prompt-files-contents` (same as download). Empty list shows toast and returns false; otherwise build markdown and call `copyTextToClipboard`.
- **Add "Copy as Markdown" button** in PromptRecordsPageContent in the .cursor prompts Export group, next to "Export MD", with FileText icon and aria-label. Same toolbar pattern as the General tab.

## Consequences

- Users can copy the full .cursor prompts list as a markdown document to the clipboard, aligned with General prompts, Ideas, Run history, and other copy-as-markdown behaviour.
- Same markdown format as "Export MD"; no new format to maintain.
- Run `npm run verify` to confirm tests, build, and lint pass.
