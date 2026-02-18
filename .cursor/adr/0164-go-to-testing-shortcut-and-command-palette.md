# ADR 0164: Go to Testing — global shortcut and command palette action

## Status

Accepted.

## Context

The app already had "Go to Run" (⌘⇧W / Ctrl+Alt+W) and a command palette action that navigate to the first active project’s Worker tab. The project detail Testing tab had no equivalent: users could not jump to Testing via keyboard or from the command palette. This was a navigation gap compared to Run.

## Decision

- **Command palette**: Add a "Go to Testing" action that navigates to the first active project’s Testing tab (`/projects/{id}?tab=testing`). Behavior matches "Go to Run": if no active project, show toast "Select a project first" and redirect to `/projects`; if project list is empty or first active project not found, show "Open a project first" and redirect to `/projects`. Use TestTube2 icon. Close palette after selection.
- **Global shortcut**: Add ⌘⇧Y (Mac) / Ctrl+Alt+Y (Windows/Linux) to open the first active project’s Testing tab. Same guards as other "Go to" shortcuts: do not trigger when command palette is open or when focus is in INPUT/TEXTAREA/SELECT.
- **Keyboard shortcuts help**: Document "Go to Testing" in the Help group (⌘⇧Y / Ctrl+Alt+Y) and in the Command palette (⌘K) group in `src/data/keyboard-shortcuts.ts`.

## Consequences

- Users can open the Testing tab of their first active project from the command palette (⌘K, then "Go to Testing") or with ⌘⇧Y / Ctrl+Alt+Y.
- Behavior is consistent with "Go to Run" (project-scoped tab navigation with fallback when no project is selected).
- No new routes or backend changes; frontend-only.
