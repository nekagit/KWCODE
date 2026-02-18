# ADR 0250: Command palette — Go to first project Documentation

## Status

Accepted.

## Context

The app has "Go to Run", "Go to Testing", "Go to Milestones", "Go to Versioning", "Go to Planner", "Go to Design", "Go to Architecture", "Go to Control", and "Go to first project Ideas" in the command palette (⌘K), navigating to the first active project's corresponding tab. The **Documentation** tab on the project detail page had no equivalent; users could not jump to it from the command palette. (⌘⇧D / Ctrl+Alt+E goes to the global Documentation page `/documentation`, not the project's Documentation tab.)

## Decision

- Add a **"Go to first project Documentation"** action to the command palette (⌘K) that navigates to the first active project's Documentation tab (`/projects/{id}?tab=documentation`), with the same guards as other "Go to" actions (resolve first active project, toast if none).
- **CommandPalette.tsx:** Implement `goToFirstProjectDocumentation` callback (resolve first active project, then `router.push(\`/projects/${proj.id}?tab=documentation\`)`); add action entry "Go to first project Documentation" with FileText icon. No new global shortcut (palette-only).
- **keyboard-shortcuts.ts:** Add "Go to first project Documentation" in the Command palette group only.

## Consequences

- Users can open the Documentation tab of their first active project from the command palette (⌘K).
- The action is documented in the Keyboard shortcuts help dialog.
- Run `npm run verify` to confirm tests, build, and lint pass.
