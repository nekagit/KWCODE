# ADR 0094: Copy keyboard shortcuts as Markdown to clipboard

## Status

Accepted. Implemented 2025-02-18 (night shift).

## Context

The Keyboard shortcuts help dialog (Shift+?) supports "Copy list" (plain text) and "Download as Markdown" (file). Prompt, Design, Architecture, Run history, and My Ideas support both download and "Copy as Markdown" to clipboard. For consistency and UX, the shortcuts dialog should also support copying the same markdown format to the clipboard so users can paste into docs without downloading a file.

## Decision

- **Add `copyKeyboardShortcutsAsMarkdownToClipboard()`** in `src/lib/export-keyboard-shortcuts.ts`. Reuse the existing `formatKeyboardShortcutsAsMarkdown()` output and delegate to `copyTextToClipboard`. No new format; same content as download.
- **Add "Copy as Markdown" button** in ShortcutsHelpDialog footer, between "Copy list" and "Download as Markdown", with aria-label and title for accessibility.

## Consequences

- Users can copy the keyboard shortcuts list as a markdown document (tables per group) to the clipboard, aligned with other copy-as-markdown behaviour in the app.
- No format drift: copy uses the same formatter as download.
- Run `npm run verify` to confirm tests, build, and lint pass.
