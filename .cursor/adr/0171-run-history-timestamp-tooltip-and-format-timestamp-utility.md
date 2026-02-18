# ADR 0171: Run history timestamp tooltip and shared format-timestamp utility

## Status

Accepted.

## Context

The run history table (Project Run tab) shows timestamps as a short date/time plus relative time (e.g. "2/18/26, 2:30:45 PM (2 min ago)"). The timestamp cell had no `title` attribute, so hover did not show a consistent full date/time and assistive technologies had no extra context. Timestamp formatting was implemented locally in ProjectRunTab with a `formatTime` helper, which could not be reused elsewhere for tooltips or aria-labels.

## Decision

- **Shared utility**: Add `src/lib/format-timestamp.ts` with:
  - `formatTimestampShort(iso: string): string` — for list/table display (short date, medium time; locale-aware).
  - `formatTimestampFull(iso: string): string` — for tooltips and aria (long date, medium time; locale-aware).
  Both return the original string for invalid ISO or NaN dates. No new dependencies; use `Date` and `toLocaleString`.
- **Run history timestamp cell**: In ProjectRunTab, use `formatTimestampShort` for the absolute part of the timestamp display (replacing the local `formatTime`) and set `title={formatTimestampFull(h.timestamp)}` on the timestamp `TableCell` so hover and assistive tech show the full date/time.
- **Tests**: Add `src/lib/__tests__/format-timestamp.test.ts` with unit tests for valid ISO, invalid input, and that the full form is at least as long as the short form.

## Consequences

- Users see the full date/time on hover over run history timestamps; accessibility is improved via a descriptive title.
- Timestamp formatting is centralized and reusable for other tables, tooltips, or exports.
- ProjectRunTab no longer duplicates date-formatting logic; it depends on the shared module.
