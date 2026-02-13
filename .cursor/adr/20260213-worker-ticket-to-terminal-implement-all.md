# ADR: Worker tab – Ticket-to-terminal Implement All

## Date
2026-02-13

## Status
Accepted

## Context
The Worker tab shows an in-progress ticket queue (from the Kanban “In progress” column), a Command Center with an “Implement All” button, and a terminals section. Previously, “Implement All” started three identical runs (same prompt + Kanban context) in three terminal slots. Tickets in the queue can reference an agent via `@agent-id` (e.g. `@frontend-dev`), which corresponds to `.cursor/agents/<agent-id>.md`. The user wanted: (1) to combine each ticket’s info with the content of the agent .md referenced by that ticket; (2) when pressing “Implement All”, to assign one ticket per terminal and run only that ticket’s combined prompt in that terminal (1:1 ticket-to-terminal); (3) only one terminal running per assigned ticket.

## Decision
- **Per-ticket prompt:** A helper `buildTicketPromptBlock(ticket, agentMdContent)` was added in `src/lib/analysis-prompt.ts`. It builds a block with ticket number, title, description, priority, feature, optional agent name, and—when the ticket has an agent and content is provided—an “Agent instructions” section with the content of `.cursor/agents/<agent>.md`. `combineTicketPromptWithUserPrompt(ticketBlock, userPrompt)` appends the user’s selected prompt when present.
- **Run store:** A new action `runImplementAllForTickets(projectPath, slots)` was added to `src/store/run-store.ts`. It accepts an array of `{ slot: 1|2|3, promptContent, label }` and invokes Tauri `run_implement_all` once per entry with the given slot and prompt, pushing a `RunInfo` per run with the given label (e.g. `Ticket #5: Add login`). The existing `runImplementAll(projectPath, promptContent)` is kept for the no-tickets case (three identical runs).
- **Worker Command Center:** When the user clicks “Implement All”, the handler now branches:
  - **No in-progress tickets:** Unchanged: build one prompt (selected prompt + Kanban context) and call `runImplementAll(projectPath, promptContent)` so three identical runs start.
  - **In-progress tickets:** Take the first three tickets. For each: load agent content via `readProjectFileOrEmpty(projectId, .cursor/agents/${ticket.agent}.md, repoPath)` when `ticket.agent` is set; build the per-ticket prompt with `buildTicketPromptBlock` and optionally `combineTicketPromptWithUserPrompt` with the selected prompt; collect `{ slot, promptContent, label: "Ticket #N: title" }`. Call `runImplementAllForTickets(projectPath, slots)`. Only as many runs as tickets (up to 3) are started.
- **Run identification:** `isImplementAllRun` in `src/lib/run-helpers.ts` was extended to treat runs whose label starts with `Ticket #` as Implement All runs, so Stop all, Clear, and Archive apply to ticket-driven runs. The run store uses this helper for those actions.
- **Props:** `WorkerCommandCenter` now receives `projectId` and `repoPath` so it can read agent files from the project repo.

## Consequences
- One terminal runs per assigned ticket when “Implement All” is used with in-progress tickets; each run uses that ticket’s details plus the referenced agent .md (when present).
- Tickets without an agent still get a prompt (ticket block only). Missing agent files result in an empty agent block (no failure).
- The terminals section continues to show the last three Implement All–style runs (including “Ticket #…” labels). No backend or script changes were required; the existing `run_implement_all` command is called once per slot with distinct prompt content.
