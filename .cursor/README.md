# Cursor usage — KWCode (this project)

This folder is the **project-specific** `.cursor/` for KWCode. It was created from `.cursor_inti` and customized (agents, ADRs, setup JSON, project info). The same structure is available as a template for other projects when they **Initialize** from KWCode.

## How to use (KWCode)

### Start a new project (from another repo)

1. In KWCode app, add a project and set its repo path. Click **Initialize** to copy `.cursor_inti` into that repo as `.cursor/`.
2. Optionally run from that repo root: `.cursor/scripts/initialize-project.sh` (name, description, tech stack).
3. Optionally run: `node .cursor/scripts/generate-milestones.js` to create milestone files.
4. Open the project in KWCode and use **Setup**, **Planner**, **Run** tabs.

### Use agents

- **Assign to tickets:** When generating or editing a ticket, the app lists all `.cursor/agents/*.md` (backend-dev, frontend-dev, solution-architect, tester, documentation-writer). Assign one or more; they are used when running Implement All.
- **Run tab:** Load `.cursor/prompts/worker.md` as the base prompt; per-ticket agents are loaded from `.cursor/agents/`. Move tickets to "In progress" in the Kanban, then click **Implement All**.

### Manage milestones and tickets

- **Milestones:** Edit `.cursor/milestones/*.milestone.md`; link to ticket ranges in `.cursor/planner/tickets.md` (e.g. #1–#12).
- **Tickets:** Edit `.cursor/planner/tickets.md` or use the app's Todos/Kanban; run **Sync** to persist. Use `.cursor/planner/ticket-templates/` to draft new tickets; optionally use `node .cursor/scripts/create-tickets.js "Title" --priority P1` to append a ticket.
- **AI suggestions:** Put suggested tickets in `.cursor/planner/ai-suggestions/generated-tickets.md`, then copy accepted ones into `tickets.md`.

### Worker queue

- **Queue files:** `.cursor/worker/queue/ready.md`, `in-progress.md`, `completed.md` — for humans/scripts. The app does not read them; it uses `.cursor/planner/tickets.md` and `kanban-state.json`.
- **Workflow:** See `.cursor/worker/workflows/ticket-workflow.md` for Backlog → Ready → In progress → Done.

### Update documentation

- **Source:** Edit `.cursor/documentation/*.md` (setup-guide, development-guide, architecture-overview, api-reference, code-organization, development-workflows, testing-strategy).
- **Docs site:** Repo root `docs/` has getting-started, architecture, development, api, guides, contributing. To add Docusaurus later, see `docs/README.md`.

### Customize templates (for future projects)

- Edit **`.cursor_inti`** in this repo to change what new projects get on Initialize. Do not remove or rename paths the app expects (see below).

## Structure (quick reference)

| Path | Purpose |
|------|--------|
| **project/** | PROJECT-INFO.md, TECH-STACK.md, ROADMAP.md |
| **agents/** | backend-dev, frontend-dev, solution-architect, tester, documentation-writer |
| **adr/** | Architecture decision records (0001–0004) |
| **prompts/** | worker, tickets, features, …; subfolders setup/, development/, documentation/, testing/ |
| **setup/** | frontend.json, backend.json, architecture, design, testing, … |
| **planner/** | tickets.md, features.md, kanban-state.json, project-plan.md; ticket-templates/, ai-suggestions/ |
| **milestones/** | mvp/feature/release templates; 01–05 numbered milestones |
| **worker/** | queue/ (ready, in-progress, completed), workflows/ticket-workflow.md |
| **configs/** | planner/worker config templates; tech-stacks/*.json |
| **scripts/** | initialize-project.sh, generate-milestones.js, create-tickets.js, setup-documentation.sh |
| **documentation/** | setup-guide, development-guide, architecture-overview, api-reference, best practices |

## Paths the app expects (do not remove)

- `.cursor/planner/tickets.md` — work items (checklist format)
- `.cursor/planner/kanban-state.json` — in-progress ticket ids
- `.cursor/planner/features.md` — feature roadmap
- `.cursor/agents/*.md` — agent list
- `.cursor/prompts/worker.md` — Run tab (Implement All)
- `.cursor/setup/frontend.json`, `.cursor/setup/backend.json` — Frontend/Backend tabs
