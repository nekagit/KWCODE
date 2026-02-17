# ADR 0043: Implement All timing and duration tracking

## Status

Accepted.

## Context

Implement All runs (and ticket runs using `implement_all.sh`) were showing "Done in 0s" in the terminal slot UI. Users need to see how long the agent run actually took. The script exits only when the `agent -p` (or `agent`) process finishes; the frontend receives `script-exited` from Tauri at that time and sets `doneAt`. If the UI showed 0s, either the process exited in under a second (e.g. agent not in PATH) or duration was not being computed/displayed correctly. Additionally, when stopping runs via "Stop", the run was marked "done" without `doneAt`, so no duration was shown.

## Decision

1. **Script-side timing**  
   In `script/worker/implement_all.sh`, record start time immediately before running `agent`, and after it exits compute duration and echo it (e.g. "Done. Agent exited with code 0. Duration: 5m 32s"). This gives a single source of truth in the log and makes it clear how long the agent ran, regardless of frontend.

2. **Stop runs set doneAt**  
   When the user stops a run (`stopScript` or `stopRun`), set `doneAt: Date.now()` so the slot shows "Done in Xs" instead of just "Done".

3. **Sub-second duration in UI**  
   In `TerminalSlot`, when duration is under 1 second, show "Done in <1s" instead of "Done in 0s" to avoid implying a bug when the run was very short.

## Implementation

- **script/worker/implement_all.sh**: `START_TIME=$(date +%s)` before agent; after agent, `END_TIME`, `DURATION`, format as `Xm Ys` or `Xs`, and include in the final "Done." line.
- **src/store/run-store.ts**: In `stopScript`, set `doneAt: now` when marking runs as "done".
- **src/components/shared/TerminalSlot.tsx**: When `doneDurationSeconds < 1`, display "<1s" instead of `formatElapsed(0)`.

## Consequences

- Log output always shows real agent duration. If the UI ever showed 0s due to timing/race, the log still shows the true duration.
- Stopped runs show elapsed time until stop.
- Sub-second runs show "<1s" instead of "0s", reducing confusion.
