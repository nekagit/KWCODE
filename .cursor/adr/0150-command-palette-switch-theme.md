# ADR 0150: Command palette — Switch to light / dark mode

## Status

Accepted.

## Context

Users can change the app theme (light, dark, and other presets) from the Configuration page. There was no way to switch theme from the global Command palette (⌘K / Ctrl+K). Power users who rely on the palette for quick actions had to open Configuration to change theme.

## Decision

- **Command palette**: Add two actions to the palette's action entries: "Switch to light mode" and "Switch to dark mode". When selected, each calls `setTheme("light")` or `setTheme("dark")` from `useUITheme()`, shows a success toast, and closes the palette. Use Sun and Moon icons (lucide-react) for quick recognition.
- **Keyboard shortcuts help**: Add "Switch to light mode" and "Switch to dark mode" to the "Command palette (⌘K / Ctrl+K)" group in `keyboard-shortcuts.ts` so the shortcuts dialog stays in sync with the palette.
- No new Tauri commands or API routes; theme state remains in React context and localStorage as before.

## Consequences

- Users can switch between light and dark mode from anywhere via ⌘K → "Switch to light mode" or "Switch to dark mode", without opening Configuration.
- Theme choice is persisted via existing `applyUITheme()` / localStorage; palette actions behave the same as changing theme on the Configuration page.
- Other theme presets (ocean, forest, warm, red) remain available only from Configuration; the palette focuses on the two most common options (light/dark).
