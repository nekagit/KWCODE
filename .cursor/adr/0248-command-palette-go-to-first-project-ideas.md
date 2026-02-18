# ADR 0248: Command palette — Go to first project Ideas

## Status

Accepted.

## Context

The app has "Go to Run", "Go to Testing", "Go to Milestones", "Go to Versioning", "Go to Planner", "Go to Design", "Go to Architecture", and "Go to Control" in the command palette (⌘K), navigating to the first active project's corresponding tab. The **Ideas** tab on the project detail page (project-scoped ideas) had no equivalent; users could not jump to it from the command palette.

## Decision

- Add a **"Go to first project Ideas"** action to the command palette (⌘K) that navigates to the first active project's Ideas tab (`/projects/{id}?tab=ideas`), with the same guards as other "Go to" actions (resolve first active project, toast if none).
- **CommandPalette.tsx:** Implement `goToFirstProjectIdeas` callback (resolve first active project, then `router.push(\`/projects/${proj.id}?tab=ideas\`)`); add action entry "Go to first project Ideas" with Lightbulb icon. No new global shortcut (palette-only).
- **keyboard-shortcuts.ts:** Add "Go to first project Ideas" in the Command palette group only.

## Consequences

- Users can open the Ideas tab of their first active project from the command palette (⌘K).
- The action is documented in the Keyboard shortcuts help dialog.
- Run `npm run verify` to confirm tests, build, and lint pass.
