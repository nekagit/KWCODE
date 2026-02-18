# ADR 0158: Command palette — Restore run history filters

## Status

Accepted.

## Context

The Run tab has a "Restore defaults" button that resets sort and filter preferences (sort order, exit status, date range, slot, filter query) and persists them to localStorage. Users who have applied filters could only reset them from the Run tab. Power users who use the Command palette (⌘K) for other actions had no way to restore run history filters without navigating to the Run tab first.

## Decision

- **run-history-preferences.ts**: Export a custom event name constant `RUN_HISTORY_PREFERENCES_RESTORED_EVENT` ("kwcode-run-history-preferences-restored"). When the Command palette restores defaults, it calls `setRunHistoryPreferences(DEFAULT_RUN_HISTORY_PREFERENCES)` and dispatches this event so the Run tab (if mounted) can sync its local React state and update the table immediately.
- **CommandPalette.tsx**: Add a Command palette action "Restore run history filters" (RotateCcw icon). On select: close palette, call `setRunHistoryPreferences(DEFAULT_RUN_HISTORY_PREFERENCES)`, dispatch the custom event, show toast "Run history filters restored to defaults."
- **ProjectRunTab.tsx**: Subscribe to `RUN_HISTORY_PREFERENCES_RESTORED_EVENT` in a `useEffect`; when fired, set local sort/filter state to `DEFAULT_RUN_HISTORY_PREFERENCES` so the History table updates without remounting.
- **keyboard-shortcuts.ts**: Document "Restore run history filters" under the Command palette (⌘K) group in the shortcuts help.

## Consequences

- Users can restore run history filters from anywhere via ⌘K → "Restore run history filters", without opening the Run tab.
- If the Run tab is open, its filters and table update immediately; if not, the next time they open the Run tab they see defaults (persisted in localStorage).
- Same behaviour as the Run tab "Restore defaults" button; single source of truth for default preferences.
