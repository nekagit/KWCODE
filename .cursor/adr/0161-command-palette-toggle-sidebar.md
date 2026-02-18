# ADR 0161: Command palette — Toggle sidebar

## Status

Accepted.

## Context

The app sidebar can be collapsed/expanded via the global shortcut ⌘B (Ctrl+B) and the sidebar toggle button in the sidebar footer. Users who rely on the Command palette (⌘K / Ctrl+K) for navigation and actions had no way to toggle the sidebar from the palette, so they had to use ⌘B or click the toggle.

## Decision

- **New lib** `src/lib/sidebar-toggle-event.ts`: Export a custom event name `SIDEBAR_TOGGLE_EVENT` and a helper `dispatchSidebarToggle()` so components that do not have access to sidebar state can request a toggle without coupling to AppShell.
- **AppShell**: Subscribe to `SIDEBAR_TOGGLE_EVENT` in a `useEffect`; when the event is fired, call `setSidebarCollapsed((prev) => !prev)`. Sidebar state and persistence (localStorage) remain unchanged.
- **Command palette**: Add an action "Toggle sidebar" (PanelLeft icon) that calls `dispatchSidebarToggle()` and closes the palette. Users can invoke it via ⌘K without memorizing ⌘B.
- **Keyboard shortcuts help**: Add "Toggle sidebar" to the "Command palette (⌘K / Ctrl+K)" group in `keyboard-shortcuts.ts` so the shortcuts dialog documents the palette action.

## Consequences

- Users can collapse or expand the sidebar from anywhere via ⌘K → "Toggle sidebar", in addition to ⌘B and the sidebar button.
- No new React context; the custom event keeps AppShell and CommandPalette decoupled.
- The global shortcut ⌘B remains the primary shortcut for toggling; the palette action is an alternative for palette-first users.
