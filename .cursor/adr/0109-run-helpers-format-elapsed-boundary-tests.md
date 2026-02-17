# ADR 0109: run-helpers — formatElapsed boundary tests (1s, 59s)

## Status

Accepted.

## Context

- `formatElapsed(seconds)` in `src/lib/run-helpers.ts` formats values under 60 seconds as `Xs` and 60+ as `m:ss`.
- Existing tests covered 0, 45 (under 60) and 60, 90, 125 (60+). The boundaries at 1s and 59s were not explicitly asserted.

## Decision

- **Extend run-helpers tests**: In `src/lib/__tests__/run-helpers.test.ts`, add assertions for `formatElapsed(1)` → `"1s"` and `formatElapsed(59)` → `"59s"` inside the existing "formats seconds under 60 as Xs" test, to document and guard the under-60 range boundaries.

## Consequences

- Boundary behavior at 1s and 59s is regression-protected.
- No change to production code; tests only.

## References

- `src/lib/run-helpers.ts` — `formatElapsed`
- `src/lib/__tests__/run-helpers.test.ts` — updated "formats seconds under 60 as Xs" test
- ADR 0085–0087 — formatElapsed edge-case and defensive tests
