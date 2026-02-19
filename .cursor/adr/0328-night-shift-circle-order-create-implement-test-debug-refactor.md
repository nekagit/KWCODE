# ADR 0328: Night shift Circle phase order — Create → Implement → Test → Debug → Refactor

## Status

Accepted.

## Context

Night shift Circle mode runs a fixed sequence of phases with 3 agents per phase. The previous order was **Refactor → Test → Debugging → Implement → Create**. Users and the idea-driven flow (one idea → milestones → tickets → circle per ticket) benefit from a lifecycle order that matches how work is done: create/design first, then implement, then test, debug, and finally refactor.

## Decision

- **New circle phase order:** **Create → Implement → Test → Debugging → Refactor**.
- **Types:** Comment for `NightShiftCirclePhase` in `src/types/run.ts` updated to state the new order (type union unchanged).
- **Constants:** `CIRCLE_PHASE_ORDER` in `ProjectRunTab.tsx` set to `["create", "implement", "test", "debugging", "refactor"]`. First phase is Create; last is Refactor; `nextCirclePhase(refactor)` returns `null` (circle ends after Refactor).
- **UI:** `NIGHT_SHIFT_BADGES` display order updated to match (Create, Implement, Test, Debugging, Refactor) so the badge strip reflects execution order.
- **Circle start:** `handleCircleStart` now starts with the Create phase (was Refactor). Toast: "Circle started: Create (3 agents)."

## Consequences

- Circle (standard and idea-driven) runs phases in lifecycle order: create first, then implement, then test, debug, refactor.
- Consistent with idea-driven flow where each ticket runs Create → Implement → Test → Debug → Refactor in plan mode.
