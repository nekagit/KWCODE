# ADR 0092: Copy My Ideas as Markdown to clipboard

## Status

Accepted. Implemented 2025-02-18 (night shift).

## Context

The Ideas page supports "Export MD" (download file), "Export JSON", and "Export CSV". Prompt, Design, Architecture, and Run history support both download and "Copy as Markdown" to clipboard. For consistency and UX, the My Ideas list should also support copying the same markdown format to the clipboard so users can paste into docs or other tools without downloading a file.

## Decision

- **Add `buildMyIdeasMarkdown(ideas)`** in `src/lib/download-my-ideas-md.ts` — shared builder used by both download and copy so the format stays in sync (same as run history pattern).
- **Add `copyAllMyIdeasMarkdownToClipboard(ideas)`** in the same module. Builds markdown via `buildMyIdeasMarkdown`, shows toast when ideas are empty, then delegates to `copyTextToClipboard`.
- **Refactor `downloadMyIdeasAsMarkdown`** to use `buildMyIdeasMarkdown(ideas)` instead of the previous private `ideasToMarkdown`.
- **Add "Copy as Markdown" button** in IdeasPageContent in the Export group, next to "Export MD", calling the new function with the current list (filtered or full). Same toolbar pattern as Run history and other pages.

## Consequences

- Users can copy the My Ideas list as a markdown document to the clipboard, aligned with prompt, design, architecture, and run history copy behaviour.
- Single markdown builder used for both download and copy; format stays in sync.
- Run `npm run verify` to confirm tests, build, and lint pass.
