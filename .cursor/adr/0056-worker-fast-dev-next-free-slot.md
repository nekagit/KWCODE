# ADR 0056: Worker fast development — assign next free terminal slot

## Status

Accepted.

## Context

In the Worker tab, the Fast development section lets users type a prompt and run the terminal agent immediately. Every such run (and Debugging temp ticket runs) was assigned **slot 1** in the Terminal Output section. Sending several fast development prompts in quick succession caused all runs to appear in the first terminal slot; each new run overwrote the same slot, so only the latest run was visible in that column and earlier runs were no longer shown in any slot.

Users wanted multiple fast development tasks to use a **queue** of agent terminals: each new run should be assigned the **next free** terminal slot (1, 2, or 3) so that concurrent or rapid prompts each get their own slot instead of overriding the first.

## Decision

- **Next free slot**  
  When creating a temporary ticket run (Fast dev, Debug, or other `runTempTicket` call), the app now assigns the **first free slot** among 1, 2, and 3 instead of always using slot 1.

- **Implementation**  
  In `src/store/run-store.ts`:
  - Added `getNextFreeSlot(runningRuns)`: among runs that are slot-eligible (`isImplementAllRun`) and still `status === "running"`, it collects occupied slot numbers and returns the smallest free slot (1, then 2, then 3). If all three are occupied, it returns 1 so the new run still appears in a slot (same as before for the “all busy” case).
  - `runTempTicket` uses `getNextFreeSlot(get().runningRuns)` when appending the new run to `runningRuns`, so each new temp ticket gets a distinct slot when terminals are free.

- **No backend change**  
  The Tauri command `run_run_terminal_agent` is unchanged; only the frontend slot assignment in the run store is updated.

## Consequences

- Sending multiple fast development prompts in sequence assigns them to slot 1, then 2, then 3, so each has its own terminal column when slots are free.
- When all three slots are busy, the next run is assigned slot 1 (and will replace the current slot-1 run in the UI until that run finishes).
- Same behavior applies to Debugging section temp ticket runs and any other caller of `runTempTicket`.

## References

- `src/store/run-store.ts` — `getNextFreeSlot`, `runTempTicket` slot assignment
- ADR 0051 (Worker tab — Fast development section)
- ADR 0050 (Worker debugging — temp ticket slot 1)
