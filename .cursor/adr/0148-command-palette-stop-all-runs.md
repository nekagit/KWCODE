# ADR 0148: Command palette — Stop all runs

## Status

Accepted.

## Context

Running Implement All or script runs can be stopped from the project detail Run tab via a "Stop all" button (which calls the run store's `stopAllImplementAll()`). There was no way to stop all runs from the global Command palette (⌘K / Ctrl+K). Users on another page (e.g. Projects, Configuration) had to navigate to a project's Run tab to stop in-progress runs.

## Decision

- **Command palette**: Add a "Stop all runs" action to the palette's action entries. When selected, it calls the run store's `stopAllImplementAll()`, shows a success toast ("All runs stopped") or an info toast ("No runs in progress") when nothing is running, and closes the palette. Uses the Square icon for consistency with the Run tab's Stop all button.
- The action is always visible in the palette so users can discover it; if there are no running runs, the handler still runs and shows "No runs in progress".

## Consequences

- Users can stop all in-progress runs from anywhere via ⌘K → "Stop all runs", without opening a project or the Run tab.
- Aligns the palette with other run-related actions (Go to Run, Clear run history, Refresh data).
- Single source of truth remains the run store; stopping from the palette has the same effect as "Stop all" on the Run tab.
