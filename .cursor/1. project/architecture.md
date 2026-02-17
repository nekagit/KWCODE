# Architecture — KWCode

**Version**: 1.0  
**Last Updated**: 2025-02-17  
**Author**: Principal Software Architect (AI)

---

## Architecture Analysis

**Framework & runtime**: Next.js 16 (App Router) with React 18. Build can target browser (dev server or static export) or Tauri v2 desktop shell (static export loaded in WebView).

**Frontend architecture**: App Router with thin server page components that delegate to client organisms (`'use client'`). Most UI is client-rendered; no Server Components for data-heavy pages—pages are wrappers that dynamic-import organism content. Data is fetched client-side via `fetch()` to `/api/*` or, in Tauri, via `invoke()` to Rust commands.

**Backend architecture**: Monolithic within the process: Next.js API routes under `app/api/` (REST-style). No separate BFF or microservices. In browser mode the Next server handles API + static; in Tauri the frontend talks to Rust (rusqlite + file I/O) with no Next server for production build.

**Database & storage**: Hybrid. **File-based**: `data/projects.json` for project list and metadata (read/write via API or Tauri). **SQLite**: `data/app.db` (better-sqlite3 in Node, rusqlite in Tauri) for `plan_tickets`, `plan_kanban_state`, `milestones`, `ideas`, `implementation_log`. Migrations run on first `getDb()` or Tauri DB open. Additional JSON files in `data/` for prompts, designs, etc., when used from Next.

**State management**: **Zustand** (`store/run-store.ts`) for run/terminal state, projects list, prompts, timing, floating terminal. **React Context** for UI theme (`context/ui-theme.tsx`) and quick actions (`context/quick-actions-context.tsx`). Local component state and URL (route params) for the rest. No Redux, Jotai, or React Query/SWR.

**Data fetching**: Client-side `fetch()` to `/api/data/*` and `/api/generate-*`. **Abstraction**: `lib/api-projects.ts` and `lib/tauri.ts`—when `isTauri` is true, project CRUD and file read/write use Tauri `invoke()`; otherwise same API via fetch. No server-side data fetching in page components (no async Server Components loading DB).

**Authentication/authorization**: None. No NextAuth, no middleware protecting routes, no user/session model. App is single-user/local workflow tool.

**File structure philosophy**: Feature-oriented with atomic design in `components/`: `ui/` (primitives), `atoms/`, `molecules/`, `organisms/`, `shared/`. Domain logic and API access in `lib/`; types in `types/`; static data/templates in `data/`. App Router drives routes under `app/`.

**Architectural style**: **Layered + modular**: UI → hooks/context/store → lib (API/DB/tauri) → types. **Dual-backend**: Single frontend, two backends (Next.js API + file/SQLite vs Tauri Rust + rusqlite/files) chosen at runtime via `isTauri`. **No Clean/Hexagonal**—lib layer is the boundary; no formal ports/adapters. **No CQRS or event-driven**; request/response only.

**Data flow**: Client components call `listProjects()` / `getProjectResolved()` etc. from `lib/api-projects.ts` → either `invoke('list_projects')` (Tauri) or `fetch('/api/data/projects')` (browser). API routes read/write `data/projects.json` and `getDb()` for SQLite. Run/terminal state lives in Zustand and is updated by Tauri events or refresh calls. No real-time (no WebSockets/SSE); polling/refetch on user action.

**Integration points**: Tauri (Rust) for desktop: file system, shell/terminal, dialog, SQLite. Optional external: analyze/agent endpoints (e.g. analyze-project-doc). No third-party auth, payment, or email services. Theme and config are local (localStorage, `data/`).

---

## 1. Architecture Overview

### A. Architectural Style

- **Layered architecture** — Presentation (components) → state/hooks (Zustand, Context) → application/business (lib: api-projects, run-store actions) → data access (API routes, getDb(), Tauri invoke). Dependencies point inward; types and constants are shared.
- **Modular monolith** — Single deployable (Next app or Tauri bundle) with clear modules: projects, ideas, tickets, run/worker, technologies, configuration. No service boundaries; shared DB and file storage.
- **Dual-backend / platform abstraction** — One frontend codebase; backend is either Next.js API + Node (file + better-sqlite3) or Tauri Rust (file + rusqlite). Abstraction in `lib/tauri.ts` and `lib/api-projects.ts` (and run-store) so UI does not branch on platform except where necessary (e.g. client-side navigation in Tauri per ADR 0067).
- **Atomic design (UI)** — Components organized as atoms, molecules, organisms, plus shared and ui; see §6.

