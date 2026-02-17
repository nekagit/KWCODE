# ADR 0088: Run-helpers — parseTicketNumberFromRunLabel edge case (space after #)

## Status

Accepted.

## Context

- `parseTicketNumberFromRunLabel` in `src/lib/run-helpers.ts` uses the regex `/Ticket #(\d+)/` to extract the ticket number. Labels like "Ticket # 5: title" (space between `#` and the number) do not match, so the function correctly returns `null`. This behavior was not explicitly tested and could be broken by a future regex change.

## Decision

- Add a unit test in `src/lib/__tests__/run-helpers.test.ts` that asserts `parseTicketNumberFromRunLabel("Ticket # 5: title")` and `parseTicketNumberFromRunLabel("Ticket # 42")` return `null`, documenting and guarding the "no space allowed after #" behavior.

## Consequences

- The edge case is documented and regression-protected; no change to production code.

## References

- `src/lib/__tests__/run-helpers.test.ts` — new test "returns null when there is a space between # and number"
- `src/lib/run-helpers.ts` — implementation under test
- ADR 0085 — Run-helpers edge-case tests
