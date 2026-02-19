# ADR 0329: Night shift Idea-driven flow

## Status

Accepted.

## Context

Night shift has two modes: (1) same prompt in a loop on 3 agents until stop; (2) Circle mode — run phases Create → Implement → Test → Debugging → Refactor with 3 agents per phase. Users wanted a flow that ties night shift to **ideas and tickets**: process one idea at a time, and for each idea run the full circle (Create → … → Refactor) **per ticket** in **plan mode**, then move to the next idea.

## Decision

- **Idea-driven mode:** New "Idea-driven" button in the Night shift section (desktop/Tauri only). When started:
  1. Fetch ideas for the project (`get_ideas_list(projectId)`).
  2. Fetch tickets for the project; find the first idea that has at least one ticket linked (`idea_id`).
  3. For that idea, run the circle **per ticket**: for each ticket, run Create (plan) → Implement (plan) → Test (plan) → Debug (plan) → Refactor (plan), one agent run per phase.
  4. When all tickets for the current idea are done, load the next idea from the queue and repeat (refetch tickets, filter by next idea, run circle per ticket).
  5. When no ideas or no tickets remain, stop and show a success toast.

- **State (run-store):** Added `nightShiftIdeaDrivenMode`, `nightShiftIdeaDrivenIdea`, `nightShiftIdeaDrivenTickets`, `nightShiftIdeaDrivenTicketIndex`, `nightShiftIdeaDrivenPhase`, `nightShiftIdeaDrivenCompletedInPhase`, `nightShiftIdeaDrivenIdeasQueue`, and `setNightShiftIdeaDrivenState`.

- **Run meta:** Added `isNightShiftIdeaDriven`, `ideaDrivenTicketId`, `ideaDrivenPhase` so the replenish callback can recognise the exiting run and advance (next phase, next ticket, or next idea).

- **Prompt:** For each run, build prompt = phase prompt (create/implement/test/debugging/refactor) + ticket block (`buildTicketPromptBlock`) + night-shift base + agents. Label: "Night shift — [Phase] #N: Title". Invoke with `agentMode: "plan"`.

- **UI:** "Idea-driven" button (disabled when not Tauri). When idea-driven is active, status line shows current idea title, current ticket number/title, and current phase. Stop button clears both Circle and idea-driven state.

- **No new APIs:** Uses existing `get_ideas_list`, `fetchProjectTicketsAndKanban`, POST ideas/milestones/tickets not required for this flow (uses existing ideas and tickets linked to the project).

## Consequences

- Users can run night shift in an idea-driven way: one idea → all its tickets → each ticket gets the full Create→Implement→Test→Debug→Refactor cycle in plan mode; then the next idea.
- Idea-driven is desktop-only (Tauri) because project-scoped ideas are fetched via `get_ideas_list(projectId)`.
- Same circle phase order (Create → Implement → Test → Debug → Refactor) as standard Circle mode (ADR 0328).
