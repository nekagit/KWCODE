# Usage guide

How to start a project, use agents, manage milestones and tickets, use the worker queue, update docs, and customize templates. See also `.cursor/README.md`.

## Start a new project

1. In KWCode, add a project and set its repo path. Click **Initialize** to copy the template (`.cursor_template`) into the repo as `.cursor/`.
2. Optionally from the project root run:
   - `.cursor/scripts/initialize-project.sh` — fill project name, description, tech stack (writes `.cursor/project/*.md`).
   - `node .cursor/scripts/generate-milestones.js` — create milestone files under `.cursor/milestones/`.
3. Open the project in KWCode and use the **Setup**, **Planner**, and **Run** tabs.

## Use agents

- **Agents** are defined in `.cursor/2. agents/*.md` (e.g. backend-dev, frontend-dev, solution-architect, tester, documentation-writer).
- When creating or editing a ticket, assign one or more agents; they are used when you run **Implement All** from the Run tab.
- The Run tab uses `.cursor/8. worker/implement-all.md` as the base prompt and loads per-ticket agents from `.cursor/2. agents/`. Move tickets to "In progress" in the Kanban, then click **Implement All**. When a run finishes, each terminal slot shows success as "Done" or "Done in Xs" and failure as "Failed (exit N)" so you can see at a glance whether the script succeeded or failed.

## Manage milestones and tickets

- **Milestones:** Edit `.cursor/milestones/*.milestone.md` and link to ticket ranges in `.cursor/7. planner/tickets.md` (e.g. tickets #1–#12).
- **Tickets:** Edit `.cursor/7. planner/tickets.md` or use the app's Todos/Kanban; run **Sync** to persist. Use `.cursor/7. planner/ticket-templates/` to draft tickets. Optionally run `node .cursor/scripts/create-tickets.js "Ticket title" --priority P1` to append a ticket.
- **AI suggestions:** Put suggested tickets in `.cursor/7. planner/ai-suggestions/generated-tickets.md`, then copy accepted items into `tickets.md`.

## Worker queue

- **Queue files** (`.cursor/worker/queue/ready.md`, `in-progress.md`, `completed.md`) are for humans and scripts. The app does not read them; it uses `.cursor/7. planner/tickets.md` and `.cursor/7. planner/kanban-state.json`.
- **Workflow:** See `.cursor/worker/workflows/ticket-workflow.md` for Backlog → Ready → In progress → Done and how it relates to the Kanban.

## Update documentation

- **Source:** Edit `.cursor/documentation/*.md` (setup-guide, development-guide, architecture-overview, api-reference, code-organization, development-workflows, testing-strategy).
- **This docs folder:** Edit files under `docs/` (getting-started, architecture, development, api, guides, contributing). To add a Docusaurus site, see `docs/README.md`.

## Customize templates

- To change what **new** projects get when they Initialize, edit the **`.cursor_template`** folder in the KWCode repo. Do not remove or rename paths the app expects (e.g. `.cursor/7. planner/tickets.md`, `.cursor/2. agents/*.md`, `.cursor/8. worker/implement-all.md`, `.cursor/setup/frontend.json`, `.cursor/setup/backend.json`).
- Tech stack variants: add JSON under `.cursor_template/configs/tech-stacks/` and reference them in scripts or docs.
