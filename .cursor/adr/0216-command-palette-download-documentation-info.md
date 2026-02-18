# ADR 0216 — Command palette: Download documentation info (Markdown and JSON)

## Status

Accepted.

## Context

The Documentation page offers "Download as Markdown", "Copy as Markdown", "Copy as JSON", and "Download as JSON" for documentation info (paths and descriptions for `.cursor/documentation/` and `docs/`). The command palette had "Open documentation folder" but no way to download documentation info as a file from ⌘K. Keyboard-first users had to open the Documentation page to export. Adding palette actions for download (Markdown and JSON) aligns with existing "Download app info" and "Download keyboard shortcuts" behaviour and improves workflow.

## Decision

- Add two Command palette actions:
  1. **"Download documentation info"** — Calls `downloadDocumentationInfoAsMarkdown()` from `@/lib/download-documentation-info-md` (filename: `documentation-info-{timestamp}.md`; toast "Documentation info exported as Markdown"); then closes the palette. Use **Download** icon.
  2. **"Download documentation info as JSON"** — Calls `downloadDocumentationInfoAsJson()` from `@/lib/download-documentation-info-json` (filename: `documentation-info-{timestamp}.json`; toast "Documentation info exported as JSON"); then closes the palette. Use **FileJson** icon.
- Place both entries after "Open documentation folder" in the action list.
- Add two entries in `src/data/keyboard-shortcuts.ts` in the Command palette group: "Download documentation info", "Download documentation info as JSON".
- No new modules; reuse existing `download-documentation-info-md.ts` and `download-documentation-info-json.ts`.

## Consequences

- Users can export documentation page info (Markdown or JSON) from the Command palette (⌘K) without opening the Documentation page.
- Same content and filenames as the Documentation page exports.
- Run `npm run verify` to confirm tests, build, and lint pass.
