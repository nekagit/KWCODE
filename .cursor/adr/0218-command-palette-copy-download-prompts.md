# ADR 0218 — Command palette: Copy prompts and Download prompts (Markdown)

## Status

Accepted.

## Context

The Prompts page offers "Export MD", "Copy as Markdown", "Export JSON", and related actions for general prompts. The command palette had no way to copy or download the current prompts list from ⌘K. Keyboard-first users had to open the Prompts page to export. The run store already holds the same prompt list used by the Run tab (`get_prompts` / refreshData). Adding two palette actions that use this data and call the existing export libs lets users copy or download prompts as Markdown from the palette.

## Decision

- Add two Command palette actions:
  - **"Copy prompts"** — uses `prompts` from the run store, maps to export shape (id, title, content), calls `copyAllPromptsAsMarkdownToClipboard(prompts)` from `@/lib/download-all-prompts-md` (toast from lib), then closes the palette.
  - **"Download prompts"** — same data source, calls `downloadAllPromptsAsMarkdown(prompts)` from `@/lib/download-all-prompts-md` (toast from lib), then closes the palette.
- Use **Copy** icon for "Copy prompts" and **Download** icon for "Download prompts".
- Place both entries after "Copy documentation info as JSON" in the action list.
- Add two entries in `src/data/keyboard-shortcuts.ts` in the Command palette group: "Copy prompts", "Download prompts".
- No new modules; reuse `copyAllPromptsAsMarkdownToClipboard` and `downloadAllPromptsAsMarkdown` from `@/lib/download-all-prompts-md`. Empty prompts show "No prompts to export" toast (handled by the lib).

## Consequences

- Users can copy or download the current prompts list as Markdown from the Command palette (⌘K) without opening the Prompts page. Dataset is the same as the Run tab prompt list (from last refresh).
- Aligns with existing Copy/Download patterns for run history, documentation info, and keyboard shortcuts.
- Run `npm run verify` to confirm tests, build, and lint pass.
