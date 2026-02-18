# ADR 0166: Go to Milestones — global shortcut and command palette action

## Status

Accepted.

## Context

The app already had "Go to Run" (⌘⇧W / Ctrl+Alt+W) and "Go to Testing" (⌘⇧Y / Ctrl+Alt+Y) with command palette actions that navigate to the first active project's Worker and Testing tabs. The project detail Milestones tab had no equivalent: users could not jump to Milestones via keyboard or from the command palette. This was a navigation gap compared to Run and Testing.

## Decision

- **Command palette**: Add a "Go to Milestones" action that navigates to the first active project's Milestones tab (`/projects/{id}?tab=milestones`). Behavior matches "Go to Run" and "Go to Testing": if no active project, show toast "Select a project first" and redirect to `/projects`; if project list is empty or first active project not found, show "Open a project first" and redirect to `/projects`. Use Flag icon. Close palette after selection.
- **Global shortcut**: Add ⌘⇧V (Mac) / Ctrl+Alt+V (Windows/Linux) to open the first active project's Milestones tab. Same guards as other "Go to" shortcuts: do not trigger when command palette is open or when focus is in INPUT/TEXTAREA/SELECT.
- **Keyboard shortcuts help**: Document "Go to Milestones" in the Help group (⌘⇧V / Ctrl+Alt+V) and in the Command palette (⌘K) group in `src/data/keyboard-shortcuts.ts`.

## Consequences

- Users can open the Milestones tab of their first active project from the command palette (⌘K, then "Go to Milestones") or with ⌘⇧V / Ctrl+Alt+V.
- Behavior is consistent with "Go to Run" and "Go to Testing" (project-scoped tab navigation with fallback when no project is selected).
- No new routes or backend changes; frontend-only.
