# ADR 0085: run-helpers — formatElapsed edge-case tests

## Status

Accepted.

## Context

- Night shift runs improve tests when no TODOs or docs tasks are pending (see ADR 0084 and `.cursor/8. worker/night-shift.md`).
- `src/lib/run-helpers.ts` exposes `formatElapsed(seconds)` which uses `Math.floor` for fractional seconds; behavior for fractional inputs was not explicitly tested.

## Decision

- **Extend run-helpers tests**: In `src/lib/__tests__/run-helpers.test.ts`, add a `formatElapsed` test case that asserts fractional seconds are floored (e.g. `59.9` → `"59s"`, `65.4` → `"1:05"`), documenting and guarding the current behavior.

## Consequences

- `formatElapsed` behavior for fractional seconds is regression-protected.
- No change to production code; tests only.

## References

- `src/lib/run-helpers.ts` — `formatElapsed`
- `src/lib/__tests__/run-helpers.test.ts` — new "floors fractional seconds" test
- `.cursor/8. worker/night-shift.md` — night shift task preference
