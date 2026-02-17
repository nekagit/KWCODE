# ADR 0081: Fast development — create tickets and show in normal queue below terminals

## Status
Accepted

## Context
In the Worker tab, “Fast development” let users type a command and run the terminal agent immediately (or queue when all slots busy). Those runs were temp-ticket only: no DB ticket was created, so they did not appear in the “Queue” or “Tickets not currently running” sections below the terminals. Users wanted fast-development prompts to create real tickets and appear in the same queue as normal In Progress tickets.

## Decision
1. **Create ticket on submit**: When the user submits a Fast development command, the app now (a) resolves a default milestone (“General Development” or first milestone), (b) POSTs a new ticket with title from the command, description = full prompt, feature_name = “Fast development”, (c) PATCHes kanban state to add the new ticket’s id to `inProgressIds`, (d) refreshes the Run tab’s kanban/tickets so the new ticket appears in Queue and in the ticket list below terminals.
2. **Run agent as before**: After creating the ticket and updating the queue, the app still calls `runTempTicket` with the same prompt and a label `Ticket #N: <title>`, and passes meta (ticketId, ticketNumber, ticketTitle, milestoneId) for implementation-log and UI. The run continues to use the existing temp-ticket queue and slot assignment.
3. **WorkerFastDevelopmentSection props**: The section now receives `projectId`, `projectPath`, and `onTicketCreated` (e.g. `loadTicketsAndKanban`) so it can create the ticket via API, update kanban (fetch or Tauri where applicable), refresh, then start the agent.

## Consequences
- Fast development submissions create a normal plan_ticket and show in the Queue and “Tickets not currently running” sections below the terminals.
- Same run flow (slots, queue, implementation log) as before; only the ticket creation and queue visibility are added.
- If no milestone exists, the user is prompted to add one (e.g. “General Development”) in the Milestones tab.
