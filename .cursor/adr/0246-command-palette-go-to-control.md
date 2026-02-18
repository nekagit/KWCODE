# ADR 0246: Command palette and shortcut — Go to Control

## Status

Accepted.

## Context

The app has "Go to Run", "Go to Testing", "Go to Milestones", "Go to Versioning", "Go to Planner", "Go to Design", and "Go to Architecture" in the command palette (⌘K), with dedicated shortcuts for Run (⌘⇧W), Testing (⌘⇧Y), Milestones (⌘⇧V), Versioning (⌘⇧U), and Planner (⌘⇧J). The **Control** tab on the project detail page (milestones, ideas, project control) had no equivalent; users could not jump to it from the command palette or via a global shortcut.

## Decision

- Add a **"Go to Control"** action to the command palette (⌘K).
- Add a global keyboard shortcut **⌘⇧C (Mac) / Ctrl+Alt+C (Windows/Linux)** that navigates to the first active project's Control tab (`/projects/{id}?tab=control`), with the same guards as other "Go to" shortcuts (palette closed, focus not in input/textarea/select).
- **CommandPalette.tsx:** Implement `goToControl` callback (resolve first active project, then `router.push(\`/projects/${proj.id}?tab=control\`)`); add action entry "Go to Control" with ClipboardList icon; add `useEffect` for the shortcut.
- **keyboard-shortcuts.ts:** Add "Go to Control" in the Help group (⌘⇧C / Ctrl+Alt+C) and in the Command palette group.

## Consequences

- Users can open the Control tab of their first active project from the command palette or with ⌘⇧C / Ctrl+Alt+C.
- The action is documented in the Keyboard shortcuts help dialog.
- Run `npm run verify` to confirm tests, build, and lint pass.
