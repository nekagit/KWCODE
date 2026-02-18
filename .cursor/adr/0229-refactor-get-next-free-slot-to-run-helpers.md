# ADR 0229: Refactor — Extract getNextFreeSlotOrNull to run-helpers

## Status

Accepted.

## Context

The run-store defined `getNextFreeSlotOrNull` locally to compute the next free terminal slot (1–3) when processing the temp-ticket queue. Project conventions place run/terminal slot logic in `src/lib/run-helpers.ts` (see night-shift and run-store conventions). Keeping this function in the store mixed slot-allocation logic with state management and made it harder to test in isolation.

## Decision

- Move `getNextFreeSlotOrNull(runningRuns: RunInfo[]): 1 | 2 | 3 | null` into `src/lib/run-helpers.ts`, using the existing `isImplementAllRun` helper. Import `RunInfo` from `@/types/run`.
- Add unit tests in `src/lib/__tests__/run-helpers.test.ts` for empty runs, occupied slots, all slots occupied, non–Implement All runs ignored, and done runs ignored.
- run-store imports `getNextFreeSlotOrNull` from `@/lib/run-helpers` and removes the local implementation.

## Consequences

- Run/terminal slot logic lives in one place (run-helpers); behaviour unchanged.
- run-store is slightly thinner; slot allocation is unit-tested and can be reused by other callers if needed.
