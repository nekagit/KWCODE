# ADR 0285 — Command palette: Shortcuts as navigation entry

## Status

Accepted.

## Context

- The app has a **Shortcuts** redirect page at `/shortcuts` (ADR 0276) and the sidebar includes Shortcuts in the System section (ADR 0280).
- The command palette has two ways to reach shortcuts help: the action "Keyboard shortcuts" (opens the modal) and global shortcut Shift+?. The palette's **NAV_ENTRIES** (navigation list) includes Configuration and Loading but not Shortcuts.
- Users could not select "Shortcuts" from the palette's nav list to go to `/shortcuts` (bookmarkable URL); they had to use the action (modal) or the sidebar.

## Decision

- Add **Shortcuts** to **NAV_ENTRIES** in `CommandPalette.tsx`: `{ href: "/shortcuts", label: "Shortcuts", icon: Keyboard }`.
- Place after Configuration, before Loading, to match the sidebar order (Configuration, Shortcuts, Loading).
- Reuse the existing `Keyboard` icon (already imported). No new route; `/shortcuts` already exists.
- Document in `keyboard-shortcuts.ts`: add "Go to Shortcuts" under the Command palette group.

## Consequences

- Users can open the command palette (⌘K) and select "Shortcuts" from the nav list to navigate to `/shortcuts`, consistent with Run, Testing, Planner, Design, Architecture, Configuration, and Loading.
- The palette's navigation list aligns with the sidebar for the System section (Configuration, Shortcuts, Loading).
- Single NAV_ENTRIES addition and one keyboard-shortcuts doc entry; no new lib or route.
