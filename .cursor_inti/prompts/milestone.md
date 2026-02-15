# PROMPT: Milestone / phase — generate the right artifact for this phase

Use this prompt to generate or update the correct setup or planner artifact for a given **phase** of the standard webapp plan (Next.js, Tailwind CSS, Supabase). Read `.cursor/planner/project-plan.md` for the full plan.

---

## Standard stack (all phases)

- **Framework:** Next.js 16+ (App Router)
- **Styling:** Tailwind CSS 3, shadcn/ui, Lucide React
- **Database & Auth:** Supabase (PostgreSQL, Auth, optional Realtime)
- **Validation:** Zod
- **Language:** TypeScript

When you run any of the prompts below, assume this stack unless the project already uses something else (analyze the codebase first).

---

## Phase 1 — Foundation

**Goal:** Project setup, env, Supabase project, Auth, base layout, design tokens.

**Prompt to use:**  
- For **architecture** (structure, data flow, tech decisions): use **`.cursor/prompts/architecture.md`** → output **`.cursor/setup/architecture.md`**.  
- For **design** (tokens, components, layout): use **`.cursor/prompts/design.md`** → output **`.cursor/setup/design.md`**.

**Phase 1 context to paste when running the prompt:**

```
This project follows the standard webapp plan Phase 1: Next.js App Router, Tailwind, Supabase. We need:
- Architecture: Next.js server/client split, Supabase as backend, Server Actions or API routes, Auth flow.
- Design: CSS variables for theme (light/dark), base layout, typography and spacing scale, shadcn/ui usage.
```

**Tickets for this phase (from tickets.md):** #1–#12 (Project setup, Supabase & Auth, Design system).

---

## Phase 2 — Core data & API

**Goal:** Supabase schema, RLS, TypeScript types, Zod schemas, Server Actions, error envelope.

**Prompt to use:**  
- **`.cursor/prompts/architecture.md`** → output **`.cursor/setup/architecture.md`** (update with Supabase schema, RLS, Server Actions patterns).

**Phase 2 context to paste:**

```
Phase 2 of the webapp plan: Supabase schema and RLS, TypeScript types matching the schema, Zod for validation, Server Actions for CRUD. Standard response envelope: { success, data, error }. Document the data layer, API conventions, and auth checks in Server Actions.
```

**Tickets for this phase:** #13–#20 (Database & RLS, Core API).

---

## Phase 3 — Core UI

**Goal:** Main entity list/detail, forms, loading/error states, navigation.

**Prompt to use:**  
- **`.cursor/prompts/design.md`** → output **`.cursor/setup/design.md`** (component plan, pages, forms, loading states).  
- Optionally **`.cursor/prompts/tickets.md`** or **`.cursor/prompts/features.md`** if you are refining tickets/features for this phase.

**Phase 3 context to paste:**

```
Phase 3: Core UI for main entities. List page, detail page, create/edit forms with validation and loading states. Use shadcn/ui (Table, Card, Form, Button, Input). Document component hierarchy, form patterns, and loading/skeleton approach.
```

**Tickets for this phase:** #21–#31 (Dashboard, Core CRUD UI, Forms & validation).

---

## Phase 4 — Quality & polish

**Goal:** Unit tests, E2E tests, error boundaries, toasts, a11y, responsive.

**Prompt to use:**  
- **`.cursor/prompts/testing.md`** → output **`.cursor/setup/testing.md`** (strategy, Vitest, Playwright, a11y, error handling).

**Phase 4 context to paste:**

```
Phase 4: Testing and quality. Unit tests (Vitest) for utils and validation; E2E (Playwright) for critical flows (auth, main CRUD). Error boundaries and toasts. Accessibility (focus, ARIA, contrast) and responsive layout. Document testing philosophy and patterns.
```

**Tickets for this phase:** #32–#42 (Error handling & UX, Testing, Accessibility).

---

## Phase 5 — Production

**Goal:** Env validation, security headers, README, deploy steps, production checklist.

**Prompt to use:**  
- **`.cursor/prompts/documentation.md`** → output **`.cursor/setup/documentation.md`** (README, env docs, deploy, production checklist).

**Phase 5 context to paste:**

```
Phase 5: Production readiness. Environment variable validation at startup (Zod or t3-env). Security headers (CSP, X-Frame-Options). README with quick start and env vars. Deployment for Vercel + Supabase. Production checklist (env, secrets, domain, RLS).
```

**Tickets for this phase:** #43–#48 (Documentation, Production readiness).

---

## How to use

1. Choose the **phase** (1–5) you are working on.
2. Open the **prompt file** indicated for that phase (e.g. `architecture.md`, `design.md`, `testing.md`, `documentation.md`).
3. Paste the **phase context** above into the prompt (or into Cursor) so the AI has the stack and focus.
4. Run the prompt; it will generate or update the artifact in `.cursor/setup/` (or `.cursor/planner/` if you use tickets/features).
5. To generate **tickets** or **features** for a phase, use **`.cursor/prompts/tickets.md`** or **`.cursor/prompts/features.md`** and reference the phase and ticket numbers from `.cursor/planner/tickets.md` and `project-plan.md`.

---

## Quick reference: phase → prompt → output

| Phase | Prompt | Output |
|-------|--------|--------|
| 1 — Foundation | architecture.md, design.md | .cursor/setup/architecture.md, design.md |
| 2 — Data & API | architecture.md | .cursor/setup/architecture.md (schema, RLS, Server Actions) |
| 3 — Core UI | design.md | .cursor/setup/design.md (components, forms, pages) |
| 4 — Quality | testing.md | .cursor/setup/testing.md |
| 5 — Production | documentation.md | .cursor/setup/documentation.md |
