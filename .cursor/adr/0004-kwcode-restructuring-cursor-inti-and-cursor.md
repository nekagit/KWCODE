# ADR 0004: KWCode restructuring — .cursor_inti and .cursor

## Status

Accepted

## Context

The project needed a scalable structure to support rapid setup of new projects with predefined agents, workflows, and best practices. Goals: (1) project-agnostic templates reusable across projects, (2) project-specific implementation in `.cursor/`, (3) milestones, worker queue, automation scripts, and documentation—without breaking the existing Initialize flow (copy `.cursor_inti` → `.cursor`).

## Decision

- **Option A (1:1 copy):** Keep a single layout that matches the desired `.cursor/` layout inside `.cursor_inti/`. Initialize continues to copy every file recursively from `.cursor_inti` to `.cursor`. No init script that rewrites paths; optional scripts run after init for metadata (name, tech stack) and milestone/ticket generation.
- **New folders (in both `.cursor_inti` and `.cursor`):**
  - **project/** — PROJECT-INFO.md, TECH-STACK.md, ROADMAP.md (templates; project fills in after init).
  - **milestones/** — mvp/feature/release milestone templates and optional numbered milestones (01–05) aligned with planner phases.
  - **worker/** — queue/ (ready.md, in-progress.md, completed.md) and workflows/ticket-workflow.md (for humans/scripts; app still uses 7. planner/tickets.md and kanban-state.json).
  - **configs/** — planner-config.template.json, worker-config.template.json, tech-stacks/*.json (react-node-postgres, vue-express-mongodb, custom).
  - **scripts/** — initialize-project.sh, generate-milestones.js, create-tickets.js, setup-documentation.sh (run from project root).
  - **documentation/** — setup-guide, development-guide, architecture-overview, api-reference; code-organization, development-workflows, testing-strategy.
- **Planner extensions:** planner/ticket-templates/ (feature, bug, task) and planner/ai-suggestions/generated-tickets.md.
- **Prompts:** Subfolders under prompts/: setup/, development/, documentation/, testing/ with dedicated prompt files (initialize-frontend/backend/testing, feature-implementation, bug-fix, refactoring, api-docs, user-guide, unit/integration/e2e tests).
- **New agents:** tester.md, documentation-writer.md in agents/ (in addition to backend-dev, frontend-dev, solution-architect).
- **Template ADRs:** In `.cursor_inti/adr/` only: 0001-template-tech-stack-decision, 0002-template-architecture-pattern, 0003-template-testing-strategy (for new projects; this repo keeps 0001–0003 as project ADRs and adds 0004).
- **Docusaurus / docs:** Repo root `docs/` with getting-started, architecture, development, api, guides, contributing. `.cursor/documentation/` holds source snippets; Docusaurus can be added later via create-docusaurus.
- **App (Setup tab):** SETUP_FOLDERS in ProjectSetupTab.tsx extended with project, milestones, worker, documentation so the UI lists these areas.

## Consequences

- **Backward compatibility:** All existing paths (7. planner/tickets.md, kanban-state.json, agents/*.md, prompts/worker.md, setup/frontend.json, backend.json) unchanged. New folders are additive.
- **New projects:** Initialize copies the full template including project/, milestones/, worker/, configs/, scripts/, documentation/, and new prompt subfolders and agents. Optional: run scripts/initialize-project.sh and generate-milestones.js.
- **Maintenance:** Template content lives in `.cursor_inti`; project-specific content in each repo’s `.cursor/`. No deletion of existing files; this ADR adds structure and content only.

## References

- `.cursor_inti/README.md` — How to use the template
- `.cursor/README.md` — Project-specific cursor usage
- `src/components/molecules/TabAndContentSections/ProjectSetupTab.tsx` — SETUP_FOLDERS
- ADR 0001: Initialize copies `.cursor_inti` as `.cursor`
