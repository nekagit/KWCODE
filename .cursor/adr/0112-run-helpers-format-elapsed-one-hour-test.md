# ADR 0112: run-helpers — formatElapsed one-hour (3600s) boundary test

## Status

Accepted.

## Context

- `formatElapsed(seconds)` in `src/lib/run-helpers.ts` formats 60+ seconds as `m:ss`.
- Existing tests covered up to 3599s ("59:59"); the one-hour boundary (3600s → "60:00") was not explicitly asserted.

## Decision

- **Extend run-helpers tests**: In `src/lib/__tests__/run-helpers.test.ts`, add a test case for `formatElapsed(3600)` → `"60:00"` to document and guard the one-hour boundary.

## Consequences

- One-hour display behavior is regression-protected.
- No change to production code; tests only.

## References

- `src/lib/run-helpers.ts` — `formatElapsed`
- `src/lib/__tests__/run-helpers.test.ts` — new "formats one hour as 60:00" test
- ADR 0109 — formatElapsed boundary tests (1s, 59s)
