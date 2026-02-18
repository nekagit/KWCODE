# ADR 0223: Run history filter by label and output

## Status

Accepted.

## Context

The Run tab History section filters runs by **label** only (the run’s display label). Users could not find runs by searching inside the terminal output (e.g. "error", "failed", or a specific log line). Finding runs that contained a given string in their output required opening each run or scanning manually.

## Decision

- Add a small lib `src/lib/run-history-filter.ts` that exports `filterRunHistoryByQuery(entries, query)`: trim and lowercase the query; if empty, return entries unchanged; otherwise filter entries where the query appears in the run’s **label** or **output** (case-insensitive).
- Use this function in the Run tab History filter pipeline instead of inline label-only matching. The same filter input and persisted `filterQuery` preference are used; only the matching logic is extended.
- Update the filter input placeholder to "Filter by label or output…" and adjust run-history-preferences comments to describe the extended behavior.
- Add unit tests in `src/lib/__tests__/run-history-filter.test.ts` for empty query, label match, output match, combined match, and case insensitivity.

## Consequences

- Users can find runs by typing text that appears in either the run label or the terminal output.
- No new UI or preferences; one filter box matches both label and output.
- Filter logic is testable and reusable; the Run tab remains the only consumer for now.
