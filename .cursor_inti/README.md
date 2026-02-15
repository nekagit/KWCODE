# Cursor template (project-agnostic)

This folder (`.cursor_inti`) is the **single source template** for new projects. When you **Initialize** a project in KWCode, the app copies every file from `.cursor_inti` into that project as `.cursor/` (same structure). No inline templates—what you see here is what new projects get.

## How to use

### For new projects

1. In KWCode, add a project and set its repo path. Click **Initialize** to copy this template into the repo as `.cursor/`.
2. Optionally run `.cursor/scripts/initialize-project.sh` from the project root to fill in project name, description, and tech stack (writes `.cursor/project/*.md`).
3. Optionally run `.cursor/scripts/generate-milestones.js` to create or refresh milestone files under `.cursor/milestones/`.
4. Use the app's **Planner** and **Run** tabs to manage tickets (`.cursor/planner/tickets.md`) and run Implement All.

### For this repo (KWCode)

- `.cursor/` in this repo is the **project-specific** implementation. It was created from `.cursor_inti` and then customized (KWCode agents, ADRs, setup JSON, etc.). New folders (project, milestones, worker, configs, scripts, documentation) exist in both `.cursor_inti` and `.cursor`.

## Structure

| Path | Purpose |
|------|--------|
| **agents/** | Role definitions (backend-dev, frontend-dev, solution-architect, tester, documentation-writer). Assign per ticket in the app. |
| **adr/** | Architecture decision records. Template ADRs (0001–0003-template-*) for new projects; project ADRs (e.g. 0004) in `.cursor/` only. |
| **prompts/** | Prompt templates: root (worker, tickets, features, architecture, design, documentation, testing, ideas) and subfolders **setup/**, **development/**, **documentation/**, **testing/**. |
| **setup/** | Architecture, design, frontend.json, backend.json, testing, documentation, ideas. App reads frontend.json and backend.json for Frontend/Backend tabs. |
| **planner/** | tickets.md, features.md, kanban-state.json, project-plan.md; **ticket-templates/** and **ai-suggestions/** for ticket creation. |
| **project/** | PROJECT-INFO.md, TECH-STACK.md, ROADMAP.md. Fill in after init. |
| **milestones/** | Milestone templates and optional numbered milestones (01–05). Link to planner tickets. |
| **worker/** | **queue/** (ready.md, in-progress.md, completed.md) and **workflows/ticket-workflow.md**. For humans/scripts; app uses planner/tickets.md and kanban-state.json. |
| **configs/** | planner-config.template.json, worker-config.template.json, **tech-stacks/** (react-node-postgres, vue-express-mongodb, custom). For scripts and reference. |
| **scripts/** | initialize-project.sh, generate-milestones.js, create-tickets.js, setup-documentation.sh. Run from project root. |
| **documentation/** | setup-guide, development-guide, architecture-overview, api-reference; code-organization, development-workflows, testing-strategy. Source for docs/ (Docusaurus). |

## Paths the app expects (do not remove)

- `.cursor/planner/tickets.md` — work items (checklist format)
- `.cursor/planner/kanban-state.json` — in-progress ticket ids
- `.cursor/planner/features.md` — feature roadmap
- `.cursor/agents/*.md` — agent list
- `.cursor/prompts/worker.md` — Run tab (Implement All)
- `.cursor/setup/frontend.json`, `.cursor/setup/backend.json` — Frontend/Backend tabs

## Customization

- Edit files in **`.cursor_inti`** to change what **new** projects get when they Initialize.
- Edit files in **`.cursor`** (in each project repo) to customize that project only.
- Tech stack variants: add JSON under `configs/tech-stacks/` and use them in `scripts/initialize-project.sh` or docs.
