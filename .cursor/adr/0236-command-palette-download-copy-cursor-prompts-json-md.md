# ADR 0236: Command palette — Download/Copy .cursor prompts as JSON and Markdown

## Status

Accepted.

## Context

The Prompts page ".cursor prompts" tab offers Export/Copy as JSON, Markdown, and CSV for all `.cursor` `*.prompt.md` files. The command palette already had .cursor prompts CSV (ADR 0234) but no actions for JSON or Markdown. Keyboard-first users could not export or copy .cursor prompts as JSON or Markdown from ⌘K without opening the Prompts page.

## Decision

- Add four command palette actions: **Download .cursor prompts as JSON**, **Copy .cursor prompts as JSON**, **Download .cursor prompts as Markdown**, **Copy .cursor prompts as Markdown**.
- Handlers call existing `downloadAllCursorPromptsAsJson()`, `copyAllCursorPromptsAsJsonToClipboard()` from `@/lib/download-all-cursor-prompts-json` and `downloadAllCursorPromptsAsMarkdown()`, `copyAllCursorPromptsAsMarkdownToClipboard()` from `@/lib/download-all-cursor-prompts-md`. Those functions self-fetch from `/api/data/cursor-prompt-files-contents`; same toasts and empty handling as the Prompts page.
- Document the four actions in the Command palette group in `keyboard-shortcuts.ts`.

## Consequences

- Users can export or copy .cursor prompt files as JSON or Markdown from ⌘K without navigating to the Prompts page.
- Behavior and formats match the Prompts page. No new lib; reuses existing export modules.
