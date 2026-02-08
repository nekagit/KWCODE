## Current scope (from Kanban — .cursor/features.md & .cursor/tickets.md)

Use the following features and tickets as context. They are parsed from the project's Kanban board.

### Features
- [x] Tickets and features format — #1, #2
- [x] Project details — Todos tab and Kanban — #3, #4
- [x] API and error handling — #5, #6, #7
- [ ] Run and scripts — #8
- [ ] Quality and maintainability — #9, #10, #11, #12
- [ ] Polish and scale — #13, #14, #15
- [ ] Later — #16, #17

### Tickets (by priority)
#### P0
- [ ] #1 Populate tickets.md with work items from codebase (Tickets and features format)
- [ ] #2 Populate features.md from tickets.md (Tickets and features format)
- [ ] #3 Keep Sync button validating features.md and tickets.md correlation (Project details — Todos tab and Kanban)
- [ ] #4 Ensure Analysis: Tickets creates both tickets.md and features.md in one run (Project details — Todos tab and Kanban)

#### P1
- [ ] #5 Add request validation (e.g. Zod) to API routes (API and error handling)
- [ ] #6 Add API auth for /api/* when deployed beyond localhost (API and error handling)
- [ ] #7 Surface OPENAI_API_KEY missing state in UI (API and error handling)
- [ ] #8 Persist run history (metadata + log snippets) (Run and scripts)
- [ ] #9 Add unit/integration tests for lib and store (Quality and maintainability)
- [ ] #10 Add E2E tests for critical flows (Quality and maintainability)
- [ ] #11 Add React error boundaries at layout or route level (Quality and maintainability)
- [ ] #12 Accessibility audit and fixes (Quality and maintainability)

#### P2
- [ ] #13 Project sync / Reload from disk (Polish and scale)
- [ ] #14 i18n / locale layer (Polish and scale)
- [ ] #15 Offline / PWA support for browser mode (Polish and scale)

#### P3
- [ ] #16 Copy Kanban JSON to file in browser mode (Later)
- [ ] #17 Export run log to file from Run page (Later)


---

Implemethn tickets and features