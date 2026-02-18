# ADR 0175: Run history — date group section header tooltips

## Status

Accepted.

## Context

The Run tab History table groups runs by date (Today, Yesterday, Last 7 days, Older) with section headers (ADR 0163). The headers display only the label; users hovering over a header or using assistive tech had no indication of the actual date range (e.g. which calendar dates "Last 7 days" refers to). Adding a tooltip with the concrete date range improves clarity and accessibility.

## Decision

- **run-history-date-groups.ts**: Export `getRunHistoryDateGroupTitle(key: RunHistoryDateGroupKey): string` that returns a locale-aware description of the date range for each group:
  - today → "Today (Feb 18, 2026)"
  - yesterday → "Yesterday (Feb 17, 2026)"
  - last7 → "Last 7 days (Feb 11 – Feb 18, 2026)"
  - older → "Older (before Feb 11, 2026)"
  Uses `toLocaleDateString(undefined, { dateStyle: "medium" })` so formatting follows the user's locale.
- **ProjectRunTab.tsx**: On the date group section header `TableCell`, set `title={getRunHistoryDateGroupTitle(groupKey)}` so hover and assistive tech show the range.

## Consequences

- Users can see the exact date range for each run history section on hover (or via screen reader).
- Single new export in the existing run-history-date-groups module and one attribute on the header cell; no store or API changes.
- Date boundaries match the same logic used for grouping (start of today, yesterday, 7 days ago).
