# ADR 0002: Adapt .cursor to template app (admin-dashboard-starter)

## Status

Accepted

## Context

The `.cursor` folder was originally written for a broader KWCode workflow (planner, milestones, worker queue, etc.) and a preferred stack that included Express, Clerk, Vitest, and Playwright. The **admin-dashboard-starter** template actually uses Next.js 15, Next.js API Routes only, Prisma + SQLite, and does not yet include auth or test tooling. Path references in agents and prompts pointed to folders that do not exist in the template (e.g. `7. planner/`, `2. setup/`, `documentation/`).

## Decision

1. **Tech stack** — Align `.cursor/technologies/tech-stack.json` with the template: Next.js 15, Next.js API Routes only (no Express), Prisma + SQLite. Clerk, Vitest, Playwright, and Drizzle are documented as optional/recommended when adding auth and tests.

2. **Path references** — All prompts and agents reference only paths that exist in the template, or explicitly treat paths as optional (“when present”, “create when needed”). README describes only the template’s `.cursor` structure.

3. **Backend layout** — Agents describe the actual layout: DB client in `src/lib/db.ts` (single file), schema in `prisma/schema.prisma`. Folders like `lib/auth/` and `lib/validations/` are “add when needed”.

4. **ADR 0001** — One sentence added: this template uses Next.js API Routes only (no Express).

## Consequences

- New projects starting from this template get accurate stack and path documentation.
- Optional features (Clerk, Vitest, Playwright, 7. planner, documentation/) can be added later without contradicting `.cursor` content.
- Single source of truth (tech-stack.json and ADRs) matches the template app.

## References

- `.cursor/technologies/tech-stack.json`
- `.cursor/adr/0001-tech-stack-and-atomic-components.md`
- project_template/package.json, prisma/schema.prisma, src/lib/db.ts
