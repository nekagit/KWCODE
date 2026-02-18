# ADR 0221: Relative time with absolute tooltip component

## Status

Accepted.

## Context

The Run tab History table and the Dashboard show relative times ("2 h ago", "Last refreshed: 5 min ago"). The Run tab previously showed both absolute and relative inline ("2/18/26, 2:30:45 PM (2 h ago)") with a native `title` for the full date; the Dashboard used a native `title` for "Last refreshed". There was no reusable component for "relative time with hover for full date", and the Run cell was visually busy.

## Decision

- Add a reusable atom **`RelativeTimeWithTooltip`** in `src/components/atoms/displays/RelativeTimeWithTooltip.tsx`.
- The component accepts `timestamp` as `number` (ms) or `string` (ISO), renders relative time via `formatRelativeTime`, and wraps it in shadcn `Tooltip` with `TooltipContent` showing `formatTimestampFull(iso)`. Invalid timestamps render as "—".
- Use it in **ProjectRunTab** History table: replace the timestamp cell content and native `title` with `<RelativeTimeWithTooltip timestamp={h.timestamp} />` so the cell shows only relative time with a proper tooltip for the full date.
- Use it in **DashboardTabContent** for "Last refreshed: …" so the same Tooltip UX is used instead of native `title`.

## Consequences

- Run history timestamp cell is simpler (e.g. "2 h ago" only) with consistent shadcn Tooltip for full date on hover.
- Dashboard "Last refreshed" uses the same tooltip pattern.
- Other screens can reuse `RelativeTimeWithTooltip` for any relative-time display that should reveal full date on hover.
- Single place for "relative + tooltip" behavior; styling (e.g. dotted underline) is consistent.
