# ADR 0076: Worker tab — fix slot assignment race and document queue behavior

## Status
Accepted

## Context
In the Worker tab’s Fast development (and Debugging/Asking) flow, multiple prompts sent in quick succession were all assigned terminal slot 1. The third slot stayed empty and the first slot showed the latest prompt. Users also wanted prompts to be queued when all three slots have running agents and to auto-start in the next free (done) slot.

## Root cause
In `processTempTicketQueue` (run-store), the next free slot was computed from `runningRuns`, then one job was dequeued and `invoke("run_run_terminal_agent", ...)` was called asynchronously. The new run was added to `runningRuns` only after the invoke returned. Sending a second or third prompt before the first invoke completed meant later jobs still saw an empty (or incomplete) `runningRuns`, so `getNextFreeSlotOrNull` returned 1 for each. All runs got slot 1; the UI overwrote by slot index so the last run with slot 1 won and slots 2 and 3 stayed null.

## Decision
1. **Reserve slot synchronously**: In `processTempTicketQueue`, after computing the slot and dequeuing the job, add a **placeholder** run to `runningRuns` immediately (with a temporary `runId` such as `pending-${Date.now()}-${slot}-${random}`). Then call `invoke`. On success, replace the placeholder’s `runId` with the real `run_id` from the backend. On failure, remove the placeholder, re-queue the job at the front, and call `processTempTicketQueue` again. This ensures the next call sees the slot as occupied and assigns slot 2 or 3.
2. **Prefer “running” over “done” in slot display**: When building `runsForSlots` in ProjectRunTab and ProjectTicketsTab, if multiple runs share the same slot (e.g. one done, one running after the next queued job started), show the running run in that slot so the active agent is visible.
3. **Queue and “next free slot”**: No logic change. Queue-when-all-slots-busy and auto-start-when-slot-free were already correct: we only count `status === "running"` as occupying a slot, so done runs free their slot and `runNextInQueue` (on `script-exited`) starts the next job in that slot.

## Consequences
- Fast development (and related flows) now assign slots 1, 2, 3 correctly even when the user sends several prompts quickly.
- When all three slots are running, new prompts stay in `pendingTempTicketQueue` and are started automatically when a run exits and frees a slot.
- Backend (`run_run_terminal_agent`) is unchanged; slots are used only in the frontend for which of the three terminal cards displays which run.
