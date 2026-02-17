# ADR 0120: run-helpers — formatElapsed two-or-more-hours boundary test

## Status

Accepted.

## Context

- `formatElapsed(seconds)` in `src/lib/run-helpers.ts` formats 60+ seconds as `m:ss`.
- ADR 0112 and 0116 added tests for 3600s → "60:00" and 3601s → "60:01". Runs of two or more hours (e.g. 7200s → "120:00") were not explicitly covered.

## Decision

- **Extend run-helpers tests**: In `src/lib/__tests__/run-helpers.test.ts`, add a test case for `formatElapsed(7200)` → `"120:00"` and `formatElapsed(7261)` → `"121:01"` to document and guard the two-or-more-hours boundary.

## Consequences

- Display for long runs (2+ hours) is regression-protected.
- No change to production code; tests only.

## References

- `src/lib/run-helpers.ts` — `formatElapsed`
- `src/lib/__tests__/run-helpers.test.ts` — new "formats two or more hours as m:ss" test
- ADR 0116 — formatElapsed just-over-one-hour (3601s) test
