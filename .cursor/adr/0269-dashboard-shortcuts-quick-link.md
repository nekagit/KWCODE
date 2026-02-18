# ADR 0269: Dashboard — Shortcuts quick link

## Status

Accepted.

## Context

The Dashboard shows entity quick links (Projects, Ideas, Technologies, Prompts, Run, Testing, Documentation, Configuration, Loading) and a Database link. The keyboard shortcuts help dialog (Shift+?) is available from the Configuration page ("Keyboard shortcuts" button), the command palette (⌘K → "Keyboard shortcuts"), and the global shortcut Shift+?. There was no one-click link to open the shortcuts help from the Dashboard; users had to remember Shift+?, open Configuration, or use the command palette.

## Decision

- In **DashboardOverview.tsx**, add a **Shortcuts** quick link in the entity links row (after the Testing button).
- The link is a button that calls `openShortcutsModal()` from `useQuickActions()`, opening the same ShortcutsHelpDialog as Configuration and the command palette.
- Use the **Keyboard** icon from Lucide and the label "Shortcuts". Style: same as the Testing button (ghost variant, rounded-xl border, card-style), with a distinct color `text-slate-600 dark:text-slate-400`.
- Include `aria-label="Open keyboard shortcuts help"` and `title="Keyboard shortcuts"` for accessibility.

## Consequences

- Users can open the keyboard shortcuts reference from the Dashboard with one click without using Shift+?, Configuration, or the command palette.
- Aligns with existing Dashboard quick links (Run, Testing) and first-class shortcuts help entry points (Configuration, ⌘K).
