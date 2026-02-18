# ADR 0170: Go to Design / Go to Architecture — command palette and Project tab hash

## Status

Accepted.

## Context

The app has "Go to Run", "Go to Testing", "Go to Milestones", and "Go to Versioning" that navigate to the first active project's Worker, Testing, Milestones, and Versioning tabs. Design and Architecture content lives inside the **Project** tab as accordion sections (Design, Architecture, ADR, etc.). There was no quick way to jump to Design or Architecture from the command palette or via URL; users had to open the Project tab and then expand the correct section manually.

## Decision

- **Command palette**: Add "Go to Design" and "Go to Architecture" actions that navigate to the first active project's Project tab with a hash: `/projects/{id}?tab=project#design` and `/projects/{id}?tab=project#architecture`. Same guards as other "Go to" actions: if no active project, show toast "Select a project first" and redirect to `/projects`; if project not found, show "Open a project first" and redirect. Use Palette and Building2 icons. Close palette after selection. No new global shortcuts (to avoid shortcut clutter).
- **Project tab accordion**: Make the Project tab accordion controlled and sync from the URL hash. On mount and on `hashchange`, if the hash is a valid accordion section (e.g. `#design`, `#architecture`), set the open accordion to that section so the correct panel is expanded when navigating from the command palette or when sharing a link.
- **Keyboard shortcuts help**: Document "Go to Design" and "Go to Architecture" in the Command palette (⌘K) group in `src/data/keyboard-shortcuts.ts` only.

## Consequences

- Users can open the Design or Architecture section of the first active project's Project tab from the command palette (⌘K → "Go to Design" or "Go to Architecture").
- Deep links like `/projects/123?tab=project#design` open the Project tab with the Design accordion expanded; same for `#architecture` and other valid section values.
- No new global shortcuts; command-palette-only for Design/Architecture.
- No new routes or backend changes; frontend-only.
