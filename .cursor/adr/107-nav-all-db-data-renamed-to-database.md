# ADR 107: Navigation label "All DB Data" renamed to "Database"

## Status

Accepted.

## Context

The sidebar and dashboard used "All DB Data" for the database/data view. Users requested a shorter, clearer label in navigation.

## Decision

1. **Sidebar (Log & DB Data section):** Change the nav item label from "All DB Data" to "Database".
2. **Dashboard tab:** Change the tab heading for the same view from "All DB Data" to "Database" for consistency.

## Consequences

- Shorter, clearer label in the sidebar and on the dashboard.
- Same route and behavior (`/?tab=all`); only display text changed.
- ADR 104 remains valid; this refines the label further (DB Data → Database for the main nav entry).
