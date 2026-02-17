# ADR 0057: Worker — temp tickets (fast dev, debug) as queue, wait for free slot

## Status

Accepted.

## Context

Fast development and Debugging sections (and any `runTempTicket` caller) previously started the terminal agent immediately and assigned the next free slot (1–3); when all slots were busy, the new run still started and used slot 1, overwriting the display. Users wanted **all** such tasks to be treated as tickets: first **put in a queue**, then **wait for a free agent/terminal slot** and only start when one is available.

## Decision

- **Queue-first for temp tickets**  
  Fast development, Debugging, and any other `runTempTicket` usage now:
  1. Create a **ticket** (queue entry) and append it to `pendingTempTicketQueue`.
  2. Attempt to **process the queue**: if a slot (1–3) is free, dequeue one job, invoke `run_run_terminal_agent`, and add the run to `runningRuns` with that slot.
  3. If no slot is free, the job remains in the queue until a run exits; on exit, `runNextInQueue` runs and processes the next job when a slot frees.

- **Implementation**  
  - **Run store** (`src/store/run-store.ts`):
    - Added `pendingTempTicketQueue: PendingTempTicketJob[]` and `PendingTempTicketJob` type.
    - Replaced immediate invoke in `runTempTicket` with enqueue + `processTempTicketQueue()`. `runTempTicket` returns `"queued"` when the job was enqueued (so UI can show “Added to queue”).
    - `getNextFreeSlotOrNull(runningRuns)` returns `1 | 2 | 3 | null` (null when all slots occupied).
    - `processTempTicketQueue(get, set)`: dequeue one job if queue non-empty and a slot is free, invoke agent, add run to `runningRuns`, then call itself to drain further if possible. On invoke failure, re-prepend the job to the queue and toast.
    - `runNextInQueue(runId)` now calls `processTempTicketQueue(get, set)` so that when a run exits (script-exited in hydration), the next queued job starts.
  - **UI** (`ProjectRunTab.tsx`): Fast dev and Debugging toasts show “Added to queue. Agent will start when a slot is free.” when `runId === "queued"`. Worker status bar shows a “Queued” pill with count when `pendingTempTicketQueue.length > 0`.

- **Planner / Implement All**  
  In Progress tickets from the planner continue to use `runImplementAllForTickets` and fill up to 3 slots directly. They are already “tickets” in the DB; only temp-ticket flows (fast dev, debug, and other `runTempTicket` callers) use the new queue and wait-for-slot behavior.

## Consequences

- Sending a fast dev or debug prompt always creates a queue entry; the agent starts only when a terminal slot is free.
- Multiple prompts in quick succession accumulate in the queue and run one-by-one as slots free.
- Worker status bar shows how many jobs are queued.
- Same queue behavior applies to all `runTempTicket` callers (e.g. Improve idea, Generate ticket, Analyze doc when run via Tauri).

## References

- `src/store/run-store.ts` — `pendingTempTicketQueue`, `processTempTicketQueue`, `runTempTicket`, `runNextInQueue`
- `src/components/molecules/TabAndContentSections/ProjectRunTab.tsx` — toasts and Queued status pill
- ADR 0056 (next free slot); ADR 0051 (Fast development); ADR 0050 (Debugging temp ticket)
