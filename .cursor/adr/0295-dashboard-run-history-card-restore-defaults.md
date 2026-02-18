# ADR 0295: Dashboard Run History card — Restore defaults button

## Status

Accepted.

## Context

The Run tab has an inline "Restore defaults" button for run history sort and filter preferences (ADR 0231), and the command palette (⌘K) has "Restore run history filters". The Dashboard Run History card shows aggregate stats and Copy/Download actions but no way to restore those preferences. Users had to open the command palette or the Run tab to reset run history filters.

## Decision

Add a **Restore defaults** button to the Dashboard Run History card (`RunHistoryStatsCard.tsx`):

- Calls `setRunHistoryPreferences(DEFAULT_RUN_HISTORY_PREFERENCES)` from `@/lib/run-history-preferences`.
- Dispatches `RUN_HISTORY_PREFERENCES_RESTORED_EVENT` so that when the user later opens the Run tab, `ProjectRunTab` syncs its local state from localStorage (existing listener).
- Shows a success toast: "Run history filters restored to defaults."
- Uses RotateCcw icon; button is always enabled (restoring defaults is valid even when there is no run history).
- Placed before "Copy summary" in the card’s action row.

No new lib; reuse existing run-history-preferences API and event, same behaviour as the command palette "Restore run history filters" handler.

## Consequences

- Users can restore run history sort/filter preferences from the Dashboard without opening ⌘K or the Run tab.
- Behavior is consistent with the command palette and Run tab "Restore defaults"; Run tab stays in sync via the existing event listener.
- Minimal change: one button and imports in `RunHistoryStatsCard.tsx`.
