# Work items (tickets) — automated_development

**Project:** automated_development
**Source:** Codebase analysis
**Last updated:** 2026-02-09

---

## Summary: Done vs missing

### Done

| Area | What's implemented |
|------|--------------------|
| Dashboard | Tabbed home with tickets kanban, prompts, active repos, features queue |
| Tickets | CRUD, status/priority, drag-and-drop; AI generate from project or PDF/text |
| Features | Define features (tickets, prompts, projects); run single or queue; filter, delete |
| Run | Select prompts and projects; run script (Tauri); log; feature-based run and queue |
| Projects | List, create from template/idea/path, delete; detail with links and export |
| Project detail | Link prompts, tickets, features, ideas, designs, architectures; categorizations; export spec; Cursor files tree; analysis prompt; load/sync Kanban from .cursor/tickets.md and .cursor/features.md; archive; Implement Features loop; JSON on .md load |
| Prompts | Full CRUD via API; AI generate from description |
| Ideas | CRUD; categories; AI generate; create project from idea |
| Design | Config (sections, colors, typography); generate markdown/HTML; AI generate; library |
| Architecture | CRUD; categories; AI generate; filter by category |
| Configuration | Timing params for run |
| Data tab | Scripts, JSON files, KV/tickets/features dump (Tauri: SQLite) |
| Seed template | API and UI to seed project from template |
| Tauri backend | SQLite, run script, file read/archive, list projects |

### Missing or incomplete

| Area | Gap |
|------|-----|
| Testing | No unit or E2E tests; no Jest/Vitest/Playwright |
| API | No authentication; unvalidated request bodies; no rate limiting |
| Resilience | No React error boundaries; run log in-memory only; browser mode no persistence story |
| Validation | Request bodies not validated (e.g. Zod); malformed input can cause 500s |
| UX | Project details and home page are very large single components; no systematic a11y beyond Radix |
| Project sync | Local projects vs projects.json/DB can get out of sync; no sync-from-disk |
| Run history | Log not persisted; no search |
| i18n | English only; no locale/translation layer |

---

## Prioritized work items (tickets)

### P0 — Critical / foundation

#### Feature: Testing & quality

- [ ] #1 Add unit test suite — Set up Vitest or Jest; add tests for lib (e.g. todos-kanban, analysis-prompt) and store
- [ ] #2 Add E2E tests for critical flows — Playwright for project detail, run script, Kanban load/sync

#### Feature: API security & validation

- [x] #3 Add request validation to API routes — Zod (or similar) for generate and data endpoints to avoid 500s on malformed input
- [x] #4 Document or add API authentication — Either document local-only usage or add auth for generate/data routes

### P1 — High / quality and maintainability

#### Feature: Resilience

- [ ] #5 Add React error boundaries — Catch component errors and show fallback UI so one throw does not blank the app
- [ ] #6 Add run history persistence — Persist run log/history (e.g. SQLite in Tauri; optional browser storage)

#### Feature: Project details & Kanban

- [ ] #7 Harden Kanban/JSON parsing for edge cases — Empty sections, malformed checklist lines, ensure parser matches prompt format
- [ ] #8 Ensure tickets.md/features.md load correctly on project detail — Reliable read from repo path; clear errors when missing

#### Feature: Data & configuration

- [x] #9 Show in-app warning when OPENAI_API_KEY is missing — On Configuration or before calling generate endpoints
- [ ] #10 Add project sync-from-disk or clarify source of truth — Sync local projects with projects.json/DB or document single source

#### Feature: UX & accessibility

- [ ] #11 Refactor project details page into smaller components — Split [id]/page.tsx for maintainability and testability
- [ ] #12 Add systematic accessibility (a11y) — ARIA, focus, keyboard beyond what Radix provides

### P2 — Medium / polish and scale

#### Feature: Run & automation

- [ ] #13 Add rate limiting or quota UI for generate endpoints — Throttle OpenAI calls or display usage
- [ ] #14 Improve feature queue UX — Clear feedback when queue advances or fails; optional retry

#### Feature: UX & accessibility

- [ ] #15 Refactor home page into smaller components — Split page.tsx to reduce size and improve testability

#### Feature: Data & configuration

- [ ] #16 Add seed-template UX improvements — Smoother flow for seeding from template (ideas, designs, architectures, features)

### P3 — Lower / later

#### Feature: Internationalization

- [ ] #17 Add i18n/locale layer — English + optional locales; translation keys for UI copy

#### Feature: Resilience

- [ ] #18 Add offline persistence story for browser mode — Service worker or local storage for data when dev server unavailable

## Next steps

1. Add unit test suite (Vitest/Jest) and cover at least lib and store (ticket #1).
2. Introduce request validation (Zod) on generate and data API routes (ticket #3).
3. Add React error boundaries around main layout and heavy pages (ticket #5).
4. Refactor project details page into smaller components (ticket #11).
5. Harden Kanban parsing and .md load on project detail (tickets #7, #8).
6. Backlog: E2E tests (#2), auth/docs (#4), run history (#6), OPENAI warning (#9), project sync (#10), a11y (#12), rate limiting (#13), feature queue UX (#14), home refactor (#15), seed UX (#16), i18n (#17), browser offline (#18).

*Based on codebase as of analysis. Update this file as work is completed or priorities change. Check off items with `[x]` when done.*
