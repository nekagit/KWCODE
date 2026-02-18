# ADR 0167: Go to Versioning — global shortcut and command palette action

## Status

Accepted.

## Context

The app already had "Go to Run", "Go to Testing", and "Go to Milestones" with command palette actions and global shortcuts that navigate to the first active project's Worker, Testing, and Milestones tabs. The project detail Versioning (Git) tab had no equivalent: users could not jump to Versioning via keyboard or from the command palette. This was a navigation gap compared to the other project tabs.

## Decision

- **Command palette**: Add a "Go to Versioning" action that navigates to the first active project's Versioning tab (`/projects/{id}?tab=git`). Behavior matches "Go to Run", "Go to Testing", and "Go to Milestones": if no active project, show toast "Select a project first" and redirect to `/projects`; if project list is empty or first active project not found, show "Open a project first" and redirect to `/projects`. Use FolderGit2 icon. Close palette after selection.
- **Global shortcut**: Add ⌘⇧U (Mac) / Ctrl+Alt+U (Windows/Linux) to open the first active project's Versioning tab. Same guards as other "Go to" shortcuts: do not trigger when command palette is open or when focus is in INPUT/TEXTAREA/SELECT.
- **Keyboard shortcuts help**: Document "Go to Versioning" in the Help group (⌘⇧U / Ctrl+Alt+U) and in the Command palette (⌘K) group in `src/data/keyboard-shortcuts.ts`.

## Consequences

- Users can open the Versioning (Git) tab of their first active project from the command palette (⌘K, then "Go to Versioning") or with ⌘⇧U / Ctrl+Alt+U.
- Behavior is consistent with "Go to Run", "Go to Testing", and "Go to Milestones" (project-scoped tab navigation with fallback when no project is selected).
- No new routes or backend changes; frontend-only.
