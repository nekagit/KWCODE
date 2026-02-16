# Generic .cursor template

This folder is a **project-agnostic template** for the `.cursor` directory. It contains agents, prompts, planner structure, worker queue, and setup placeholders—with no project-specific content.

## How to use

1. **Copy this folder into your project** and name it `.cursor` (e.g. copy `.cursor_template` to `.cursor`, or rename after copying).
2. Fill in project-specific content: `.cursor/project/PROJECT-INFO.md`, `.cursor/setup/*`, `.cursor/7. planner/tickets.md`, and `.cursor/adr/` as needed.
3. Optionally run from project root: `node .cursor/scripts/generate-milestones.js`, `.cursor/scripts/initialize-project.sh`, or `node .cursor/scripts/create-tickets.js` to scaffold more content.

All path references inside these files point to `.cursor/...` so that after you copy this folder as `.cursor`, everything works as expected.

## Structure (quick reference)

| Path | Purpose |
|------|---------|
| **project/** | PROJECT-INFO.md — fill in project name, description, tech stack |
| **agents/** | Agent role definitions (backend-dev, frontend-dev, solution-architect, tester, documentation-writer) |
| **adr/** | Architecture decision records — add one per significant decision |
| **prompts/** | Prompt templates (worker, tickets, features, setup, development, documentation, testing) |
| **setup/** | Placeholder setup files (frontend.json, backend.json, architecture, design, testing, ideas, etc.) |
| **7. planner/** | tickets.md, features.md, kanban-state.json; ticket-templates/; ai-suggestions/ |
| **milestones/** | Milestone definitions — add .milestone.md files |
| **worker/** | queue/ (ready, in-progress, completed), workflows/ticket-workflow.md |
| **configs/** | Optional planner/worker config templates |
| **scripts/** | initialize-project.sh, generate-milestones.js, create-tickets.js, setup-documentation.sh |
| **documentation/** | Setup guide, architecture overview, API reference — fill in for your project |
| **technologies/** | tech-stack.json — preferred stack for your project |

## Paths the app expects (if using a Cursor-based project app)

- `.cursor/7. planner/tickets.md` — work items (checklist format)
- `.cursor/7. planner/kanban-state.json` — in-progress ticket ids
- `.cursor/7. planner/features.md` — feature roadmap
- `.cursor/agents/*.md` — agent list
- `.cursor/prompts/worker.md` — Run tab (Implement All)
- `.cursor/setup/frontend.json`, `.cursor/setup/backend.json` — Frontend/Backend tabs
