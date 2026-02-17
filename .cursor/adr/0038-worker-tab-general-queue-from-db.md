# ADR 0038: Worker tab — single general queue from DB (In Progress tickets)

## Status

Accepted.

## Context

The Worker tab previously had three separate queue/workflow areas:

1. **Queue & workflow** — Listed files from `.cursor/worker/queue` and `.cursor/worker/workflows` with file preview. This was file-based, not tied to ticket state.
2. **Analyze queue** — A separate JSON-based queue of 8 analyze jobs (ideas, project, design, etc.) processed 3 at a time, with Enqueue/Process buttons.
3. **Command Center** — Implement All, which already used In Progress tickets from the kanban (DB + kanban state) to run up to 3 tickets.

Users wanted a single, clear queue based on database data: all tickets that are In Progress, with the ability to run them from that queue.

## Decision

- **Remove** the Queue & workflow section (file listing of `.cursor/worker/queue` and `.cursor/worker/workflows`).
- **Remove** the Analyze queue section from the Worker tab (the 8-job analyze queue and its Enqueue/Process UI). Analyze-all remains available from the project overview where it was also exposed.
- **Add** one **General queue** section that:
  - Shows all tickets in **In Progress** from the database (same source as kanban: `/api/data/projects/:id/tickets` + kanban-state `inProgressIds`).
  - Displays ticket count and a simple list (#number + title).
  - Provides a **Run** button that starts runs for the first 3 In Progress tickets (same behavior as Implement All when tickets exist).
- **Single run path:** The Command Center "Implement All" button, when there are In Progress tickets, delegates to the same handler as the Queue "Run" button so run logic lives in one place.

## Implementation

- `src/components/molecules/TabAndContentSections/ProjectRunTab.tsx`:
  - Removed `WorkerQueueSection` and `WorkerAnalyzeQueueSection` components and their usage.
  - Removed imports: `listProjectFiles`, `readAnalyzeQueue`, `writeAnalyzeQueue`, `runAnalyzeQueueProcessing`, `ANALYZE_QUEUE_PATH`, `AnalyzeJob`, `AnalyzeQueueData`, `ScrollArea`, `Workflow`, `FileText`, `ScanSearch`, `ChevronDown`, and Accordion primitives used only by those sections.
  - Added `handleRunInProgressTickets` in the parent: builds worker prompt, slots for first 3 In Progress tickets (with agent docs), calls `runImplementAllForTickets`. Used by both the new queue and the Command Center.
  - Added `WorkerGeneralQueueSection`: shows In Progress tickets from `kanbanData.columns.in_progress.items`, count badge, list of #number + title, and a Run button that calls `onRunInProgress`.
  - Updated `WorkerCommandCenter` to accept `onRunInProgress`; when there are In Progress tickets, "Implement All" calls it instead of duplicating slot-building logic.

## Consequences

- Worker tab has one clear queue: In Progress tickets from the DB; users can run them with one button.
- No file-based queue or separate analyze queue in the Worker tab; less UI clutter.
- Run behavior for In Progress tickets is centralized and consistent between Queue "Run" and "Implement All".
- Analyze-all (8 jobs) remains available from the project overview (ProjectDetailsPageContent) for users who use it there.
