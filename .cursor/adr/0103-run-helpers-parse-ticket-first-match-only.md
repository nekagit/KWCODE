# ADR 0103: Run-helpers — parseTicketNumberFromRunLabel first match only

## Status

Accepted.

## Context

- `parseTicketNumberFromRunLabel` in `src/lib/run-helpers.ts` uses the regex `/Ticket #(\d+)/` to extract the ticket number. Labels can contain a second hash-number (e.g. "Ticket #2: Fix issue #99" or "Ticket #1: See #123 in code"). The regex matches the first occurrence, so the returned value is the ticket number (2 or 1), not the in-text reference (99 or 123). This behaviour was not explicitly tested.

## Decision

- Add a unit test in `src/lib/__tests__/run-helpers.test.ts` that asserts when the label contains another `#number` (e.g. issue ref), the function returns the first Ticket #N only: e.g. `parseTicketNumberFromRunLabel("Ticket #2: Fix issue #99")` → `2`, `parseTicketNumberFromRunLabel("Ticket #1: See #123 in code")` → `1`.

## Consequences

- The "first match only" behaviour is documented and regression-protected; no change to production code.

## References

- `src/lib/__tests__/run-helpers.test.ts` — new test "uses first Ticket #N when label contains another #number (e.g. issue ref)"
- `src/lib/run-helpers.ts` — implementation under test
- ADR 0088 — Run-helpers space-after-hash edge case
