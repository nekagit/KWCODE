# ADR 0302 — Run tab: Copy run history stats summary button

## Status

Accepted.

## Context

The Run tab History section has a toolbar with "Copy last run", "Download last run", "Remove last run", and then Download/Copy stats as JSON and Download/Copy stats as CSV. The Dashboard Run History card and the command palette both offer "Copy run history stats summary" (human-readable aggregate text, e.g. "3 runs, 2 passed, 1 failed, 5m 12s total"). The Run tab had no inline button to copy that summary; users had to open the command palette (⌘K) or go to the Dashboard to use that action.

## Decision

- Add a **Copy summary** button to the Run tab History toolbar in `ProjectRunTab.tsx`, placed after "Remove last run" and before "Download stats as JSON".
- The button calls `copyRunHistoryStatsSummaryToClipboard(displayHistory)` from `@/lib/copy-run-history-stats-summary` (same behaviour as the Dashboard card and command palette).
- Styling: ghost, size sm, Copy icon; disabled when `displayHistory.length === 0`; `aria-label="Copy run history stats summary to clipboard"` and a descriptive `title` for accessibility.
- No new Tauri commands or libs; reuses existing `copyRunHistoryStatsSummaryToClipboard`.

## Consequences

- Users can copy the run history stats summary from the Run tab in one click without opening the palette or leaving the Run page.
- Behaviour and copy format are consistent with the Dashboard Run History card and the command palette "Copy run history stats summary" action.
