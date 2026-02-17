# ADR 0042: Bottom-right terminal dock — only when running; stop and remove

## Status

Accepted.

## Context

The bottom-right dock showed circles for every run (running and done), and there was no way to stop a run or remove runs from the dock. Users wanted to:
- See the dock only when there is at least one terminal/window running.
- Be able to stop runs from the dock.
- Be able to remove runs from the dock so the buttons disappear when no longer needed.

## Decision

- **Visibility:** Show the terminal run dock only when at least one run has `status === "running"`. When all runs are done or removed, the dock is hidden.
- **Running-only circles:** In the dock, show only runs that are currently running (filter `runningRuns` by `status === "running"`). Done runs no longer appear as circles.
- **Stop:** Add a stop button next to each dock circle so the user can stop that run without opening the floating terminal.
- **Remove from dock:** Add a store action `removeRunFromDock(runId)` that removes the run from `runningRuns` and clears `floatingTerminalRunId` if it referred to that run. Add a remove (X) button on each circle so the user can dismiss it from the dock.

## Implementation

- `src/store/run-store.ts`: Added `removeRunFromDock(runId)`; exposed in `useRunState`.
- `src/components/shared/TerminalRunDock.tsx`: Dock returns `null` when `!runningRuns.some(r => r.status === 'running')`. Renders only `runningRuns.filter(r => r.status === 'running')`. Each circle has an adjacent stop button (Square icon) and remove button (X) that call `stopRun` and `removeRunFromDock` respectively.

## Consequences

- The dock no longer appears when no runs are running, satisfying “only see them when there is a window running.”
- Users can stop runs directly from the dock and remove runs to clear the dock.
- Finished runs disappear from the dock automatically (only running runs are shown); users can remove a running run from the dock (circle goes away; backend process may still run until stopped elsewhere if needed).
