# ADR 20260211: Implement All – 3 terminals, Stop/Clear/Archive, Add prompt dropdown

## Status
Accepted

## Context
User requested: (1) terminal height half device height, (2) 3 terminals side by side full width, (3) Stop button that stops all terminals and kills processes but never deletes logs, (4) Clear button to clear the logs, (5) Archive button to save logs when clicked, (6) dropdown next to Implement All for "Add prompt" with Self-written and AI generation options.

## Decision

### Run store
- **archivedImplementAllLogs:** array of `{ id, timestamp, logLines }` for saved logs.
- **stopAllImplementAll:** stops every running "Implement All" run (invokes `stop_run` for each); logs are kept.
- **clearImplementAllLogs:** sets `logLines` to `[]` for all "Implement All" runs (clears display only).
- **archiveImplementAllLogs:** appends current Implement All runs’ logs (with run labels) to `archivedImplementAllLogs` and toasts "Logs archived."

### Project details Todo tab (ProjectTicketsTab)
- **Layout:** One toolbar row above the terminals: Implement All button, "Add prompt" dropdown, Stop all, Clear, Archive. Below: grid of 3 terminal slots (full width, `grid-cols-3`), each slot `h-[50vh] min-h-[200px]`.
- **Terminals:** `ImplementAllTerminalsGrid` subscribes to `runningRuns`, takes last 3 "Implement All" runs (most recent in slot 1, then 2, then 3). Each slot is `ImplementAllTerminalSlot` (Card + ScrollArea with log lines or empty state).
- **Stop all:** calls `stopAllImplementAll`, disabled when no run is running.
- **Clear:** calls `clearImplementAllLogs`.
- **Archive:** calls `archiveImplementAllLogs`.
- **Add prompt dropdown:** trigger "Add prompt" with items "Self-written prompt" and "AI generation prompt". Both open `AddPromptDialog` with title and a textarea; AI option has a "Generate" button (placeholder). Save toasts and closes; prompt content can be wired to run/API later.

## Consequences
- Three terminal slots show last three Implement All runs; stopping clears no logs; Clear only clears displayed lines; Archive persists current logs in store.
- Add prompt UI is in place; Self-written and AI generation flows can be connected to Implement All or an API later.
