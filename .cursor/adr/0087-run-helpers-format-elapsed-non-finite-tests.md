# ADR 0087: run-helpers — formatElapsed tests for Infinity and -Infinity

## Status

Accepted.

## Context

- ADR 0086 hardened `formatElapsed(seconds)` to treat non-finite or negative values as 0. Tests were added for NaN and negative seconds.
- `Number.isFinite()` is used in the implementation, so `Infinity` and `-Infinity` are also normalized to 0; this behavior was not explicitly covered by tests.

## Decision

- **Extend run-helpers tests**: In `src/lib/__tests__/run-helpers.test.ts`, add a `formatElapsed` test that asserts `formatElapsed(Number.POSITIVE_INFINITY)` and `formatElapsed(Number.NEGATIVE_INFINITY)` both return `"0s"`, documenting and guarding the existing defensive behavior for all non-finite inputs.

## Consequences

- Non-finite elapsed display behavior is regression-protected.
- No change to production code; tests only.

## References

- `src/lib/run-helpers.ts` — `formatElapsed` (uses `Number.isFinite`)
- `src/lib/__tests__/run-helpers.test.ts` — new "treats non-finite values (Infinity, -Infinity) as 0" test
- ADR 0086 — formatElapsed defensive handling for NaN and negative
