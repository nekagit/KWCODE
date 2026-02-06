# Work Items (Tickets) — automated_development

**Project:** automated_development  
**Scope:** Next.js 15 + Tauri 2 control panel for prompt automation across Cursor projects.  
**Last updated:** From codebase analysis.

---

## What Is Done

- **Dashboard (home):** Tabbed UI (dashboard, tickets, feature, projects, prompts, all data, data, log); quick actions; ticket kanban (backlog / in progress / done / blocked) with drag-and-drop.
- **Tickets:** CRUD, status/priority, add-ticket accordion, AI generate from project or files (PDF/text), `TicketsDataTable` with pagination.
- **Features:** Define features (tickets + prompts + projects); run single or queue; filter by project; delete all; “Add to queue” / “Run queue”.
- **Run:** Run page + in-dashboard run; select prompts/projects; Tauri script execution; live log; feature-based run and queue.
- **Projects:** List (API + Tauri); create from template/idea or from path; detail page with accordions (prompts, tickets, features, ideas, design, architecture, spec, Cursor files); export spec (markdown); best-practice Cursor structure; analysis prompt for Cursor.
- **Prompts / Ideas / Design / Architecture:** Full CRUD via API; AI generate (tickets, prompts, ideas, design, architectures); design config → markdown/HTML.
- **Configuration:** Timing params for run (sleeps between steps).
- **Data tab:** Scripts list, JSON files list, KV/tickets/features dump (Tauri: SQLite; browser: read from API).
- **All data tab:** Combined view of projects, prompts, tickets, features, ideas, design.
- **Seed template:** API and UI to seed a new project from template (ideas, designs, architectures, features with tickets).
- **Backend:** Tauri 2 (Rust) with SQLite (`data/app.db`), migration from `data/*.json`; run script spawning; file read; project analysis for AI tickets.
- **Data layer:** REST-style `/api/data/*` and generate routes; browser uses JSON from API; Tauri uses DB; run store (Zustand) for projects, prompts, timing, runs, feature queue.

---

## What Is Missing or Incomplete

| Area | Gap |
|------|-----|
| **Testing** | No test suite (no Jest/Vitest/Playwright); no `*.test.*` / `*.spec.*`; refactors and regressions are untested. |
| **Security** | API routes (data + generate) have no authentication; fine for local, unsafe if exposed. |
| **Resilience** | No React error boundaries; a single component throw can blank the app. |
| **Validation** | Request bodies on API routes are not validated (e.g. Zod); malformed input can cause 500s. |
| **UX / AI** | No in-app warning when `OPENAI_API_KEY` is missing for generate features. |
| **Maintainability** | Home page (`src/app/page.tsx`) is ~1100 lines; hard to maintain and test. |
| **Data consistency** | Tauri (SQLite) vs browser (JSON) and duplicate state (tickets/features on home vs store) can diverge; no single “data adapter” abstraction. |
| **Run history** | Log is in-memory per run; no persisted history or search. |
| **Project sync** | “Local projects” vs `projects.json` can get out of sync; no explicit sync-from-disk. |
| **Config cleanup** | `tailwind.config.ts` includes `./src/pages/**/*` but app uses App Router only (no `src/pages`). |
| **Accessibility** | No systematic a11y beyond what Radix provides (ARIA, focus, keyboard). |
| **i18n** | All copy is English only; no locale/translation layer. |

---

## Prioritized Suggested Tasks

### P0 — Critical (quality / safety)

1. **Add request validation to API routes**  
   Validate request bodies (e.g. Zod) on all generate and mutation routes; return 400 with clear message on failure. Start with `generate-tickets`, then other generate routes and data POST/PUT.

2. **Surface OPENAI_API_KEY missing in UI**  
   In generate handlers, check for key and return 503/400 with a clear message; show a banner or toast in UI when AI features are used and key is missing.

3. **Add a test suite**  
   Introduce Vitest (or Jest) + React Testing Library for unit/component tests; add Playwright for E2E. Start with `src/lib/` and `src/store/run-store.ts`, then critical UI paths.

### P1 — High (maintainability / robustness)

4. **Split home page into smaller components/hooks**  
   Extract from `src/app/page.tsx`: e.g. `TicketBoard`, `FeatureList`, `DataTab`, `AllDataTab`, `TicketsTab`, and shared hooks for tickets/features loading and mutations. Keep the page as composition to improve maintainability and testability.

5. **Add React error boundaries**  
   Wrap app shell and/or key route segments so a single component error does not blank the whole app; show a fallback UI and optional recovery.

6. **Document or unify Tauri vs browser data behavior**  
   Clearly document when data comes from SQLite vs JSON and the fallbacks; optionally introduce a small “data adapter” so the UI talks to one interface and both backends implement it.

### P2 — Medium (UX / data / hygiene)

7. **Persist run log history**  
   Persist run logs (e.g. in SQLite or JSON) with run id, label, timestamp; add a simple “Run history” view with search/filter.

8. **Project list sync**  
   Add an explicit “Sync from disk” or “Refresh projects” that reconciles local paths with `projects.json` / DB and surfaces conflicts or stale entries.

9. **Remove redundant Tailwind content path**  
   Remove `./src/pages/**/*` from `tailwind.config.ts` content array if no `src/pages` is used.

10. **Single source for tickets/features on dashboard**  
    Prefer loading tickets/features once (e.g. from store or a shared hook) and passing down to dashboard tabs to avoid duplicate state and sync bugs.

### P3 — Lower (nice-to-have)

11. **API authentication (if ever deployed)**  
    If the app is deployed beyond localhost, add auth (e.g. API key or session) for `/api/*` and document “local only” otherwise.

12. **Accessibility pass**  
    Audit and improve ARIA, focus order, and keyboard navigation for main flows (dashboard, run, project detail).

13. **i18n foundation**  
    Add a minimal locale/translation layer and extract main copy so future localization is possible.

---

## Next Steps

1. **Immediate:** Implement **request validation** (P0) and **OPENAI_API_KEY feedback** (P0) — small, high-impact changes.
2. **Short term:** Add **Vitest + RTL** and a few tests for `run-store` and one generate route (P0); then **split home page** (P1) so new work is easier.
3. **Then:** Add **error boundaries** (P1) and **run log persistence** (P2) for a better operational story.
4. **Backlog:** P2/P3 items (sync, Tailwind cleanup, single source for tickets/features, auth if needed, a11y, i18n) as capacity allows.

---

*Generated from codebase analysis. See also `.cursor/ANALYSIS.md`, `.cursor/errors.md`, and `.cursor/adr/` for architecture and past decisions.*
