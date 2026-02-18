# ADR 0223: Command palette — Copy app info as Markdown and as JSON

## Status

Accepted.

## Context

The Configuration page offers "Copy app info" (plain text), "Copy as Markdown", "Copy as JSON", "Download as Markdown", and "Download as JSON". The command palette (⌘K) already had "Copy app info", "Download app info", and "Download app info as JSON" but no way to copy app info as Markdown or as JSON to the clipboard. Keyboard-first users could not paste app info in Markdown or JSON format from the palette without opening the Configuration page. Other export surfaces (documentation info, ideas, tech stack) expose both copy-Markdown and copy-JSON from the palette.

## Decision

- Add two command palette actions: **Copy app info as Markdown** and **Copy app info as JSON**.
- Reuse existing libs: `copyAppInfoAsMarkdownToClipboard({ version, theme })` from `@/lib/download-app-info-md` and `copyAppInfoAsJsonToClipboard({ version, theme })` from `@/lib/download-app-info-json`. Palette handlers resolve version via `getAppVersion()`, use current theme from `effectiveTheme`, call the lib, then close the palette (libs already show success/error toasts).
- Document the two actions in the Command palette group in `keyboard-shortcuts.ts`.

## Consequences

- Users can copy app info as Markdown or as JSON from ⌘K without navigating to the Configuration page.
- Behavior and content match the Configuration page (same Markdown/JSON shape and toasts).
- No new lib code; only CommandPalette and keyboard-shortcuts updates.
