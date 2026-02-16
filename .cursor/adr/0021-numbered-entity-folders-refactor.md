# ADR 0021: Numbered entity folders (0. ideas, 1. project, 2. setup)

## Status

Accepted

## Context

- Prompts and analysis outputs lived in flat folders: `.cursor/prompts/`, `.cursor/setup/`, `.cursor/project/`. This made it unclear which prompt belonged to which entity and scattered outputs.
- We wanted prompts and their outputs co-located by entity and a clear, consistent layout for templates and new projects.

## Decision

- **Numbered entity folders:** Introduce `0. ideas`, `1. project`, `2. setup` under `.cursor/`. Each entity holds its prompt(s) and output(s).
- **Convention:** Prompt files use the `.prompt.md` suffix (e.g. `ideas.prompt.md`, `design.prompt.md`). Output filenames stay as before (e.g. `PROJECT-INFO.md`, `frontend-analysis.md`).
- **Paths:** `0. ideas/` — ideas.prompt.md, ideas.md. `1. project/` — project.prompt.md, PROJECT-INFO.md. `2. setup/` — design, architecture, testing, documentation, frontend, backend (each with `{name}.prompt.md` and output(s)); nested prompts live in subfolders (e.g. `2. setup/testing/`, `2. setup/documentation/`).
- **Single source of truth:** Add `src/lib/cursor-paths.ts` with entity roots and `getPromptPath(id)` / `getOutputPath(id)` for analyze jobs. All app code and the analyze queue use this module (or the same path strings).
- **Migration:** Move content from `.cursor/prompts/`, `.cursor/setup/`, `.cursor/project/` into the new folders; repeat in `.cursor_template/`. Remove the old folders. Planner, worker, agents, adr, technologies are unchanged.

## Consequences

- Clear ownership: each entity’s prompt and output live in one folder. New projects get the same layout from the template.
- The app and analyze queue reference paths from one module, reducing drift and typos.
- Planner and worker: migrated to `.cursor/7. planner/` and `.cursor/8. worker/` (see ADR 0028).

## References

- `src/lib/cursor-paths.ts` — path constants and helpers
- `src/lib/api-projects.ts` — DEFAULT_ANALYZE_JOBS from cursor-paths
- `.cursor/0. ideas/`, `.cursor/1. project/`, `.cursor/2. setup/` — new layout
- `.cursor/README.md` — updated structure and paths
