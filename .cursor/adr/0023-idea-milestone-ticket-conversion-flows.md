# ADR 0023: Idea → Milestone → Ticket conversion flows

## Status

Accepted

## Context

- Ideas (from `ideas.md` or from the project’s linked ideas in the DB) were not convertible into project milestones. Milestones had no way to spawn multiple tickets in one action.
- We wanted element-specific actions: convert one idea into one or more milestones, and convert one milestone into multiple tickets, with buttons on the relevant UI elements.

## Decision

- **Idea → Milestones (1:N):**
  - Add a “Convert to milestones” button on each idea in:
    - **Project Ideas Doc tab** (ideas from `ideas.md`): on each idea card in the expanded section.
    - **Project Ideas tab** (project’s linked ideas): on each `ProjectIdeaListItem` card.
  - A shared **ConvertToMilestonesDialog** lets the user add one or more milestone rows (name, optional slug, optional content), with “Add another”. Submitting creates that many milestones for the project via `POST /api/data/projects/:id/milestones`. No API change; milestones do not reference ideas.

- **Milestone → Tickets (1:N):**
  - Make **idea_id optional** when creating a ticket: `POST /api/data/projects/:id/tickets` no longer requires `idea_id`; only `milestone_id` is required. The DB already allows `idea_id` NULL; tickets created from “Convert to tickets” can set `idea_id` later via the existing ticket edit flow.
  - Add a “Convert to tickets” button in the **Milestones tab** when a milestone is selected (next to Edit/Delete). A shared **ConvertToTicketsDialog** lets the user add one or more ticket rows (title, optional description, priority); submitting creates that many tickets under the selected milestone with `milestone_id` set and `idea_id` unset.
  - On success, the Milestones tab calls the existing **onTicketAdded** callback so the Planner/Tickets tab refreshes (e.g. `setPlannerRefreshKey`).

- **Placement:** All conversion actions are on the element-specific UI (idea card or selected milestone), not in a global menu.

## Consequences

- Users can turn a single idea into multiple milestones and a single milestone into multiple tickets without leaving the context. Idea can be linked to a ticket later when editing the ticket.
- Optional `idea_id` on ticket creation keeps the conversion flow simple and avoids requiring a “General” idea for every project.

## References

- `src/components/molecules/FormsAndDialogs/ConvertToMilestonesDialog.tsx` — dialog for creating one or more milestones from an idea
- `src/components/molecules/FormsAndDialogs/ConvertToTicketsDialog.tsx` — dialog for creating one or more tickets under a milestone
- `src/app/api/data/projects/[id]/tickets/route.ts` — `idea_id` optional in POST
- `src/components/molecules/TabAndContentSections/ProjectIdeasDocTab.tsx` — “Convert to milestones” on idea cards
- `src/components/atoms/list-items/ProjectIdeaListItem.tsx` — “Convert to milestones” button; `ProjectIdeasTab` wires dialog and resolved ideas
- `src/components/molecules/TabAndContentSections/ProjectMilestonesTab.tsx` — “Convert to tickets” on selected milestone
