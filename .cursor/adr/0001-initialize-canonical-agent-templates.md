# ADR 0001: Initialize uses canonical agent templates

## Status
Accepted

## Context
The "Initialize" action for new projects created a `.cursor` folder and wrote agent `.md` files from short inline templates in `initialization-templates.ts`. Those templates were generic (e.g. Supabase/Clerk stack) and did not match the full, project-specific agent docs (e.g. KWCode Tauri, Zustand, shadcn/ui, Atomic Design). Users expected the same complete agent content as in `.cursor/agents/` to be copied into new projects.

## Decision
- **Canonical templates on disk:** Store the full agent markdown files in `public/cursor-templates/agents/` (e.g. `frontend-dev.md`, `solution-architect.md`, `backend-dev.md`) so they are the single source of truth and can be updated without changing code.
- **Load at initialize time:** When `initializeProjectRepo` runs (client-side), it fetches each agent template from `/cursor-templates/agents/<name>.md` and uses that content when writing `.cursor/agents/<name>.md` in the project.
- **Fallback:** If fetch fails (e.g. Tauri asset path, offline, or missing file), use the existing inline constants from `initialization-templates.ts` so initialization never breaks.

## Consequences
- New projects get the full, identical agent .md content (e.g. 390-line frontend-dev.md) after Initialize.
- To change what gets copied, update the files in `public/cursor-templates/agents/` (or keep `.cursor/agents/` in sync and copy them into `public/cursor-templates/agents/` when updating).
- Inline agent templates in `initialization-templates.ts` remain as fallbacks; they can be kept minimal or removed later if we always ship the public templates.

## References
- `src/lib/api-projects.ts`: `getAgentTemplateContent()`, `initializeProjectRepo()`
- `public/cursor-templates/agents/`: frontend-dev.md, solution-architect.md, backend-dev.md
