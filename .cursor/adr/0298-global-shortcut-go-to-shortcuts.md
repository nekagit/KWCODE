# ADR 0298 — Global keyboard shortcut: Go to Shortcuts

## Status

Accepted.

## Context

- The app has a Shortcuts page at `/shortcuts` (ADR 0276) and the command palette lists "Shortcuts" in NAV_ENTRIES and documents "Go to Shortcuts" (ADR 0285). Other top-level destinations have global shortcuts: Go to Run (⌘⇧W), Go to Design (⌘⇧X), Go to Architecture (⌘⇧A), Go to Documentation (⌘⇧D), etc. The Shortcuts page had no global shortcut; users had to open the command palette (⌘K) or use the sidebar to navigate there.

## Decision

- Add a global keyboard shortcut in `CommandPalette.tsx` (same pattern as existing "Go to" shortcuts):
  - **Go to Shortcuts:** ⌘⇧S (Mac) / Ctrl+Alt+S (Windows/Linux). Calls new `goToShortcuts()` which does `router.push("/shortcuts")`. Same guards: do not trigger when palette is open or when focus is in INPUT/TEXTAREA/SELECT.
- Add a "Go to Shortcuts" action in the command palette entries (after "Go to Control") so the shortcut and palette behaviour are consistent.
- Document the shortcut in `src/data/keyboard-shortcuts.ts` (Help group), after "Go to Documentation", so it appears in the keyboard shortcuts help dialog (Shift+?).

## Consequences

- Users can jump to the Shortcuts page with a single key combo from anywhere in the app, without opening the command palette.
- Behaviour matches existing "Go to" shortcuts; no project selection required (Shortcuts is a top-level page).
- The shortcuts help dialog (Shift+?) lists "Go to Shortcuts" with keys ⌘⇧S / Ctrl+Alt+S.
