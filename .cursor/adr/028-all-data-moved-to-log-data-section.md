# ADR 028: All Data moved to Log & Data section in sidebar

## Status

Accepted.

## Context

"All data" was in the main nav (between Projects and Tickets). It is a data-focused view (combined projects data). Placing it in the main list mixed workflow items with data views and made the main nav longer.

## Decision

- Remove "All data" from `mainNavItems`.
- Add "All data" to `logDataNavItems` (Log & Data section), as the first item before "Data" and "Log".
- Same route and tab (`/?tab=all`); only sidebar grouping changes.

## Consequences

- Main nav is shorter and focused on Dashboard, Run, Projects, Tickets, Feature, Prompts, Ideas, Design, AI Generate.
- All data-related entries (All data, Data, Log) live together under "Log & Data".
- Users looking for combined data find it in the same section as Data and Log.
