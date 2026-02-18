# ADR 0214 — Command palette: Download app info as JSON

## Status

Accepted.

## Context

The Configuration page offers "Copy app info", "Download as Markdown", "Copy as Markdown", "Copy as JSON", and "Download as JSON" for app info (version, theme, mode, data folder). The command palette already has "Copy app info" and "Download app info" (Markdown). Keyboard-first users had no way to download app info as a JSON file from ⌘K. Adding a palette action that triggers the same JSON download improves discoverability and keeps export formats consistent with other palette actions (e.g. Download keyboard shortcuts as JSON).

## Decision

- Add a Command palette action **"Download app info as JSON"** that:
  - Resolves version via `getAppVersion()` and theme from the current UI theme (same as "Download app info").
  - Calls `downloadAppInfoAsJson({ version, theme })` from `@/lib/download-app-info-json`, which triggers a file download (`app-info-{timestamp}.json`) and shows a success toast.
  - Closes the palette after invoking.
- Use **FileJson** icon (Lucide).
- Place the entry after "Download app info" in the action list.
- Add one entry in `src/data/keyboard-shortcuts.ts` in the Command palette group: "Download app info as JSON".
- No new modules; reuse existing `download-app-info-json` and app version/theme sources.

## Consequences

- Users can export app info as a JSON file from the Command palette (⌘K) without opening the Configuration page.
- Aligns with existing "Download app info" (Markdown) and Configuration "Download as JSON" behaviour.
- Run `npm run verify` to confirm tests, build, and lint pass.
