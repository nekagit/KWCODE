# ADR 0255: Dashboard run history stats card

## Status

Accepted.

## Context

Run history aggregate stats (total runs, passed, failed, total duration) were available in the Run tab toolbar and via the command palette action "Copy run history stats summary". The Dashboard showed projects, tickets, prompts, and designs but had no visibility into run activity. Users had to open the Run page or use ⌘K to see or copy run stats.

## Decision

Add a **Run history stats card** on the Dashboard (home / overview):

- A dedicated card showing the same summary text as the Run tab: e.g. "42 runs, 38 passed, 4 failed, 2h 15m total".
- A "Copy summary" button that copies the summary to the clipboard using the existing `copyRunHistoryStatsSummaryToClipboard(entries)` from `@/lib/copy-run-history-stats-summary`.
- When there are no runs, the card shows "No runs" and the Copy button is disabled.
- A "View Run" link to navigate to the Run page.

Implementation:

- **New component:** `src/components/molecules/DashboardsAndViews/RunHistoryStatsCard.tsx`. It receives `entries: TerminalOutputHistoryEntry[]`, uses `computeRunHistoryStats` and `formatRunHistoryStatsSummary` from `@/lib/run-history-stats`, and uses existing copy logic. Uses shadcn Card, CardHeader, CardContent, Button.
- **DashboardOverview:** Subscribes to `terminalOutputHistory` from `useRunStore`, renders `RunHistoryStatsCard` between the entity quick links and the Projects section.

## Consequences

- Users see run history at a glance on the Dashboard without opening the Run tab.
- Copy summary is one click from the Dashboard, consistent with Run tab and command palette.
- Single source of truth for stats and copy: same libs as Run tab and command palette.
- Dashboard gains a small dependency on the run store for `terminalOutputHistory`; no new persistence or API.
