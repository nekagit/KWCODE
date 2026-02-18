# ADR 0251: Command palette — Go to first project Frontend and Backend

## Status

Accepted.

## Context

The app has "Go to first project" and many "Go to first project X" actions in the command palette (⌘K): Worker, Testing, Milestones, Versioning, Planner, Design, Architecture, Control, Ideas, and Documentation. The **Frontend** and **Backend** tabs on the project detail page had no equivalent; users could not jump to them from the command palette.

## Decision

- Add **"Go to first project Frontend"** and **"Go to first project Backend"** actions to the command palette (⌘K) that navigate to the first active project's Frontend tab (`/projects/{id}?tab=frontend`) and Backend tab (`/projects/{id}?tab=backend`), with the same guards as other "Go to" actions (resolve first active project, toast if none).
- **CommandPalette.tsx:** Implement `goToFirstProjectFrontend` and `goToFirstProjectBackend` callbacks (resolve first active project, then `router.push` with the appropriate `?tab=`); add action entries with Monitor and Server icons. No new global shortcuts (palette-only).
- **keyboard-shortcuts.ts:** Add "Go to first project Frontend" and "Go to first project Backend" in the Command palette group only.

## Consequences

- Users can open the Frontend and Backend tabs of their first active project from the command palette (⌘K).
- The actions are documented in the Keyboard shortcuts help dialog.
- Run `npm run verify` to confirm tests, build, and lint pass.
