# ADR 0018: Milestones are DB entries only (no milestone .md)

## Status

Accepted

## Context

- Milestones were already stored in SQLite (`milestones` table with `id`, `project_id`, `name`, `slug`, `content`, `created_at`, `updated_at`).
- The Milestones tab had an optional "Analyze to generate" flow that wrote to `.cursor/setup/milestone.md`, which could be confused with a file-based source of truth.
- Users need to reference milestones by id (e.g. tickets use `milestone_id`, implementation_log uses `milestone_id`).

## Decision

- **No milestone .md:** Milestones are **only** DB entries. Remove the Analyze flow that wrote to `.cursor/setup/milestone.md` from the Milestones tab. No reading or writing of milestone .md files for the milestone list or CRUD.
- **Type:** Introduce `MilestoneRecord` in `src/types/milestone.ts` so that "milestone is a DB entry with id" is explicit and reusable.
- **UI:** Copy is updated to state that milestones are DB entries with an id for reference (tickets, implementation log). Add Edit and Delete for the selected milestone (PATCH/DELETE already existed in the API).
- **References:** Tickets, implementation_log, and Control tab continue to use `milestone_id` (numeric) to reference milestones; names are resolved from the DB when needed.

## Consequences

- Single source of truth: milestones live only in the `milestones` table. You can reference them by id everywhere.
- No dependency on `.cursor/setup/milestone.md` or any milestone .md for app behavior.
- Edit/Delete in the Milestones tab gives full CRUD from the UI.

## References

- `src/types/milestone.ts` — MilestoneRecord
- `src/lib/db.ts` — milestones table
- `src/app/api/data/projects/[id]/milestones/` — list/create and get/patch/delete by id
- `src/components/molecules/TabAndContentSections/ProjectMilestonesTab.tsx` — DB-only list, add/edit/delete, no .md Analyze
