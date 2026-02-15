# Release milestone template

Copy and rename for a release (e.g. 1.0, beta, GA). Focus on polish, docs, deploy.

## Objective

(Release name and goal: e.g. "1.0 GA — production-ready".)

## Deliverables

- [ ] All P0/P1 tickets done
- [ ] Documentation updated (docs/ and .cursor/documentation/)
- [ ] Deployment runbook and env checklist
- [ ] Security and performance checks

## Success criteria

- App runs in production (or staging)
- No known P0/P1 bugs
- README and docs cover setup and main flows

## Task breakdown

| # | Task | Owner | Deps |
|---|------|-------|------|
| 1 | (e.g. Final E2E pass) | @tester | — |
| 2 | (e.g. Deploy to staging) | @backend-dev | 1 |

## Dependencies

- Depends on: (last feature milestone or MVP)
- Blocks: (nothing; this is release)

## Timeline

- Release date: (date or TBD)

## Tickets

See `.cursor/planner/tickets.md` for remaining release tasks.

## Required agents

- All (frontend-dev, backend-dev, tester, documentation-writer, solution-architect as needed)
