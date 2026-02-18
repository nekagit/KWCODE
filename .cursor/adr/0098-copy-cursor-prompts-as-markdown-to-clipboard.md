# ADR 0098: Copy all .cursor prompts as Markdown to clipboard

## Status

Accepted. Implemented 2025-02-18 (night shift).

## Context

The Prompts page has two main tabs: ".cursor prompts" (files under `.cursor/` matching `*.prompt.md`) and "General" (stored prompt records). The General tab supports "Export JSON", "Export MD", "Copy as Markdown", and "Export CSV". The .cursor prompts tab had "Export JSON" and "Export MD" only; for consistency with General prompts, Ideas, Run history, Keyboard shortcuts, and Tech Stack, the .cursor prompts list should support copying the same markdown format to the clipboard without downloading a file.

## Decision

- **Add `copyAllCursorPromptsAsMarkdownToClipboard()`** in `src/lib/download-all-cursor-prompts-md.ts` — fetches content from `/api/data/cursor-prompt-files-contents` (same as download), builds markdown via existing `cursorPromptsToMarkdown`, and delegates to `copyTextToClipboard`. Same format as "Export MD". Shows toast when no files and returns false; on fetch/copy error shows error toast and returns false.
- **Add "Copy as Markdown" button** in PromptRecordsPageContent in the .cursor prompts export group (next to Export MD), with FileText icon and aria-label. Disabled when `cursorPromptFiles.length === 0`.

## Consequences

- Users can copy all .cursor prompt files as a single markdown document to the clipboard from the .cursor prompts tab, aligned with General prompts and other copy-as-markdown behaviour.
- Same markdown formatter used for both download and copy; format stays in sync.
- Run `npm run verify` to confirm tests, build, and lint pass.
