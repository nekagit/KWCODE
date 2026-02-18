# ADR 0291: Run tab — Remove last run button in History toolbar

## Status

Accepted.

## Context

The command palette (⌘K) already offered "Remove last run from history" (ADR 0244). The Run tab History section had "Copy last run" and "Download last run" in the toolbar (ADR 0257) but no inline way to remove the most recent run. Users had to open the command palette to clear the latest run from history.

## Decision

Add a **Remove last run** button to the Run tab History toolbar, immediately after "Download last run":

- Calls `removeTerminalOutputFromHistory(lastRun.id)` from the run store (same as the command palette action).
- Shows a success toast: "Last run removed from history".
- Uses Trash2 icon; disabled when there is no run history (`!lastRun`).
- Same "last run" definition as Copy/Download last run (entry with latest `timestamp`).

No new lib or store logic; reuse existing `removeTerminalOutputFromHistory` and the existing `lastRun` computed value in `ProjectRunTab.tsx`.

## Consequences

- Users can remove the most recent run from the Run tab without opening the command palette.
- Behavior matches the existing command palette "Remove last run from history" action.
- Minimal change: one button in the History toolbar in `ProjectRunTab.tsx`.