Not used: Clean/Hexagonal (no formal ports/adapters), CQRS, event-driven, microservices, GraphQL/tRPC.

### B. High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BROWSER / TAURI WEBVIEW                            │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │              React Components (App Router + Client UI)                 │ │
│  │  - app/page.tsx → HomePageContent, app/projects/page.tsx → …           │ │
│  │  - organisms, molecules, atoms, shared, ui (shadcn)                    │ │
│  │  - Client state: Zustand (run-store), Context (theme, quick-actions)    │ │
│  └───────────────────┬────────────────────────────────────────────────────┘ │
│                      │ fetch() to /api/*  OR  invoke() (Tauri only)        │
└──────────────────────┼─────────────────────────────────────────────────────┘
                       │
     ┌─────────────────┴─────────────────┐
     │  Browser: Next.js server (dev)     │  Tauri: Rust backend only
     │  OR static export (no server)     │  (no Next in production build)
     └─────────────────┬─────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────────────────┐
│  BROWSER: Next.js API (app/api/)          │  TAURI: Rust (src-tauri/src/lib.rs)│
│  - GET/POST /api/data/projects            │  - list_projects, get_project_    │
│  - /api/data/projects/[id], tickets, …     │    resolved, create_project, …   │
│  - /api/data/ideas, technologies, …       │  - read_file_text_under_root,    │
│  - /api/generate-ideas, analyze-project-doc│    write_spec_file, list_files_   │
│  - Validation: lib/api-validation (Zod)   │  - run_script, run_implement_all, │
│  - Data: getDb() (better-sqlite3),        │    run_run_terminal_agent, …      │
│    data/projects.json, data/*.json         │  - rusqlite, file I/O             │
└──────────────────────┬───────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────────────────┐
│                         DATA LAYER                                           │
│  - data/projects.json (project list + metadata)                              │
│  - data/app.db (SQLite: plan_tickets, plan_kanban_state, milestones, ideas,   │
│                 implementation_log)                                         │
│  - data/*.json (prompts, designs, etc. when used from Next)                   │
│  - Project repos: .cursor/* files (read/write via API or Tauri)              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### C. Guiding Architectural Principles

1. **Single codebase, dual backend** — One React app; backend is either Next.js API or Tauri Rust. Platform is detected at runtime (`isTauri`); data access is abstracted in `lib/api-projects.ts` and run-store so UI stays agnostic where possible.

2. **Types and validation at the boundary** — All API request bodies validated with Zod (`lib/api-validation.ts`). Types live in `types/`; API and DB shapes are explicit. No `any` for request/response.

3. **Thin pages, fat organisms** — App Router pages are minimal: they render a single organism (e.g. `ProjectsListPageContent`). Data loading and interaction live in client organisms or their children.

4. **File and SQLite as canonical store** — Projects list and metadata in `data/projects.json`; tickets, ideas, milestones, implementation log in SQLite. Same logical data in Tauri (Rust) and Next (Node) so behavior is consistent in browser and desktop.

5. **Run/terminal state in one store** — All run/worker/terminal UI state (running runs, slots, floating terminal, prompts, active projects) lives in Zustand (`run-store`). No duplicate run state in Context or props.

6. **Client-side navigation in Tauri** — In desktop build, project links use client-side `router.push()` (with `preventDefault` on Link) so the single static route for `projects/[id]` is used correctly (ADR 0067).

7. **No server-side auth** — App is a local workflow tool; no user accounts or route protection. Security is “whoever can run the app / access the data dir.”

### D. Architectural Categories

- [x] REST API (Next.js routes under `/api/data/*`, `/api/generate-*`)
- [ ] GraphQL
- [ ] tRPC
- [ ] Serverless (single Node/Tauri process)
- [x] Monolithic
- [ ] Microservices
- [ ] Event-Driven
- [ ] CQRS
- [ ] Domain-Driven Design (structure is feature/module, not DDD aggregates)
- [ ] Clean Architecture (layered but no formal ports/adapters)
- [x] Layered Architecture
- [x] Modular Architecture
- [x] Feature-oriented + Atomic (UI)
- [ ] Offline-First (desktop can work offline; browser expects dev server or static + API)
- [ ] Real-Time (no WebSockets/SSE)

---

## 2. Directory Structure & Module Boundaries

### A. Complete Directory Tree

```
src/
├── app/                                    # Next.js App Router
│   ├── api/                                # API routes (REST)
│   │   ├── data/                           # Data CRUD and file access
│   │   │   ├── route.ts                    # Aggregate /api/data (projects, prompts, etc.)
│   │   │   ├── file/route.ts
│   │   │   ├── cursor-doc/route.ts
│   │   │   ├── cursor-init-template/route.ts
│   │   │   ├── february-folders/route.ts
│   │   │   ├── files/route.ts
│   │   │   ├── ideas/route.ts, ideas-doc/route.ts
│   │   │   ├── ideas/[id]/route.ts
│   │   │   ├── prompts/route.ts, prompts/[id]/route.ts
│   │   │   ├── projects/route.ts
│   │   │   ├── projects/[id]/route.ts
│   │   │   ├── projects/[id]/file/route.ts, files/route.ts
│   │   │   ├── projects/[id]/tickets/route.ts, tickets/[ticketId]/route.ts
│   │   │   ├── projects/[id]/milestones/route.ts, milestones/[milestoneId]/route.ts
│   │   │   ├── projects/[id]/kanban-state/route.ts
│   │   │   ├── projects/[id]/improve-idea/route.ts
│   │   │   ├── projects/[id]/implementation-log/route.ts, .../entryId/route.ts
│   │   │   ├── projects/[id]/export/route.ts
│   │   │   ├── technologies/route.ts
│   │   │   ├── dashboard-metrics/route.ts
│   │   │   ├── cursor-prompt-files/route.ts
│   │   │   ├── seed-template/route.ts
│   │   │   └── ...
│   │   ├── generate-ideas/route.ts
│   │   ├── generate-architectures/route.ts
│   │   ├── generate-prompt/route.ts
│   │   ├── generate-project-from-idea/route.ts
│   │   ├── generate-ticket-from-prompt/route.ts
│   │   ├── analyze-project-doc/route.ts
│   │   └── clean-analysis-docs/route.ts
│   ├── projects/page.tsx                   # Projects list (server page → organism)
│   ├── projects/[id]/page.tsx              # Project detail (dynamic, client organism)
│   ├── ideas/page.tsx
│   ├── technologies/page.tsx
│   ├── layout.tsx                           # Root layout, providers, Toaster
│   ├── page.tsx                             # Home
│   ├── globals.css
│   ├── error.tsx
│   └── global-error.tsx
├── components/
│   ├── ui/                                 # Primitives (shadcn/ui, Radix)
│   │   ├── button.tsx, card.tsx, dialog.tsx, tabs.tsx, input.tsx, label.tsx, ...
│   │   └── (Tailwind + CVA, no business logic)
│   ├── atoms/                              # Small building blocks
│   │   ├── list-items/                     # ProjectIdeaListItem, PromptTableRow, ...
│   │   └── forms/                          # GenerateKanbanPromptSection, ...
│   ├── molecules/                          # Compound components
│   │   ├── DashboardsAndViews/             # DashboardOverview, DashboardTabContent
│   │   ├── TabAndContentSections/         # Project*Tab, SetupDocBlock, ...
│   │   ├── FormsAndDialogs/               # NewProjectForm, ConvertToTicketsDialog, ...
│   │   ├── ListsAndTables/                 # LocalReposSection, CursorPromptFilesTable, ...
│   │   ├── CardsAndDisplay/               # IdeasDocAccordion, NoProjectsFoundCard, ...
│   │   ├── Kanban/                         # KanbanColumnCard, KanbanTicketCard
│   │   ├── LayoutAndNavigation/            # ProjectsHeader, TicketBoardLayout, ...
│   │   ├── ControlsAndButtons/             # RunControls, AnalyzeButtonSplit, ...
│   │   └── ...
│   ├── organisms/                          # Feature-level containers
│   │   ├── ProjectsListPageContent.tsx
│   │   ├── ProjectDetailsPageContent.tsx
│   │   ├── HomePageContent.tsx, IdeasPageContent.tsx, TechnologiesPageContent.tsx
│   │   ├── SidebarNavigation.tsx, QuickActions.tsx
│   │   ├── TicketBoard.tsx, ThreeTabResourcePageContent.tsx
│   │   └── ...
│   ├── shared/                             # Cross-cutting UI
│   │   ├── ErrorDisplay.tsx, Dialog.tsx, DisplayPrimitives.tsx
│   │   ├── TerminalSlot.tsx, TerminalRunDock.tsx, FloatingTerminalDialog.tsx
│   │   └── shared-design.css
│   ├── app-shell.tsx
│   ├── ErrorBoundary.tsx
│   └── root-loading-overlay.tsx
├── lib/                                    # Core logic, API, DB, platform
│   ├── db.ts                               # SQLite (better-sqlite3), getDb(), migrations
│   ├── tauri.ts                            # isTauri, invoke(), listen(), showOpenDirectoryDialog
│   ├── noop-tauri-api.ts                   # No-op invoke/listen/open when !isTauri
│   ├── api-projects.ts                     # listProjects, getProjectResolved, createProject, ...
│   ├── api-validation.ts                   # Zod schemas, parseAndValidate()
│   ├── cursor-paths.ts, run-helpers.ts, utils.ts
│   ├── file-tree-utils.ts, architecture-to-markdown.ts, design-to-markdown.ts
│   ├── agent-runner.ts, analysis-prompt.ts, cursor-best-practice.ts
│   ├── initialization-templates.ts, proxy.ts
│   └── ...
├── types/                                  # TypeScript types
│   ├── project.ts, ticket.ts, idea.ts, milestone.ts, run.ts
│   ├── architecture.ts, design.ts, prompt.ts, dashboard.ts, analysis.ts
│   ├── file-tree.ts, setup-json.ts, git.ts
│   └── tauri-api.d.ts
├── store/
│   ├── run-store.ts                        # Zustand: run/terminal state, actions
│   └── run-store-hydration.tsx            # Hydrates run store after mount
├── context/
│   ├── ui-theme.tsx                        # UIThemeProvider (theme id, setTheme)
│   ├── quick-actions-context.tsx           # QuickActionsProvider
│   └── run-state.tsx                       # (legacy bridge to run-store if needed)
├── data/                                   # Static config and templates
│   ├── ui-theme-templates.ts               # Theme definitions, CSS variables
│   ├── february-repos-overview.ts
│   ├── architecture-templates.ts, design-templates.ts
│   ├── template-ideas.ts, test-templates.ts, test-best-practices.ts
│   └── ...
└── (no middleware.ts in src; no Next.js auth middleware)
```

**Purpose and rules:**

| Folder | Purpose | What goes here | What does NOT go here |
|--------|---------|----------------|------------------------|
| `app/` | Routes and API | Pages (thin), layout, API handlers, error/global-error | Business logic, heavy components |
| `app/api/` | REST endpoints | Request handling, validation, DB/file access | UI, store, hooks |
| `components/ui/` | Primitives | Buttons, inputs, cards, dialogs (shadcn style) | Domain logic, fetch |
| `components/atoms/` | Small UI units | List items, form segments, badges | Full pages, API calls |
| `components/molecules/` | Composed UI | Tabs, forms, tables, Kanban columns | Page-level layout |
| `components/organisms/` | Feature blocks | Page content components, nav, ticket board | Pure presentational only |
| `components/shared/` | Shared utilities | Error display, terminal dock, design CSS | Feature-specific UI |
| `lib/` | Core and I/O | DB, API client, Tauri bridge, validation, helpers | React components, store |
| `types/` | Type definitions | Interfaces, type aliases for domain and API | Implementation |
| `store/` | Global client state | Zustand stores | Server-only code |
| `context/` | React Context | Theme, quick actions | Heavy state (use store) |
| `data/` | Static data | Theme templates, test data, constants | Runtime DB |

**Import restrictions:**  
- `types/` must not import from `components/` or `app/`.  
- `lib/` must not import from `components/` or `app/`.  
- `store/` and `context/` can import from `lib/` and `types/`; avoid importing from `app/` except for routing types if needed.  
- No circular dependencies between features.

### B. Module Boundaries & Dependency Rules

```
components/ (UI)
    ↓ CAN import
store/, context/, lib/, types/, data/

lib/
    ↓ CAN import
types/, data/ (and Node/tauri APIs)

types/
    ↓ CAN import
(nothing project-internal; only standard/third-party types)

store/, context/
    ↓ CAN import
lib/, types/
```

**Forbidden:**  
- `types/` → `components/`, `lib/`, `app/`  
- `lib/` → `components/`, `app/`  
- Circular dependencies

**Enforcement:** Use ESLint `import/no-restricted-paths` if desired; document exceptions (e.g. `run-store` importing `@/lib/tauri`).

### C. Naming Conventions

**Files:**  
- Pages/routes: `page.tsx`, `layout.tsx`, `route.ts` (App Router convention).  
- Components: `PascalCase.tsx` (e.g. `ProjectDetailsPageContent.tsx`, `DashboardOverview.tsx`).  
- Utilities/config: `kebab-case.ts` (e.g. `api-projects.ts`, `run-helpers.ts`).  
- Types: `kebab-case.ts` or single name (e.g. `project.ts`, `run.ts`).

**Functions:**  
- Components: `PascalCase`.  
- Hooks: `use` + `PascalCase` (e.g. `useRunState`).  
- API/client: `camelCase` (e.g. `listProjects`, `getProjectResolved`).  
- API route handlers: `GET`, `POST`, etc.

**Variables:**  
- `camelCase` for locals; `PascalCase` for components; `SCREAMING_SNAKE_CASE` for true constants.

**Types:**  
- Interfaces: `PascalCase` (`Project`, `RunInfo`).  
- Type aliases: `PascalCase` (`CreateProjectBody`, `ResolvedProject`).

---

## 3. Data Flow & State Architecture

### A. Data Sources

1. **Server-side (when Next is running)**  
   - REST: `GET/POST/PUT/DELETE` to `/api/data/*`, `/api/generate-*`, `/api/analyze-project-doc`, etc.  
   - No Server Actions in use; no tRPC/GraphQL.

2. **Client-side**  
   - **Global:** Zustand `useRunStore` (run/terminal, projects list, prompts, timing).  
   - **Context:** `UIThemeProvider` (theme id), `QuickActionsProvider`.  
   - **Local:** `useState`/`useReducer` in components (forms, tabs, selection).  
   - **URL:** Route params (e.g. `projects/[id]`).

3. **Persistent**  
   - **DB:** SQLite `data/app.db` (tickets, kanban state, milestones, ideas, implementation_log).  
   - **Files:** `data/projects.json`, `data/*.json`, project repo `.cursor/*`.  
   - **Browser:** `localStorage` (e.g. `app-ui-theme`), no session auth.

4. **External**  
   - Tauri: file system, shell, dialog (no third-party SaaS in current design).  
   - Optional: analyze/agent HTTP endpoints called from Next API.

### B. State Management Strategy

**Zustand (`run-store`):**  
- Run/worker state, active projects, prompts, timing, floating terminal, temp-ticket queue.  
- Use for cross-cutting, frequently read data shared by many components.

**Context:**  
- Theme (UIThemeProvider): persisted to localStorage, applied via CSS variables.  
- Quick actions: small set of callbacks for global actions.

**Local state:**  
- Form inputs, open/closed dialogs, selected tab, filters.  
- Per-component or lifted only when needed.

**URL state:**  
- Current project `[id]`, page path. In Tauri, project links use client-side navigation (ADR 0067).

### C. Data Fetching Strategy

**No Server Components for data:**  
- Pages do not `await` DB or fetch; they render a client organism that fetches.

**Client fetching:**  
- Components (or organisms) call `listProjects()`, `getProjectResolved(id)` from `lib/api-projects.ts`, or direct `fetch('/api/data/...')`.  
- After mutations, call `refetch()` or equivalent (e.g. re-call list/get) to refresh UI.  
- No SWR or React Query; manual loading/error state in components.

**Tauri path:**  
- Same functions in `api-projects.ts` use `invoke('list_projects')`, etc. Run/terminal updates come from store actions that call `invoke` and from Tauri events (e.g. script log) that update the store.

### D. Caching & Revalidation

- **Next.js:** API routes use `dynamic = "force-static"` where present; no `revalidatePath`/tag in current code.  
- **Client:** No HTTP cache layer; refetch on user action or after mutation.  
- **Zustand:** In-memory; re-hydrated from API/Tauri in `RunStoreHydration` and on explicit `refreshData()`.

### E. Optimistic Updates

Not standardized. Some flows (e.g. ticket update) could optimistically update local state then revert on error; current pattern is fetch → mutate → refetch.

---

## 4. API Design & Conventions

### A. API Endpoint Structure

REST-style under `/api`:

```
GET    /api/data/projects              → List projects
POST   /api/data/projects              → Create project
GET    /api/data/projects/:id           → Get one project (optional ?resolve=1)
PUT    /api/data/projects/:id           → Update project
DELETE /api/data/projects/:id           → Delete project

GET    /api/data/projects/:id/tickets   → List tickets
POST   /api/data/projects/:id/tickets   → Create ticket
GET    /api/data/projects/:id/tickets/:ticketId
PUT    /api/data/projects/:id/tickets/:ticketId
DELETE /api/data/projects/:id/tickets/:ticketId

GET    /api/data/projects/:id/milestones
POST   /api/data/projects/:id/milestones
GET/PUT/DELETE .../milestones/:milestoneId

GET/PUT /api/data/projects/:id/kanban-state

GET    /api/data/ideas
POST   /api/data/ideas
GET    /api/data/ideas/:id
...

POST   /api/generate-ideas
POST   /api/generate-architectures
POST   /api/analyze-project-doc
...
```

### B. Request/Response Envelope

No single envelope for all routes. Common pattern:

**Success:**  
- JSON body: direct entity or `{ data: T }` or array.  
- Status: 200 (GET/PUT), 201 (POST), 204 (DELETE where used).

**Error:**  
- JSON: `{ error: string }` (and optional `details` for validation).  
- Status: 400 (validation), 404 (not found), 500 (server error).

### C. HTTP Status Codes

| Code | Use |
|------|-----|
| 200 | OK (GET, PUT) |
| 201 | Created (POST) |
| 204 | No Content (DELETE when body empty) |
| 400 | Bad Request (validation, invalid JSON) |
| 404 | Not Found (resource missing) |
| 500 | Internal Server Error |

### D. Validation (Zod)

All mutation bodies validated in API routes via `lib/api-validation.ts`:

```typescript
import { parseAndValidate, createProjectSchema } from "@/lib/api-validation";

export async function POST(request: NextRequest) {
  const parsed = await parseAndValidate(request, createProjectSchema);
  if (!parsed.success) return parsed.response;
  const body = parsed.data;
  // ...
}
```

Schemas: `createProjectSchema`, `updateProjectSchema`, `createIdeaSchema`, `createPromptRecordSchema`, `generateIdeasSchema`, etc.

### E. Error Handling

**API:**  
- `try/catch` in handlers; `NextResponse.json({ error: message }, { status })` on failure.  
- Validation errors return 400 with message (and optional `details`).  
- Do not leak stack or internals to client.

**Client:**  
- Check `response.ok`; parse JSON for `error`. Use toasts (sonner) for user-facing messages.  
- ErrorBoundary for component tree failures; critical UI in `error.tsx` / `global-error.tsx`.

---

## 5. Native Integration Architecture (Tauri)

### A. Dual-Backend Strategy

- **Detection:** `lib/tauri.ts` exports `isTauri` (checks `window.__TAURI__` / `__TAURI_INTERNALS__` or `NEXT_PUBLIC_IS_TAURI` for SSR).  
- **Data access:** `lib/api-projects.ts` (and run-store) branch on `isTauri`: Tauri uses `invoke(cmd, args)`, browser uses `fetch(url)`.

```typescript
export async function listProjects(): Promise<Project[]> {
  if (isTauri) return invoke<Project[]>("list_projects", {});
  return fetchJson<Project[]>("/api/data/projects");
}
```

### B. Tauri Commands (Rust)

Representative commands from `src-tauri/src/lib.rs`:

- **Projects:** `list_projects`, `get_project`, `get_project_resolved`, `create_project`, `update_project`, `delete_project`, `get_project_export`.  
- **File:** `read_file_text_under_root`, `list_files_under_root`, `write_spec_file`, `get_cursor_init_template`.  
- **Git:** `get_git_info`, `get_git_head`, `git_fetch`, `git_pull`, `git_commit`, …  
- **Run/terminal:** `run_script`, `run_implement_all`, `run_run_terminal_agent`, `run_npm_script`, `run_npm_script_in_external_terminal`, `stop_run`, `stop_script`, `list_running_runs`.  
- **Data:** `list_february_folders`, `get_active_projects`, `get_prompts`, `save_prompts`, `add_prompt`, `get_tickets`, `save_tickets`, `get_dashboard_metrics`, `get_implementation_log_entries`, …

Frontend calls: `invoke<T>('command_name', { arg })`.

### C. Event System

- **Rust:** Emit events (e.g. script log, script exited) via Tauri `Emitter`.  
- **Frontend:** `listen<Payload>(eventName, handler)` from `lib/tauri.ts` (wraps `@tauri-apps/api/event` when in Tauri). Used to push run output and exit status into the run-store.

### D. Anti-Patterns

- **Don’t** mix Tauri and fetch for the same logical operation in one flow—choose one path per call site (handled in `api-projects` and run-store).  
- **Don’t** use sync IPC; all invoke is async.  
- **Don’t** assume `window` or file APIs in browser-only code paths.  
- **Do** keep platform behind `isTauri` and shared interfaces (e.g. `listProjects()`).

---

## 6. Component Architecture

### A. Atomic Design Hierarchy

- **`ui/`** — Atoms from shadcn (Button, Card, Dialog, Tabs, Input, Label, Badge, …). Headless Radix + Tailwind + CVA. No domain logic.  
- **`atoms/`** — Single-purpose pieces (e.g. list items, form segments). Use `ui/` and shared styles.  
- **`molecules/`** — Composed blocks: form+dialog, table+toolbar, Kanban column, tab content. 2–5 atoms; one clear responsibility.  
- **`organisms/`** — Feature-level: full page content (ProjectsList, ProjectDetails, TicketBoard), sidebar nav, quick actions. May hold state, fetch, and business flow.  
- **`shared/`** — Cross-cutting: ErrorDisplay, TerminalRunDock, FloatingTerminalDialog, shared-design.css.

### B. Client vs. Server Components

- **Server (default):** Used for root layout, thin page wrappers, and any route that does not need interactivity.  
- **Client (`'use client'`):** Any component with `useState`, `useEffect`, event handlers, Zustand, or Context (except where Context is only for theme and provided from a client boundary).  
- **Rule:** Add `'use client'` as low as possible; most feature UI is under one client organism so the page stays server-renderable in principle.

### C. Props and Composition

- Prefer explicit props over large spread.  
- Use compound components where it helps (e.g. Card + CardHeader + CardContent).  
- Slots/children for layout (e.g. Dialog with trigger and content).

---

## 7. Type System & Validation

- **Types:** `types/*.ts` — `Project`, `RunInfo`, `PromptRecordItem`, etc. Shared by lib, store, and components.  
- **Validation:** Zod in `lib/api-validation.ts`; infer types from schemas where useful (`z.infer<typeof createProjectSchema>`).  
- **DB rows:** Types in `lib/db.ts` (e.g. `PlanTicketRow`, `IdeaRow`) for SQLite result shapes.  
- **No `any`** for API or domain data; use `unknown` and type guards if needed.

---

## 8. Error Handling & Resilience

- **Error boundaries:** `ErrorBoundary` component; use at layout or feature level. `app/error.tsx` and `app/global-error.tsx` for route/global failures.  
- **API → UI:** Return structured error body and status; client shows toast or inline message.  
- **Retry:** No global retry; components may re-fetch on button click or onReset.  
- **Logging:** `console.error` in dev; no Sentry in current setup.

---

## 9. Performance & Optimization

- **Code splitting:** `dynamic()` used for `ProjectDetailsPageContent` to avoid loading full project UI on list view.  
- **Memoization:** Use `React.memo`, `useMemo`, `useCallback` where profiling shows benefit (e.g. heavy lists).  
- **Images:** Next `Image` if/when used; no heavy image usage in current app.  
- **DB:** Queries use prepared statements and targeted columns; migrations run once.  
- **Bundle:** Tauri production uses static export; tree-shaking and route-based chunks apply.

---

## 10. Security Considerations

- **Input:** All API inputs validated with Zod; no raw `request.body` without validation.  
- **Auth:** None; app is local/single-user. No secrets in client (no `NEXT_PUBLIC_` for API keys).  
- **Env:** Use `NEXT_PUBLIC_*` only for non-secret config (e.g. `NEXT_PUBLIC_IS_TAURI`, `NEXT_PUBLIC_API_BASE` for Tauri).  
- **File access:** API and Tauri restrict file operations to allowed dirs (e.g. project repo, data dir); path traversal guarded.

---

## 11. Scalability & Extension Patterns

**New entity (e.g. “Task”):**  
1. Add types in `types/`.  
2. Add Zod schema and optional DB migration (SQLite or JSON).  
3. Add API routes under `app/api/data/...`.  
4. Add or extend `lib/api-*.ts` and, in Tauri, Rust commands.  
5. Add UI: atoms/molecules/organisms and page route if needed.

**New page:**  
1. Add `app/feature/page.tsx` (and optional `layout.tsx`).  
2. Implement organism for content; fetch via lib or fetch.  
3. Add nav link in sidebar or quick actions.

**New Tauri command:**  
1. Implement `#[tauri::command] fn ...` in `src-tauri/src/lib.rs` and register in `run()`.  
2. Call from frontend via `invoke('command_name', args)`.

---

## 12. Anti-Patterns (Forbidden)

1. **Business logic in page components** — Keep in `lib/` or store actions.  
2. **Global mutable state outside store/context** — No module-level `let state`.  
3. **Fetch in useEffect without cleanup or error handling** — Prefer explicit fetch + state and refetch on demand.  
4. **Prop drilling beyond 2–3 levels** — Use Context or Zustand.  
5. **`any` for API/domain data** — Use proper types or `unknown` + guards.  
6. **Mixing data fetch, transform, and UI in one component** — Split: hook/lib for data, component for presentation.  
7. **Skipping API validation** — Always use `parseAndValidate` (or equivalent) for mutation bodies.  
8. **Importing server-only code in client** — Don’t import `getDb` or Node-only libs in `'use client'` or from client-only modules.  
9. **Hardcoded URLs** — Use env or `window.location.origin` / `getApiBase()` for API base.  
10. **No error handling on fetch** — Check `res.ok`, handle errors, show user feedback.  
11. **Mutating props** — Treat props as read-only; update via callbacks or store.  
12. **Over-abstracting** — Add hooks or shared helpers when the pattern repeats (e.g. 3+ similar usages).

---

## 13. Architectural Decision Records (ADRs)

| Decision | Rationale | Alternatives |
|----------|-----------|--------------|
| Next.js 16 App Router | Single framework for UI and API; static export for Tauri. | Vite (no built-in API), Remix. |
| Zustand for run state | Simple API, no boilerplate; fits run/terminal and prompts. | Redux (verbose), Context (re-render scope). |
| Tailwind + shadcn/ui | Utility-first CSS, copy-paste components, design tokens. | CSS-in-JS (runtime cost), MUI (opinionated). |
| Zod for validation | Type-safe, composable, single source for request shapes. | Yup, Joi, manual checks. |
| Dual backend (Next vs Tauri) | One frontend; browser uses Next API, desktop uses Rust. | Separate desktop app; single backend (would require always-on server for desktop). |
| File + SQLite for data | Simple, portable, same data model in Node and Rust. | Prisma (no Rust story), Postgres (overkill for local). |
| Client-side navigation in Tauri (ADR 0067) | Static export has one `[id]` route; full navigations break. Use `router.push()` so SPA handles project links. | Multiple static pages per project (wasteful). |
| No auth | Local workflow tool; no multi-user or cloud auth. | NextAuth (unnecessary for current scope). |

---

## Appendix: Quick Reference

### Common Patterns

- **List projects:** `listProjects()` from `@/lib/api-projects` (Tauri or fetch).  
- **Get project with resolved entities:** `getProjectResolved(id)`.  
- **Create project:** `createProject(body)`; then refetch or navigate.  
- **Run state:** `useRunState()` or `useRunStore(selector)` from `@/store/run-store`.  
- **Theme:** `useContext(UIThemeContext)` or theme hook from `@/context/ui-theme`.  
- **Platform:** `isTauri` from `@/lib/tauri` (client-only where `window` is used).

### Import Path Aliases

- `@/*` → `./src/*` (tsconfig paths).

### Key Files

- **Project API (shared):** `src/lib/api-projects.ts`  
- **Run/terminal state:** `src/store/run-store.ts`  
- **Tauri bridge:** `src/lib/tauri.ts`  
- **Validation:** `src/lib/api-validation.ts`  
- **DB (Node):** `src/lib/db.ts`  
- **Root layout:** `src/app/layout.tsx`

---

*This architecture document is a living reference. Update it as the system evolves.*
