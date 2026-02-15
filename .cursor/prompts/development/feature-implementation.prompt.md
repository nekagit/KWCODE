# Prompt: Feature implementation

Use when implementing a feature described in a ticket or milestone.

## Context

- Ticket/milestone: (paste title and acceptance criteria).
- Agents: use `.cursor/agents/` roles (frontend-dev, backend-dev, etc.) as needed.
- Architecture: `.cursor/setup/architecture.md` and setup JSON.

## Instructions

1. Parse acceptance criteria; break into small steps.
2. Implement backend changes first (API, DB) if the feature has a backend part; then frontend.
3. Follow existing patterns in the codebase; update types and setup JSON if you add entities or routes.
4. Add or update tests for critical paths.
5. Mark ticket done in `.cursor/planner/tickets.md` when complete.

## Output

- Code changes, tests, and any doc/setup updates.
