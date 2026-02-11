# Work items (tickets) — KW-February-KWCode

**Project:** KW-February-KWCode
**Source:** Kanban
**Last updated:** 2026-02-11

---

## Summary: Done vs missing

### Done

| Area | What's implemented |
|------|--------------------|

### Missing or incomplete

| Area | Gap |

---

## Prioritized work items (tickets)

### P0 — Critical / foundation

#### Feature: Testing & quality

- [x] #1 Add unit test suite — Set up Vitest or Jest; add tests for lib (e.g. todos-kanban, analysis-prompt) and store
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

1. Add or update tickets in the Kanban.
