# ADR 0253: Command palette — Go to first project Milestones

## Status

Accepted.

## Context

The app has "Go to first project" and "Go to first project X" actions in the command palette (⌘K) for Ideas, Documentation, Frontend, and Backend. There is a global "Go to Milestones" that goes to the dashboard milestones view. The **Milestones** tab on the project detail page (`/projects/[id]?tab=milestones`) had no command-palette shortcut; users could not jump to the first active project's Milestones tab from ⌘K.

## Decision

- Add **"Go to first project Milestones"** to the command palette (⌘K) that navigates to the first active project's Milestones tab (`/projects/{id}?tab=milestones`), with the same guards as other "Go to first project X" actions (resolve first active project, toast if none, redirect to /projects if no project).
- **CommandPalette.tsx:** Implement `goToFirstProjectMilestones` callback (same pattern as `goToFirstProjectDocumentation`); add one action entry with Flag icon. No new global shortcut (palette-only).
- **keyboard-shortcuts.ts:** Add "Go to first project Milestones" in the Command palette group only.

## Consequences

- Users can open the Milestones tab of their first active project from the command palette (⌘K).
- The action is documented in the Keyboard shortcuts help dialog.
- Run `npm run verify` to confirm tests, build, and lint pass.
