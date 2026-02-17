# ADR 0085: Run-helpers unit tests — edge cases for parseTicketNumber and formatElapsed

## Status

Accepted.

## Context

- `src/lib/run-helpers.ts` provides `parseTicketNumberFromRunLabel` and `formatElapsed` used by terminal slot UI and run store. ADR 0084 added Vitest and coverage for `isImplementAllRun` (including Night shift). The same test file had no explicit coverage for ticket #0 or large ticket numbers, or for fractional seconds and long-run formatting in `formatElapsed`.

## Decision

- **Extend `parseTicketNumberFromRunLabel` tests**: Add a test that parses "Ticket #0: title" → 0 and "Ticket #999: x" → 999 so boundary and zero are regression-protected.
- **Extend `formatElapsed` tests**: Add a test that formats 3599 seconds as "59:59" (long runs). Keep existing "floors fractional seconds" coverage (59.9 → "59s", 65.4 → "1:05") and add one case for long-run m:ss.

## Consequences

- Edge cases for ticket parsing and elapsed formatting are documented and covered; future changes to run-helpers will be validated against them.
- No change to production code; test-only change.

## References

- `src/lib/__tests__/run-helpers.test.ts` — new/updated cases for parseTicketNumberFromRunLabel and formatElapsed
- `src/lib/run-helpers.ts` — implementation under test
- ADR 0084 — Unit tests Vitest and Night shift coverage
