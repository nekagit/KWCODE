# Work items (tickets) — Webapp standard

**Project:** Webapp standard
**Source:** Kanban
**Last updated:** 2026-02-15

---

## Summary: Done vs missing

### Done

| Area | What's implemented |
|------|--------------------|
| (Template) | No tickets done by default; run Implement All per project to complete. |

### Missing or incomplete

| Area | Gap |
|------|-----|
| Foundation | Project setup, Supabase, Auth, design tokens |
| Data & API | Schema, RLS, Server Actions, types |
| Core UI | Dashboard, CRUD pages, forms, loading/error states |
| Quality | Tests, error boundaries, a11y, toasts |
| Production | Env validation, security, docs, deploy |

---

## Prioritized work items (tickets)

### P0 — Critical / foundation

#### Feature: Project setup

- [ ] #1 Add Next.js project with App Router — Create app with TypeScript, Tailwind, ESLint; App Router only
- [ ] #2 Configure Tailwind and base CSS — tailwind.config, globals.css, design tokens placeholder
- [ ] #3 Add shadcn/ui and Lucide icons — Install shadcn, add Button Card Input Label; add Lucide React
- [ ] #4 Add environment variable schema — .env.example and Zod or t3-env schema for required vars

#### Feature: Supabase & Auth

- [ ] #5 Create Supabase project and get keys — Dashboard: project URL and anon key; add to .env.local
- [ ] #6 Add Supabase client and server utilities — @supabase/supabase-js; createClient for browser and server
- [ ] #7 Enable Supabase Auth email/password — Auth settings; signUp and signIn with email/password
- [ ] #8 Add auth middleware or layout guard — Protect dashboard routes; redirect unauthenticated to login
- [ ] #9 Add login and register pages — Forms with email/password, validation, redirect after success
- [ ] #10 Add session provider and useSession hook — React context or Supabase auth state; expose user and loading

#### Feature: Design system

- [ ] #11 Define CSS variables for theme — Light/dark tokens: background, foreground, primary, muted, border, radius
- [ ] #12 Add root layout with theme and fonts — Root layout, optional ThemeProvider, font classes

### P1 — High / quality and maintainability

#### Feature: Database & RLS

- [ ] #13 Define core Supabase schema — Tables for main entities; migrations or SQL in docs
- [ ] #14 Add Row Level Security policies — RLS enabled; policies for select/insert/update/delete per role
- [ ] #15 Add TypeScript types for DB entities — Types matching Supabase schema; export from types/

#### Feature: Core API

- [ ] #16 Add Zod schemas for API input/output — One schema per entity create/update; infer TypeScript types
- [ ] #17 Implement Server Actions for main entity CRUD — Create, read, update, delete using Supabase client
- [ ] #18 Add standard API error and response helpers — { success, data, error } envelope; map Supabase errors
- [ ] #19 Add input validation in Server Actions — Parse and validate with Zod; return 400 on validation failure
- [ ] #20 Add server-side auth check in Server Actions — Get session; return 401 if not authenticated

#### Feature: Dashboard

- [ ] #21 Add dashboard layout and nav — Sidebar or top nav, active link styling, layout component
- [ ] #22 Add dashboard home page with placeholder sections — Welcome and 2–3 placeholder cards or sections

#### Feature: Core CRUD UI

- [ ] #23 Add main entity list page — Fetch list from Server Action; table or card list; loading state
- [ ] #24 Add main entity detail page — Dynamic route; fetch by id; show fields; 404 when not found
- [ ] #25 Add create entity form and Server Action — Form with validated fields; submit via Server Action; redirect on success
- [ ] #26 Add edit entity form and Server Action — Prefill from detail; update via Server Action; redirect or toast
- [ ] #27 Add delete with confirmation — Confirm dialog; delete Server Action; invalidate or redirect
- [ ] #28 Add loading skeletons for list and detail — Skeleton components for list and detail layout

#### Feature: Forms & validation

- [ ] #29 Add form error display and field-level errors — Show Zod errors next to fields and at form level
- [ ] #30 Add loading and disabled state on submit — Disable button, show spinner or text while submitting
- [ ] #31 Add client-side validation with Zod — Validate on blur or submit; same schema as server

### P2 — Medium / polish and scale

#### Feature: Error handling & UX

- [ ] #32 Add global error boundary — error.tsx or ErrorBoundary; fallback UI and optional log
- [ ] #33 Add toast notifications — Sonner or similar; success/error on mutations
- [ ] #34 Handle API errors in forms — Show toast or inline message from Server Action error
- [ ] #35 Add not-found page — not-found.tsx for 404

#### Feature: Testing

- [ ] #36 Set up Vitest for unit tests — Config, setup file; one smoke test for a util or component
- [ ] #37 Add unit tests for critical utils and validation — Test Zod schemas and one or two pure functions
- [ ] #38 Set up Playwright for E2E — Config; one smoke test (e.g. load home or login)
- [ ] #39 Add E2E test for main CRUD flow — Login, list, create or edit one entity, assert in UI

#### Feature: Accessibility

- [ ] #40 Add focus and keyboard support for main flows — Tab order, focus visible, Enter/Space for buttons
- [ ] #41 Add ARIA labels for icon-only buttons and forms — aria-label where needed; label associations
- [ ] #42 Verify responsive layout for mobile and desktop — Breakpoints for main pages; no horizontal scroll

### P3 — Lower / later

#### Feature: Documentation

- [ ] #43 Write README with quick start — Clone, install, env vars, run dev; link to Supabase and deploy
- [ ] #44 Document environment variables — List and describe each required env var
- [ ] #45 Add deployment section for Vercel and Supabase — Build command, env in Vercel; Supabase project link

#### Feature: Production readiness

- [ ] #46 Add env validation on app init — Fail fast if required env missing; use Zod or t3-env
- [ ] #47 Add security headers (CSP, X-Frame-Options) — next.config headers for production
- [ ] #48 Add production checklist to docs — Env, secrets, domain, RLS review, rate limits if any

---

## Next steps

1. Initialize the project so it gets this backlog in .cursor/planner/.
2. Move the first 1–3 tickets to In progress in the Kanban.
3. Open the Worker tab and click Implement All to run them.
4. Repeat by moving more tickets to In progress and running Implement All.
5. To run the same plan on multiple projects, open each project and run Implement All for the tickets you moved to In progress.
