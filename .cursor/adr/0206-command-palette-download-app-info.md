# ADR 0206 — Command palette: Download app info

## Status

Accepted.

## Context

The Configuration page has "Copy app info" (plain text), "Download as Markdown", and "Copy as Markdown". The command palette already has "Copy app info" but no way to download app info as a file. Keyboard-first users had to open Configuration to use "Download as Markdown". A palette action that triggers the same download (version, theme, mode, data folder as Markdown) improves discoverability and keeps export available from ⌘K.

## Decision

- Add a Command palette action **"Download app info"** that:
  - Resolves version via `getAppVersion()` and theme from the current UI theme (same as "Copy app info").
  - Calls `downloadAppInfoAsMarkdown({ version, theme })` from `@/lib/download-app-info-md`, which triggers a file download (`app-info-{timestamp}.md`) and shows a success toast.
  - Closes the palette after invoking.
- Use **Download** icon (Lucide).
- Place the entry after "Copy app info" in the action list.
- Add one entry in `src/data/keyboard-shortcuts.ts` in the Command palette group: "Download app info".
- No new modules; reuse existing `download-app-info-md` and app version/theme sources.

## Consequences

- Users can export app info as a Markdown file from the Command palette (⌘K) without opening the Configuration page.
- Aligns with existing "Copy app info" and Configuration "Download as Markdown" behaviour.
- Run `npm run verify` to confirm tests, build, and lint pass.
