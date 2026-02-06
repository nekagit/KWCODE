# ADR 016: AI generate tickets from project on Tickets page

## Status
Accepted

## Context
Users need to create tickets based on a selected project (e.g. from `all_projects`). The existing AI ticket generator lives on the "AI Generate" tab and uses a free-form description plus optional file uploads. There was no way to generate tickets directly from the Tickets tab using a chosen project as context.

## Decision
- On the **Tickets** tab, add a section "AI generate from project" with:
  - A **Project** dropdown (Select) populated from `allProjects` (project paths; display name is the last path segment).
  - An **AI Generate tickets** button that calls `/api/generate-tickets` with:
    - A description built from the selected project path and name, asking the model for actionable work items (setup, dependencies, features, tests, docs).
    - The same `aiOptions` as the AI Generate tab (granularity, priority, acceptance criteria, etc.).
    - No files (`files: []`).
  - When generation completes, show the same "Generated tickets" block as on the AI Generate tab: list of generated items with "Add all to backlog" and per-ticket "Add".
- Reuse existing state: `aiGeneratedTickets`, `aiGenerating`, `aiError`, `aiOptions`, and handlers `addGeneratedTicketsToBacklog` and `addSingleGeneratedTicket`.
- Add state `ticketPageAiProjectPath` (string) for the selected project path; empty string when none selected.

## Consequences
- Users can stay on the Tickets tab, pick a project, and generate tickets without switching to AI Generate.
- Generated tickets can be added to the backlog from the Tickets tab. If the user then switches to AI Generate tab, the same generated list is shown (shared state) until cleared.
- If no project is selected, the button is disabled and an error is shown if the user attempts generation (handled by "Select a project first" in the handler).
