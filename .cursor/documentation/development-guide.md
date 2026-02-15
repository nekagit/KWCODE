# Development guide

<!-- How to develop: workflows, agents, branching. Link from docs/development. -->

## Workflows

- **Tickets:** Managed in `.cursor/planner/tickets.md`; use the app's Kanban or Run tab to move and implement.
- **Agents:** Role definitions in `.cursor/agents/`; assign per ticket when generating prompts.
- **Milestones:** See `.cursor/milestones/`; link to planner tickets.

## Branching

- Main branch: `main` (or `master`). Feature work in branches; PR to main.
- Commit format: `type(scope): message` (e.g. feat(auth): add login form).

## Code quality

- Lint before commit; run tests. See `.cursor/documentation/` and docs/contributing for full standards.
