# ADR 0217 — Command palette: Copy documentation info (Markdown and JSON)

## Status

Accepted.

## Context

The Documentation page offers "Download as Markdown", "Copy as Markdown", "Copy as JSON", and "Download as JSON". The command palette already has "Download documentation info" and "Download documentation info as JSON" (ADR 0216) but no way to copy documentation info to the clipboard from ⌘K. Keyboard-first users had to open the Documentation page to use "Copy as Markdown" or "Copy as JSON". Adding two palette actions that call the existing copy helpers lets users paste documentation page info (paths and descriptions for `.cursor/documentation/` and `docs/`) from the palette.

## Decision

- Add two Command palette actions:
  - **"Copy documentation info"** — calls `copyDocumentationInfoAsMarkdownToClipboard()` from `@/lib/download-documentation-info-md` (toast from lib), then closes the palette.
  - **"Copy documentation info as JSON"** — calls `copyDocumentationInfoAsJsonToClipboard()` from `@/lib/download-documentation-info-json` (toast from lib), then closes the palette.
- Use **Copy** icon for Markdown and **FileJson** icon for JSON.
- Place both entries after "Download documentation info as JSON" in the action list.
- Add two entries in `src/data/keyboard-shortcuts.ts` in the Command palette group: "Copy documentation info", "Copy documentation info as JSON".
- No new modules; reuse `copyDocumentationInfoAsMarkdownToClipboard` and `copyDocumentationInfoAsJsonToClipboard` from existing libs.

## Consequences

- Users can copy documentation info as Markdown or JSON to the clipboard from the Command palette (⌘K) without opening the Documentation page.
- Aligns with existing Download documentation info actions and with Copy/Download patterns for app info and keyboard shortcuts.
- Run `npm run verify` to confirm tests, build, and lint pass.
