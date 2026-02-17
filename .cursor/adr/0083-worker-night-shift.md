# ADR 0083: Worker tab — Night shift (3 agents, endless loop)

## Status

Accepted.

## Context

Users want to run a single general prompt (e.g. from `.cursor/8. worker/implement-all.md`) on multiple agents overnight: when one agent finishes, the same prompt should run again so that 3 agents are always busy until the user stops the run. Each execution is treated as a conceptual "ticket" (no DB ticket created). This allows unattended batch work (e.g. "go to sleep and let the agents work all night").

## Decision

- **Worker tab**: Add a **Night shift** section (card with Moon icon) that offers **Start** and **Stop**.
- **Prompt**: Use the existing general prompt at `WORKER_IMPLEMENT_ALL_PROMPT_PATH` (`.cursor/8. worker/implement-all.md`). No new path constant; the same file drives both "Implement All" and night shift.
- **Execution**: Reuse the existing temp-ticket flow and 3-slot terminal model:
  - On **Start**: Load prompt content; if empty, show toast and abort. Set `nightShiftActive` and register a **replenish callback** (closure over projectId, projectPath, prompt path). Enqueue 3 jobs via `runTempTicket(projectPath, promptContent, "Night shift (Terminal N)", { isNightShift: true })` for N = 1, 2, 3. The existing queue processor fills slots 1–3.
  - When a run exits: In `script-exited` (run-store-hydration), after `runNextInQueue()`, if the run has `meta.isNightShift` and `nightShiftActive` and a replenish callback is set, call that callback with the freed slot (fire-and-forget). The callback re-reads the prompt (so edits during the night apply to the next run) and calls `runTempTicket(..., "Night shift (Terminal N)", { isNightShift: true })`, which enqueues one job and refills the slot.
  - On **Stop**: Set `nightShiftActive` to false and clear the replenish callback. No new jobs are enqueued when runs exit; existing runs may finish.
- **Slot semantics**: Night-shift runs must occupy slots 1–3 like other terminal-agent runs. Add `r.label.startsWith("Night shift")` to `isImplementAllRun` in run-helpers so `getNextFreeSlotOrNull` counts them. Add `isNightShift?: boolean` to `RunMeta` for the exit handler.
- **Run store**: Add `nightShiftActive: boolean` and `nightShiftReplenishCallback: ((slot: 1|2|3) => Promise<void>) | null`, plus `setNightShiftActive` and `setNightShiftReplenishCallback`. No changes to `runTempTicket` or `processTempTicketQueue`; night-shift jobs are normal temp-ticket jobs with `meta.isNightShift`.

## Consequences

- Users can start a "night shift" from the Worker tab and leave 3 agents running the same prompt in a loop until they click Stop.
- Prompt file can be edited during the run; each replenishment uses the current file content.
- App reload clears in-memory state (night shift off); user can Start again. Slots are shared with other worker flows (Implement All, Fast dev, Debug); running other agents competes for the same 3 slots.

## References

- `src/types/run.ts` — `RunMeta.isNightShift`
- `src/lib/run-helpers.ts` — `isImplementAllRun` (Night shift)
- `src/store/run-store.ts` — night shift state and setters
- `src/store/run-store-hydration.tsx` — script-exited replenish
- `src/components/molecules/TabAndContentSections/ProjectRunTab.tsx` — `WorkerNightShiftSection`
