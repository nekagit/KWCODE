# Cursor usage — admin-dashboard-starter template

This folder is the **project-specific** `.cursor/` for the **admin-dashboard-starter** template. It provides agents, prompts, ADRs, tech stack, and rules so AI and developers stay aligned with this app.

## How to use

### Agents

- **2. agents/** — Role instructions for backend-dev, frontend-dev, solution-architect, tester, documentation-writer. Use these when implementing features or when running worker prompts (Implement All, fix-bug).
- **8. worker/implement-all.md** — Base prompt for implementing a single ticket; combine with agent instructions from `2. agents/` when assigned.
- **8. worker/fix-bug.md** — Debugging prompt; respects agent conventions when fixing issues.

### Prompts and outputs

- **0. ideas/** — ideas.prompt.md generates ideas.md (innovation roadmap).
- **1. project/** — project.prompt.md generates PROJECT-INFO.md; design.prompt.md and architecture.prompt.md generate design.md and architecture.md. Frontend and backend prompts (in 3. frontend/ and 4. backend/) generate frontend-analysis.md and backend-analysis.md in `1. project/`.
- **3. frontend/** — frontend.prompt.md → `.cursor/1. project/frontend-analysis.md`.
- **4. backend/** — backend.prompt.md → `.cursor/1. project/backend-analysis.md`.

### Tech stack and rules

- **technologies/tech-stack.json** — Single source of truth for frontend, backend, and tooling. All agents and docs align with this file.
- **rules/** — Atomic design and import rules (e.g. atomic-design-and-tech-stack.mdc).
- **adr/** — Architecture decision records (tech stack, atomic components, adaptation to template).

### Optional (when extending the template)

You can add these when using a fuller workflow (e.g. planning, docs site):

- **7. planner/** — tickets.md, features.md, kanban-state.json, ticket-templates/, ai-suggestions/.
- **milestones/** — Milestone definition files.
- **documentation/** — setup-guide, development-guide, architecture-overview, api-reference.

## Structure (quick reference)

| Path | Purpose |
|------|--------|
| **0. ideas/** | ideas.prompt.md (prompt), ideas.md (output) |
| **1. project/** | project.prompt.md, design.prompt.md, architecture.prompt.md; outputs: PROJECT-INFO.md, design.md, architecture.md, frontend-analysis.md, backend-analysis.md (when generated) |
| **2. agents/** | backend-dev, frontend-dev, solution-architect, tester, documentation-writer |
| **3. frontend/** | frontend.prompt.md → 1. project/frontend-analysis.md |
| **4. backend/** | backend.prompt.md → 1. project/backend-analysis.md |
| **8. worker/** | implement-all.md, fix-bug.md |
| **adr/** | Architecture decision records |
| **rules/** | Tech stack and atomic component rules |
| **technologies/** | tech-stack.json |

## Paths used by prompts and agents

- `.cursor/0. ideas/ideas.md` — Ideas doc output
- `.cursor/1. project/PROJECT-INFO.md` — Project info
- `.cursor/1. project/design.md` — Design system (when generated)
- `.cursor/1. project/architecture.md` — Architecture (when generated)
- `.cursor/1. project/frontend-analysis.md` — Frontend analysis (when generated)
- `.cursor/1. project/backend-analysis.md` — Backend analysis (when generated)
- `.cursor/2. agents/*.md` — Agent instructions
- `.cursor/8. worker/implement-all.md` — Implement All base prompt
- `.cursor/technologies/tech-stack.json` — Canonical tech stack
- `.cursor/adr/` — ADRs (e.g. 0001, 0002)
- `.cursor/rules/` — Component and stack rules

Optional (create when needed): `.cursor/7. planner/`, `.cursor/milestones/`, `.cursor/documentation/`.
