# ADR 0112: Run-helpers — isImplementAllRun test for Ticket # with no number

## Status

Accepted.

## Context

- `isImplementAllRun` in `src/lib/run-helpers.ts` treats any label starting with `"Ticket #"` as a ticket run (for terminal slot display). Labels like `"Ticket #: no number"` or `"Ticket #"` have no parseable number (`parseTicketNumberFromRunLabel` returns null) but still start with `"Ticket #"`, so they are correctly considered ticket runs. This behaviour was not explicitly tested for `isImplementAllRun`.

## Decision

- Add a unit test in `src/lib/__tests__/run-helpers.test.ts` that asserts `isImplementAllRun` returns true for labels that start with `"Ticket #"` but have no number: e.g. `"Ticket #: no number"` and `"Ticket #"`. This documents that the run is still shown in terminal slots as a ticket run even when the number cannot be parsed.

## Consequences

- Edge-case behaviour is documented and regression-protected; no change to production code.

## References

- `src/lib/__tests__/run-helpers.test.ts` — new test "returns true for Ticket # with no number (label still counts as ticket run for slot display)"
- `src/lib/run-helpers.ts` — implementation under test
- ADR 0103 — parseTicketNumberFromRunLabel first match only
