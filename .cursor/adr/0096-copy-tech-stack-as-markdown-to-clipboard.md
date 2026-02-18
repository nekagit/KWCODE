# ADR 0096: Copy Tech Stack as Markdown to clipboard

## Status

Accepted. Implemented 2025-02-18 (night shift).

## Context

The Technologies page supports "Copy" (JSON to clipboard), "Export" (JSON file), and "Download as Markdown" (file). Ideas, Run history, Keyboard shortcuts, and prompt/design/architecture support both download and "Copy as Markdown" to clipboard. For consistency and UX, the Tech Stack section should also support copying the same markdown format to the clipboard so users can paste into docs or other tools without downloading a file.

## Decision

- **Add `copyTechStackAsMarkdownToClipboard(data)`** in `src/lib/download-tech-stack.ts` — reuses existing `techStackToMarkdown(data)` and delegates to `copyTextToClipboard`. Same format as "Download as Markdown". Shows toast when data is null/undefined and returns false.
- **Add "Copy as Markdown" button** in TechnologiesPageContent in the tech stack toolbar, next to "Export" and "Download as Markdown", calling the new function with the current tech stack. Same toolbar pattern as Ideas, Run history, and Keyboard shortcuts.

## Consequences

- Users can copy the tech stack as a markdown document to the clipboard, aligned with Ideas, Run history, Keyboard shortcuts, and prompt/design/architecture copy behaviour.
- Single formatter `techStackToMarkdown` used for both download and copy; format stays in sync.
- Run `npm run verify` to confirm tests, build, and lint pass.
