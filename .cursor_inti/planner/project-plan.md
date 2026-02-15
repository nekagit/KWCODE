# Webapp project plan — Next.js, Tailwind CSS, Supabase

**Stack:** Next.js (App Router), Tailwind CSS, Supabase (auth, database, realtime), shadcn/ui, Zod, TypeScript.

This document defines the standard phases and steps for every webapp. The exact backlog (tickets and features) lives in `tickets.md` and `features.md` in this folder. When you **Initialize** a new project, this folder is copied as `.cursor`, so every project gets this plan and backlog by default.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16+ (App Router) |
| Styling | Tailwind CSS 3, shadcn/ui (Radix), Lucide React |
| Database & Auth | Supabase (PostgreSQL, Auth, optional Realtime) |
| Validation | Zod |
| Language | TypeScript |

---

## Phases and milestones

### Phase 1 — Foundation

- Project setup (Next.js, Tailwind, TypeScript, ESLint).
- Environment variables and Supabase project creation.
- Supabase Auth (email/password; optional social providers).
- Base layout (root layout, optional dashboard shell).
- Design tokens and theme (CSS variables, light/dark).

**Features:** Project setup, Supabase & Auth, Design system (tokens).

**Tickets:** See `tickets.md` under P0 and features: Project setup, Supabase & Auth, Design system.

---

### Phase 2 — Core data & API

- Supabase schema (tables, RLS policies).
- TypeScript types and Zod schemas for core entities.
- Server Actions or API routes for CRUD.
- Error handling and response envelope (`{ success, data, error }`).

**Features:** Core API, Database & RLS.

**Tickets:** See `tickets.md` under P0/P1 for Core API, Database & RLS.

---

### Phase 3 — Core UI

- Main entity list and detail pages.
- Forms (create/edit) with validation and loading states.
- Loading and error states (skeletons, toasts, error boundaries).
- Navigation and routing for core flows.

**Features:** Dashboard, Core CRUD UI, Forms & validation.

**Tickets:** See `tickets.md` under P1 for Dashboard, Core CRUD UI, Forms & validation.

---

### Phase 4 — Quality & polish

- Unit tests (Vitest or Jest) for critical logic.
- E2E tests (Playwright) for critical flows.
- Error boundaries and global error handling.
- Accessibility (a11y) and responsive layout.
- Toasts/notifications for user feedback.

**Features:** Testing, Error handling & UX, Accessibility.

**Tickets:** See `tickets.md` under P2 for Testing, Error handling, Accessibility.

---

### Phase 5 — Production

- Environment variable validation (e.g. Zod or t3-env) at startup.
- Security (CSP headers, rate limiting if needed).
- README and deployment steps (e.g. Vercel + Supabase).
- Production checklist (env, secrets, domain).

**Features:** Documentation, Production readiness.

**Tickets:** See `tickets.md` under P3 for Documentation, Production readiness.

---

## Phase → features → tickets

| Phase | Features | Ticket numbers (see tickets.md) |
|-------|----------|----------------------------------|
| 1 — Foundation | Project setup, Supabase & Auth, Design system | #1–#12 |
| 2 — Data & API | Core API, Database & RLS | #13–#20 |
| 3 — Core UI | Dashboard, Core CRUD UI, Forms & validation | #21–#31 |
| 4 — Quality | Testing, Error handling & UX, Accessibility | #33–#42 |
| 5 — Production | Documentation, Production readiness | #43–#48 |

Exact ticket numbers and titles are in `tickets.md`. Feature names and ticket refs are in `features.md`.

---

## Run for all projects

- **Create for all projects:** Every project that is **Initialized** gets this plan and the same backlog (from `tickets.md` and `features.md`). No extra step needed.
- **Run (Implement All) per project:** Open the project → **Todos** tab → move the desired tickets to **In progress** → open **Worker** tab → click **Implement All**. The Worker runs up to 3 in-progress tickets per project using `.cursor/prompts/worker.md` and per-ticket agents.
- **Run the standard plan on multiple projects:** Repeat the above for each project (open project, move tickets to In progress, run Implement All). A future enhancement may add a single “Run standard plan for all active projects” action that runs Implement All for each active project in sequence.

---

## Milestone prompts

Use the prompts in `.cursor/prompts/` to generate or update artifacts for each phase:

- **Phase 1:** `milestone.md` (Phase 1) or `architecture.md` / `design.md` for initial setup and tokens.
- **Phase 2:** `architecture.md` (Supabase schema, RLS, Server Actions).
- **Phase 3:** `design.md` (component plan, pages, forms).
- **Phase 4:** `testing.md` (strategy, unit/E2E, a11y).
- **Phase 5:** `documentation.md` (README, deploy, production checklist).

The single entry point is `prompts/milestone.md`: pass the phase number or name to get the right prompt and output path for that milestone.
