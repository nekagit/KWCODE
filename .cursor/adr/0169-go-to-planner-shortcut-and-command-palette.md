# ADR 0169: Go to Planner — global shortcut and command palette action

## Status

Accepted.

## Context

The app already had "Go to Run" (⌘⇧W), "Go to Testing" (⌘⇧Y), "Go to Milestones" (⌘⇧V), and "Go to Versioning" (⌘⇧U) with command palette actions that navigate to the first active project's Worker, Testing, Milestones, and Versioning tabs. The project detail Planner (todo) tab had no equivalent: users could not jump to the Planner tab via keyboard or from the command palette. This was a navigation gap compared to the other project tabs.

## Decision

- **Command palette**: Add a "Go to Planner" action that navigates to the first active project's Planner tab (`/projects/{id}?tab=todo`). Behavior matches "Go to Run", "Go to Testing", "Go to Milestones", and "Go to Versioning": if no active project, show toast "Select a project first" and redirect to `/projects`; if project list is empty or first active project not found, show "Open a project first" and redirect to `/projects`. Use ListTodo icon. Close palette after selection.
- **Global shortcut**: Add ⌘⇧J (Mac) / Ctrl+Alt+J (Windows/Linux) to open the first active project's Planner tab. Same guards as other "Go to" shortcuts: do not trigger when command palette is open or when focus is in INPUT/TEXTAREA/SELECT.
- **Keyboard shortcuts help**: Document "Go to Planner" in the Help group (⌘⇧J / Ctrl+Alt+J) and in the Command palette (⌘K) group in `src/data/keyboard-shortcuts.ts`.

## Consequences

- Users can open the Planner (todo) tab of their first active project from the command palette (⌘K, then "Go to Planner") or with ⌘⇧J / Ctrl+Alt+J.
- Behavior is consistent with "Go to Run", "Go to Testing", "Go to Milestones", and "Go to Versioning" (project-scoped tab navigation with fallback when no project is selected).
- No new routes or backend changes; frontend-only.
