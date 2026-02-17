# ADR 0086: run-helpers — formatElapsed sub-second test

## Status

Accepted.

## Context

- ADR 0085 extended run-helpers tests for fractional seconds (59.9, 65.4) and long runs. Sub-second inputs (e.g. 0.9) were not explicitly covered; the implementation floors with `Math.floor(seconds)`, so 0.9 → "0s".

## Decision

- **Extend formatElapsed tests**: In `src/lib/__tests__/run-helpers.test.ts`, add an assertion that sub-second values are floored (e.g. `formatElapsed(0.9)` → `"0s"`) within the existing "floors fractional seconds" test, documenting and guarding low-end behavior.

## Consequences

- formatElapsed behavior for sub-second inputs is regression-protected.
- No change to production code; test only.

## References

- `src/lib/run-helpers.ts` — formatElapsed
- `src/lib/__tests__/run-helpers.test.ts` — "floors fractional seconds" test
- ADR 0085 — run-helpers edge-case tests
