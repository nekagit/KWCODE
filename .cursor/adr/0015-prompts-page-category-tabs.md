# ADR 0015: Prompts page category tabs (General + per-project)

## Status

Accepted

## Context

The Prompts page listed all prompt records in a single table. Users wanted:

- A **General** tab for prompts they add manually (not linked to any project).
- One tab **per project** that has linked prompts, so prompts are grouped by project.

Projects already have a `promptIds` array; prompts are stored in `data/prompts-export.json` and are associated with projects only via each project’s `promptIds`. There is no `project_id` on the prompt record itself.

## Decision

- On the Prompts page (`/prompts`), add **tabs**:
  - **General:** Prompts whose `id` is not in any project’s `promptIds`. These are “prompts I add” (standalone).
  - **One tab per project:** For each project that has at least one prompt in `promptIds`, show a tab labeled with the project name; list only prompts whose `id` is in that project’s `promptIds`.
- Fetch projects from `/api/data/projects` together with prompts from `/api/data/prompts`; derive General vs project groupings in the client with `useMemo`.
- Support deep-linking: when opening `/prompts?projectId=<id>`, preselect that project’s tab if it exists and has prompts.
- No API or data model changes: grouping is derived from existing `Project.promptIds` and the full prompts list.

## Consequences

- Users see a clear separation between “my prompts” (General) and project-linked prompts.
- New prompts created on this page are not in any project’s `promptIds`, so they appear only under General until linked to a project elsewhere (e.g. project edit).
- Project tabs only appear for projects that have at least one prompt in `promptIds`.

## References

- `src/components/organisms/PromptRecordsPageContent.tsx` — tabs UI, fetch projects, filter by General / project
- `src/types/project.ts` — `Project.promptIds`
- `src/app/api/data/prompts/route.ts` — prompts API (unchanged)
