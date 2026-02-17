# ADR 0050: Worker debugging section — temp ticket must use slot 1 to appear below terminal

## Status

Accepted.

## Context

In the Worker tab **Debugging** section, when the user pastes error logs and clicks **Run terminal agent to fix**, the app should create a temporary ticket run, run `script/worker/run_terminal_agent.sh` via Tauri, and show the run **below a terminal** in the Terminal Output section. Users reported that after sending the prompt, nothing appeared: no terminal row and no ticket below it, even though the backend was invoking the script correctly.

The Terminal Output section (`WorkerTerminalsSection`) only displays runs that have a `slot` of 1, 2, or 3. It builds `runsForSlots` from `runningRuns` by assigning each run to `runsForSlots[slot - 1]`. Temp ticket runs (including the debugging run) were added to `runningRuns` via `runTempTicket` but **without** a `slot` property (after the move to `run_run_terminal_agent` in ADR 0034). So those runs were never shown in any terminal column.

## Decision

- **Assign `slot: 1` when adding a run in `runTempTicket`**  
  In `src/store/run-store.ts`, when appending the new run to `runningRuns`, set `slot: 1` so the run is included in the first terminal column and its label (e.g. "Debug: fix errors") is shown below the terminal. This matches the original intent in ADR 0030 (debug run appears in slot 1).

- No change to the Debugging section UI or to `run_run_terminal_agent` / `run_terminal_agent.sh`; the fix is store-only.

## Consequences

- Clicking **Run terminal agent to fix** in the Debugging section now creates a tmp ticket run that appears in the first terminal slot with the run label below it, and `run_terminal_agent.sh` runs as before.
- If slot 1 is already occupied by another run, the new run still uses slot 1; the display shows one run per slot, so the most recently added run with that slot is shown (current behavior).

## References

- `src/store/run-store.ts` — `runTempTicket`: add `slot: 1` to the run object pushed to `runningRuns`
- `src/components/molecules/TabAndContentSections/ProjectRunTab.tsx` — `WorkerTerminalsSection` uses `run.slot` to place runs in columns
- ADR 0030 (Worker tab debugging section), ADR 0034 (Separate Implement All and run terminal agent scripts)
