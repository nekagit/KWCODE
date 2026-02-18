# ADR 0149: Command palette — Go to first project

## Status

Accepted.

## Context

The Command palette (⌘K) offers "Go to Run", which navigates to the Run tab of the first active project, and lists all projects by name so users can go to any project's detail page. There was no single action to open the **first active project's detail page** (default tab) from anywhere. Users who wanted to jump to their primary project's overview had to either pick it from the project list or go to Run and then switch tabs.

## Decision

- Add a Command palette action **Go to first project** that navigates to `/projects/{id}` for the first active project (no tab param, so the project detail default tab is shown).
- Reuse the same resolution as "Go to Run": resolve `activeProjects[0]` to a project via the existing projects list or `listProjects()`. If there is no active project or the project is not in the list, show toast "Select a project first" or "Open a project first", navigate to `/projects`, and close the palette.
- Icon: FolderOpen. Place the entry after "Go to Run" in the palette action list.
- No new Tauri commands or API routes.

## Consequences

- Users can jump to the first active project's detail page from anywhere via ⌘K → "Go to first project".
- Behavior when no project is selected matches "Go to Run" (toast + redirect to /projects).
- Keyboard shortcuts help (Shift+?) should include "Go to first project" in the Command palette group so the list stays in sync.
