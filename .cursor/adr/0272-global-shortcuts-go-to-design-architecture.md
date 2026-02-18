# ADR 0272 — Global shortcuts: Go to Design, Go to Architecture

## Status

Accepted.

## Context

- The command palette (⌘K) already has "Go to Design" and "Go to Architecture" actions that navigate to the first active project's Design and Architecture sections (project tab, #design / #architecture).
- Other project-tab destinations have dedicated global shortcuts: Go to Run (⌘⇧W), Go to Testing (⌘⇧Y), Go to Milestones (⌘⇧V), Go to Versioning (⌘⇧U), Go to Planner (⌘⇧J), Go to Control (⌘⇧C). Design and Architecture had no global shortcuts; users had to open the palette and search.

## Decision

- Add two global keyboard shortcuts in `CommandPalette.tsx` (same pattern as existing "Go to" shortcuts):
  - **Go to Design:** ⌘⇧X (Mac) / Ctrl+Alt+X (Windows/Linux). Calls existing `goToDesign()` (first active project → `/projects/{id}?tab=project#design`). Same guards: do not trigger when palette is open or when focus is in INPUT/TEXTAREA/SELECT.
  - **Go to Architecture:** ⌘⇧A (Mac) / Ctrl+Alt+A (Windows/Linux). Calls existing `goToArchitecture()` (first active project → `/projects/{id}?tab=project#architecture`). Same guards.
- Document both shortcuts in `src/data/keyboard-shortcuts.ts` (Help group), so they appear in the keyboard shortcuts help dialog (Shift+?).

## Consequences

- Users can jump to the first active project's Design or Architecture section with a single key combo, without opening the command palette.
- Behaviour matches existing "Go to" shortcuts: if no project is selected, a toast is shown and the app redirects to the Projects page.
- The shortcuts help dialog (Shift+?) lists "Go to Design" and "Go to Architecture" with their key bindings.
