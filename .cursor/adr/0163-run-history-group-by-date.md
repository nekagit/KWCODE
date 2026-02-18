# ADR 0163: Run history — group by date (Today, Yesterday, Last 7 days, Older)

## Status

Accepted.

## Context

The Run tab History table shows all completed runs in a single flat list. Users can sort by newest/oldest/shortest/longest and filter by date range (24h, 7d, 30d), but there was no visual grouping by date. Scanning a long list to see "what ran today" vs "yesterday" required reading each timestamp. Adding section headers (Today, Yesterday, Last 7 days, Older) improves scannability without changing filters, sort, or persistence.

## Decision

- **New lib** `src/lib/run-history-date-groups.ts`: Export `getRunHistoryDateGroupKey(ts)` (returns `"today" | "yesterday" | "last7" | "older"` using local date boundaries), `RUN_HISTORY_DATE_GROUP_LABELS`, `groupRunHistoryByDate(entries)` (splits entries into four arrays preserving input order within each), and `getRunHistoryDateGroupOrder()` for consistent render order.
- **ProjectRunTab** (WorkerHistorySection): After computing `displayHistory`, call `groupRunHistoryByDate(displayHistory)`. In the History table body, for each date group that has entries render a section header row (single cell with `colSpan={7}`, muted background, label from `RUN_HISTORY_DATE_GROUP_LABELS`), then the existing table rows for that group's entries. No new preferences or toggles; grouping is always shown when there is history.
- Date boundaries use the user's local date (start of today, start of yesterday, and 7 days ago from now). Invalid or missing timestamps are placed in "Older".

## Consequences

- Users can quickly see which runs are from today, yesterday, last 7 days, or older from the Run tab History table.
- Existing sort (newest/oldest/shortest/longest) and filters (date range, exit status, slot, query) are unchanged; grouping is applied to the already-filtered and sorted list.
- Single new module and one component touch; no store or API changes.
