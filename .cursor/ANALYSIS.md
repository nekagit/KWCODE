# Project analysis

## Current state

The project is a **Next.js 15** frontend with a **Tauri 2** desktop backend, acting as a control panel for running prompt automation across multiple Cursor projects. The app is structured as a single-page-style dashboard (home at `/` with tabbed sections) plus dedicated routes for Projects, Run, Prompts, Ideas, Design, Architecture, and Configuration. Data lives in JSON files under `data/` when running in browser mode, and in a **SQLite** database (`data/app.db`) when running in Tauri; the frontend uses Next.js API routes for browser and Tauri `invoke()` for desktop. Main entry points: root layout (`src/app/layout.tsx`), home page (`src/app/page.tsx`), and Tauri backend (`src-tauri/src/lib.rs`).

## Architecture

- **Patterns in use**: Layered (UI → API / Tauri invoke → data), **REST**-style API for data and generation (`/api/data/*`, `/api/generate-*`), **dry** (shared types in `src/types/`, libs in `src/lib/`), **kiss** (simple file/DB reads, no heavy abstraction).
- **Categories that apply**: `rest`, `dry`, `kiss`, `solid` (moderate: separation of pages, components, lib, store). No DDD, CQRS, event sourcing, or microservices; single app with optional desktop shell.
- **Suggestion**: The codebase fits a **thin layered + REST** style. For future scaling, consider a clearer **hexagonal** boundary (e.g. ports for “load projects”, “run script”) so UI and Tauri both depend on the same abstractions.

## Design

- **Pages**: Dashboard (tabs: dashboard, tickets, feature, projects, prompts, all data, data, log), Run, Projects (list + new + detail/edit), Prompts, Ideas, Design, Architecture, Configuration.
- **Layout**: Fixed sidebar (`AppShell`), main content area, optional top-right “running terminals” popover. Root loading overlay for initial hydration.
- **Components**: Radix-based UI primitives under `src/components/ui/` (accordion, alert, badge, button, card, checkbox, dialog, dropdown, input, label, popover, progress, scroll-area, select, separator, skeleton, switch, table, tabs, textarea, tooltip), plus `AppShell`, `RootLoadingOverlay`, `TicketsDataTable`, `Empty`.
- **Design system**: Tailwind with CSS variables in `globals.css` (e.g. `--background`, `--foreground`, `--primary`, `--radius`). Light/dark via `.dark` class. Semantic tokens (background, card, muted, destructive, border). No separate design doc; the “Design” page is for configuring page layout/colors/sections and exporting markdown/HTML.

## Features implemented

- **Dashboard**: Tabbed home with quick actions, ticket kanban (backlog / in progress / done / blocked), prompts selection, active repos.
- **Tickets**: CRUD, status/priority, drag-and-drop between columns; add-ticket accordion; AI generate from project or from uploaded/pasted files (PDF/text).
- **Features**: Define features (title, tickets, prompts, projects); run single feature or queue; filter by project; delete all.
- **Run**: Select prompts and projects, run script (Tauri), view log; feature-based run with optional queue.
- **Projects**: List from `data/projects.json` (or Tauri); create from template/idea; local “from path”; delete; detail page with accordions (prompts, tickets, features, ideas, design, architecture, spec, Cursor files).
- **Project detail**: Link entities (prompts, tickets, features, ideas, designs, architectures); categorizations (phase, step, etc.); export spec (markdown); “best practice” Cursor structure; analysis prompt for Cursor.
- **Prompts**: Full CRUD via API; table view; AI generate prompt from description.
- **Ideas**: CRUD; categories (saas, iaas, paas, website, etc.); AI generate ideas; create project from idea.
- **Design**: Config (sections, colors, typography); generate markdown/HTML; save to library; AI generate design from description.
- **Architecture**: CRUD architecture records (name, description, category, practices, scenarios); categories (ddd, clean, hexagonal, rest, etc.); AI generate; filter by category.
- **Configuration**: Timing params for run (sleeps between steps).
- **Data tab**: Scripts list, JSON files list, KV/tickets/features dump (Tauri: SQLite; browser: read-only from API).
- **All data tab**: Combined view of projects, prompts, tickets, features, ideas, design.
- **Seed template**: API and UI to seed a new project from template (ideas, designs, architectures, features with tickets).

## Missing or incomplete features

- **Automated tests**: No `*.test.*` or `*.spec.*` files; no Jest/Vitest/Playwright setup. Regression and refactors are untested.
- **API authentication**: All `/api/*` and generate endpoints are unauthenticated; fine for local use, unsafe if ever exposed.
- **Error boundaries**: No React error boundaries; a single component throw can blank the app.
- **Offline / persistence**: Browser mode depends on dev server and `data/*.json`; no service worker or local persistence story.
- **Rate limiting**: Generate endpoints (tickets, prompts, ideas, design, architectures) call OpenAI with no rate limiting or quota UI.
- **Validation**: Request bodies for API routes are not strictly validated (e.g. Zod); malformed input can cause 500s.
- **Accessibility**: No systematic a11y (ARIA, focus, keyboard) beyond what Radix provides.
- **Project sync**: Projects list is loaded from one source; “local projects” vs `projects.json` can get out of sync; no explicit sync-from-disk.
- **Run history**: Log is in-memory per run; no persisted history or search.
- **i18n**: All copy is English only; no locale/translation layer.

## Errors and risks

| Severity  | Message | Location |
|-----------|--------|----------|
| error     | No test suite; refactors and regressions are untested. | Project root (no test config or files) |
| error     | Generate and data API routes have no authentication; unsafe if deployed. | `src/app/api/` |
| warning   | Home page is a very large single component (~1100 lines); hard to maintain and test. | `src/app/page.tsx` |
| warning   | Duplicate Tauri/browser data paths (JSON vs SQLite) and fallbacks; easy to diverge behavior. | `src/store/run-store.ts`, `src/app/page.tsx`, `/api/data/route.ts` |
| warning   | No request validation on API routes; invalid body can cause unhandled errors. | e.g. `src/app/api/generate-tickets/route.ts`, other generate routes |
| warning   | OPENAI_API_KEY required for AI features; no in-app warning when missing. | Generate routes, e.g. `src/app/api/generate-tickets/route.ts` |
| info      | `dangerouslySetInnerHTML` used for critical CSS in layout; ensure content is static. | `src/app/layout.tsx` |
| info      | Some state (e.g. tickets, features on home) is duplicated between page state and run store. | `src/app/page.tsx` |
| info      | Tailwind content paths include `src/pages` but app uses App Router only; redundant. | `tailwind.config.ts` |
