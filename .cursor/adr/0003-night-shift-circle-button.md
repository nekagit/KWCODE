# ADR 0003: Night shift Circle button

## Status

Accepted. Implemented 2025-02-17.

## Context

Night shift runs 3 agents with the same prompt in a loop until the user stops. Users requested a **Circle** mode that runs a fixed sequence of phases (Refactor → Test → Debugging → Implement → Create) with exactly 3 agents per phase. When all 3 runs of a phase complete, the next phase starts automatically; when the Create phase’s 3 runs are done, Circle stops. Only one phase’s badge is active at a time, and the UI should reflect the current phase.

## Decision

- **Types**  
  - Extended `RunMeta` in `src/types/run.ts` with `isNightShiftCircle?: boolean` and `circlePhase?: NightShiftCirclePhase`.  
  - Exported `NightShiftCirclePhase` = `'refactor' | 'test' | 'debugging' | 'implement' | 'create'` for shared use by store and UI.

- **Run store**  
  - Added Circle state: `nightShiftCircleMode`, `nightShiftCirclePhase`, `nightShiftCircleCompletedInPhase`.  
  - Added actions: `setNightShiftCircleState(mode, phase, completed)` and `incrementNightShiftCircleCompleted()`.  
  - Changed night-shift replenish callback signature to `(slot: 1 | 2 | 3, exitingRun?: RunInfo | null) => Promise<void>` so Circle logic can use the exiting run’s `meta.circlePhase` and `meta.isNightShiftCircle`.

- **Hydration**  
  - When a night-shift run exits, the replenish callback is invoked with the exiting run as the second argument so Circle can count completions and advance phase.

- **UI (ProjectRunTab)**  
  - Added a **Circle** button next to **Start** in the Night shift section. Circle is disabled when project path is empty, when a start is in progress, or when night shift is already active.  
  - **handleCircleStart**: Sets Circle state (mode on, phase `refactor`, completed 0), sets a circle-aware replenish callback, and starts 3 runs with only the Refactor badge and meta `{ isNightShift, isNightShiftCircle, circlePhase: 'refactor' }`.  
  - **Circle replenish callback**: If the exiting run is a Circle run and its `circlePhase` matches the store’s current phase, increments `nightShiftCircleCompletedInPhase`. When count reaches 3, advances to the next phase (or ends Circle after Create), resets completed to 0, and starts 3 runs for the new phase; otherwise starts 1 run for the current phase.  
  - **Stop**: Clearing night shift also clears Circle state (`setNightShiftCircleState(false, null, 0)`).  
  - **Badge UI**: When `nightShiftCircleMode` is true, the single selected badge is derived from `nightShiftCirclePhase` (read-only); when Circle is off, badges use existing local state and remain toggleable.

## Consequences

- Circle and normal night shift are mutually exclusive at the UI level (only one active at a time).  
- Replenish call sites that ignore the second argument remain valid.  
- Phase order and “3 runs per phase” are fixed; no loop after Create unless extended later (e.g. “Circle (loop)” option).
