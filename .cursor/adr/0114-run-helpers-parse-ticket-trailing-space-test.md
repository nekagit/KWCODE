# ADR 0114: Run-helpers — parseTicketNumberFromRunLabel trailing space test

## Status

Accepted.

## Context

- `parseTicketNumberFromRunLabel` in `src/lib/run-helpers.ts` uses `/Ticket #(\d+)/` to extract the ticket number. Labels may have trailing space after the number (e.g. "Ticket #7 " or "Ticket #3: title "). The regex still matches and returns the number; this behaviour was not explicitly tested.

## Decision

- Add a unit test in `src/lib/__tests__/run-helpers.test.ts` that asserts when the label has trailing space after the number, the function still parses correctly: e.g. `parseTicketNumberFromRunLabel("Ticket #7 ")` → `7`, `parseTicketNumberFromRunLabel("Ticket #3: title ")` → `3`.

## Consequences

- Trailing-space behaviour is documented and regression-protected; no change to production code.

## References

- `src/lib/__tests__/run-helpers.test.ts` — new test "parses ticket number when label has trailing space after number"
- `src/lib/run-helpers.ts` — implementation under test
- ADR 0103 — Run-helpers first match only
