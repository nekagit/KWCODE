# ADR 104: Data renamed to DB Data and Data nav item removed

## Status

Accepted.

## Context

- The sidebar had a "Log & Data" section with items: "All data", "Data", "Log".
- The label "Data" was used for the database/scripts/JSON tab and was ambiguous.

## Decision

1. **Rename all "Data" to "DB Data"** in the UI:
   - Sidebar section title: "Log & Data" → "Log & DB Data".
   - "All data" → "All DB Data" (dashboard All data tab heading).
   - Dashboard DB tab card title: "Data" → "DB Data".
   - Accordion trigger and description: "Database (kv_store, …)" → "DB Data (kv_store, …)" where it denotes the same concept.

2. **Remove the Data navigation item** from the sidebar:
   - Remove the link to `/?tab=data` from `logDataNavItems` in `app-shell.tsx`.
   - The "Log & DB Data" section now contains only "All DB Data" and "Log".
   - The `/?tab=data` URL and its content remain available (e.g. for bookmarks); only the sidebar entry is removed.

## Consequences

- Clearer naming: "DB Data" indicates database/backend data.
- Fewer sidebar items; DB Data is still reachable via "All DB Data" or direct `/?tab=data`.
- Unused `Database` icon import removed from app-shell.
