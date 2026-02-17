# ADR 0049: Move completed tickets to Control tab immediately

## Status

Accepted.

## Context

When a ticket run (Implement All) finishes in the Worker tab, the implementation log entry is written and the ticket is done. Users wanted completed tickets to appear in the Control tab **immediately**—i.e. the UI should switch to the Control tab as soon as a run completes so the new entry is visible without manual tab change or refresh.

## Decision

1. **Mark ticket done on success**  
   When `script-exited` fires for a ticket Implement All run with exit code 0 (or undefined), PATCH the ticket to `done: true` and `status: "Done"` so it leaves In Progress. Run meta now includes `ticketId` (set when starting the run from the Worker tab).

2. **Switch to Control tab on completion**  
   After the implementation log entry is successfully appended (Tauri or API), dispatch a custom event `ticket-implementation-done` with `{ projectId }`. The project details page listens for this event and, when the project matches, calls `setActiveTab("control")` and increments a `controlTabRefreshKey`.

3. **Control tab refresh**  
   `ProjectControlTab` accepts an optional `refreshKey` prop. When `refreshKey` changes (e.g. after switching to Control due to a completed run), the tab’s `useEffect` runs again and reloads the implementation log so the new entry is shown.

## Consequences

- Completed ticket runs are visible in the Control tab immediately without user action.
- Tickets are marked Done in the backend on success, so Planner/Worker views stay consistent after refetch.
- Single place of control: run-store-hydration handles script-exited, ticket PATCH, implementation log append, and event dispatch.

## References

- `src/store/run-store-hydration.tsx` — script-exited handler, ticket PATCH, implementation log append, `ticket-implementation-done` dispatch
- `src/components/organisms/ProjectDetailsPageContent.tsx` — listener for `ticket-implementation-done`, `setActiveTab("control")`, `controlTabRefreshKey`
- `src/components/molecules/TabAndContentSections/ProjectControlTab.tsx` — `refreshKey` prop and reload on change
- `src/types/run.ts` — `RunMeta.ticketId`
- `src/components/molecules/TabAndContentSections/ProjectRunTab.tsx` — slot meta includes `ticketId` when starting runs
