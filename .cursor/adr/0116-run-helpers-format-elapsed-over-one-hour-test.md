# ADR 0116: run-helpers — formatElapsed just-over-one-hour (3601s) boundary test

## Status

Accepted.

## Context

- `formatElapsed(seconds)` in `src/lib/run-helpers.ts` formats 60+ seconds as `m:ss`.
- ADR 0112 added a test for 3600s → "60:00". The boundary just above one hour (3601s → "60:01") was not explicitly covered.

## Decision

- **Extend run-helpers tests**: In `src/lib/__tests__/run-helpers.test.ts`, add a test case for `formatElapsed(3601)` → `"60:01"` to document and guard the just-over-one-hour boundary.

## Consequences

- Display for runs slightly over one hour is regression-protected.
- No change to production code; tests only.

## References

- `src/lib/run-helpers.ts` — `formatElapsed`
- `src/lib/__tests__/run-helpers.test.ts` — new "formats just over one hour as 60:01" test
- ADR 0112 — formatElapsed one-hour (3600s) test
