# ADR 0019: General Development default milestone and idea

## Status

Accepted

## Context

- Planner Manager and the Add ticket dialog require selecting a **Milestone** and an **Idea**. When either list is empty (new project or no ideas linked), users cannot create or confirm tickets.
- We want new tickets to be assignable without prior setup by always having a "General Development" option and defaulting the dropdowns to it.

## Decision

- **Backend – milestones:** In `GET /api/data/projects/[id]/milestones`, after querying milestones for the project, if no row exists with `name = 'General Development'`, insert one (name `"General Development"`, slug `"general-development"`, content `null`), then return the list. Every project thus has at least one milestone.
- **Backend – ideas:** In `GET /api/data/ideas`, after querying ideas, if no row exists with `title = 'General Development'`, insert one (title `"General Development"`, description `""`, category `"other"`, `project_id` NULL, source `"manual"`), then return the list. One global "General Development" idea exists for all projects.
- **Frontend – ideas list:** In `ProjectTicketsTab.loadMilestonesAndIdeas`, after building `ideasList` (filtered by `project.ideaIds` or all), ensure the list includes the "General Development" idea from `allIdeas` so the Planner dropdown always offers it even when the project has specific `ideaIds`.
- **Frontend – defaults:**  
  - **Generated-ticket flow:** When a ticket is generated and milestone/idea ids are null, a `useEffect` sets them to the "General Development" milestone/idea ids from the current `milestones`/`ideas` lists.  
  - **Add-ticket dialog:** When the dialog is opened (`addTicketOpen` becomes true), set `addTicketMilestoneId` and `addTicketIdeaId` to the General Development ids if they are null (via `useEffect` and a ref to detect open transition).

## Consequences

- New projects and projects with no linked ideas can still create tickets; the dropdowns are never empty and default to "General Development".
- "Ensure exists" logic lives in the GET (read) path for both milestones and ideas; no separate migration or one-off script is required.
- Planner Manager and Add ticket flows default to General Development, reducing friction for new users.

## References

- `src/app/api/data/projects/[id]/milestones/route.ts` — GET ensures General Development milestone per project
- `src/app/api/data/ideas/route.ts` — GET ensures General Development idea globally
- `src/components/molecules/TabAndContentSections/ProjectTicketsTab.tsx` — ideas list always includes General Development; default milestone/idea for generated ticket and Add ticket dialog
