# ADR 0188: Command palette — Reload app

## Status

Accepted.

## Context

The app has "Refresh data" in the command palette, which reloads projects and prompts from the backend without a full page reload. There was no way to perform a full browser/Tauri window reload from the keyboard. Users may want to reload the app after changing configuration, when the UI feels stuck, or during development without closing the window.

## Decision

- **CommandPalette.tsx**: Add a "Reload app" action (icon RotateCw to distinguish from "Refresh data" which uses RefreshCw). On select: close the palette, then call `window.location.reload()`.
- **keyboard-shortcuts.ts**: Add one entry in the Command palette group: "Reload app", so the shortcuts help dialog and exports list the action.

## Consequences

- Users can trigger a full page reload from anywhere via the command palette (⌘K / Ctrl+K), then type "Reload app" and select it.
- "Refresh data" continues to mean "re-fetch data from backend"; "Reload app" means "full window reload".
- No global keyboard shortcut for reload (to avoid accidental reload); command palette only.
