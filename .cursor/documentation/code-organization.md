# Code organization

Reusable best practices for folder structure, naming, and module boundaries.

## Folder structure

- **Frontend:** Follow framework conventions (e.g. Next.js `app/`, `components/`, `lib/`). Keep `.cursor/setup/frontend.json` in sync with routes and entities.
- **Backend:** API routes under `app/api/` or equivalent; shared logic in `lib/` or `server/`. Document endpoints in `.cursor/setup/backend.json`.
- **`.cursor/`:** Agents, ADRs, prompts, planner, worker, project, milestones, documentation — do not commit secrets; treat as versioned project spec.

## Naming conventions

- **Files:** kebab-case for config and docs; PascalCase for React components; camelCase for utilities.
- **Components:** PascalCase; co-locate with feature when small.
- **Types:** PascalCase; prefer `*.ts` in `types/` or next to module.

## Module boundaries

- Clear boundaries between UI, API, and data layers. Reference `.cursor/setup/architecture.md` for project-specific patterns.
- Avoid circular imports; use dependency injection or shared types where needed.
