# Architecture — KWCode

**Version**: 1.0  
**Last Updated**: 2026-02-13  
**Author**: Principal Software Architect (AI)

---

## Architecture Analysis

**Framework & runtime**: Next.js 16 (App Router) on Node, with optional Tauri v2 desktop shell. Dev server runs on port 4000 (`next dev -p 4000 -H 127.0.0.1`).

**Frontend**: React 18 with heavy use of Client Components (`"use client"`). Most pages are thin wrappers that render organism-level Client Components; Server Components are used for root layout and simple page shells. No SSR data fetching in page components—data is loaded via API routes from the client or via the run store.

**Backend**: Monolithic API layer in `src/app/api/`. REST-style routes only (no tRPC, no GraphQL). Data access is file-based: JSON files under `data/` and `.cursor/` (e.g. `projects.json`, `prompt-records.json`, `features.md`, `tickets.md`). No database or ORM; `fs` and `path` are used for read/write. AI generation routes call OpenAI (gpt-4o-mini) for tickets, prompts, ideas, designs, architectures, and project-from-idea.

**State management**: Zustand (`run-store.ts`) for run orchestration (projects, prompts, timing, feature queue, Implement All, floating terminal). React Context for UI theme (`ui-theme.tsx`) and quick actions (`quick-actions-context.tsx`). Local component state elsewhere. No Redux, no React Query/SWR in the codebase—fetching is ad hoc or via the store’s `refreshData`/API calls.

**Data fetching**: Client → `fetch()` to `/api/*`; run store also calls API for projects/prompts and, in Tauri mode, uses `invoke()` for shell/run commands. No Server Actions in use; no direct DB from client (N/A—no DB).

**Authentication**: None. No NextAuth, Supabase, or custom auth; app is local/desktop-first.

**File structure**: Feature-oriented within a layered layout: `app/` (routes + API), `components/` (atomic: ui, atoms, molecules, organisms, shared), `lib/` (core logic, validation, Tauri abstraction), `types/`, `store/`, `context/`, `data/` (static templates and config). Matches a **modular monolith** with **atomic design** in the UI and clear separation between API, lib, and components.

**Architectural style**: **Layered + modular monolith**. Presentation (components) → API routes (HTTP + validation) → business/helpers in `lib/` → file-system persistence. **Dual-backend**: browser uses Next.js API only; Tauri build uses same API plus native `invoke` for shell/run. No event-driven or CQRS; request/response only.

**Data flow**: User action in UI → (optional) Zustand action → `fetch('/api/...')` or Tauri `invoke()` → API route or Tauri command → read/write JSON or .md files (or call OpenAI) → JSON response → client state update and re-render. Run state (active projects, prompts, runs) is centralized in the run store and hydrated once via `RunStoreHydration`.

**Integration points**: OpenAI API (server-side only, key in env); Tauri (dialog, event, invoke) when `NEXT_PUBLIC_IS_TAURI === 'true'`; file system for projects, prompts, ideas, designs, architectures, and `.cursor/planner` (features.md, tickets.md). No payment, email, or other third-party SaaS.

---

## 1. Architecture Overview

### A. Architectural Style

- **Layered architecture** — Presentation (React components) → API layer (Next.js route handlers) → business/helpers (`lib/`) → data (file system).
- **Modular monolith** — Features are grouped by domain (projects, prompts, ideas, run, Kanban); API routes and components align to these modules.
- **Atomic design** — UI is structured as atoms → molecules → organisms; `ui/` holds primitives (shadcn/Radix), then atoms, molecules, organisms, and shared.
- **Dual-backend (browser + Tauri)** — Same Next.js app runs in browser or inside Tauri; data access is abstracted so that in Tauri mode shell/run use `invoke()`, and in browser mode those paths use no-ops or API-only.

No Clean/Hexagonal ports-and-adapters, no CQRS, no event bus, no microservices.

### B. High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER / TAURI WEBVIEW                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    React Components (UI Layer)                          │ │
│  │  - app-shell, organisms (ProjectDetailsPageContent, RunPageContent…)    │ │
│  │  - molecules (tabs, forms, Kanban, cards, layouts)                       │ │
│  │  - atoms, ui (shadcn, Radix)                                             │ │
│  │  - Client state: Zustand (run-store), Context (theme, quick-actions)      │ │
│  └───────────────────────────────┬─────────────────────────────────────────┘ │
│                                  │ fetch('/api/*') | invoke(cmd) [Tauri]     │
└──────────────────────────────────┼──────────────────────────────────────────┘
                                    │
┌──────────────────────────────────▼──────────────────────────────────────────┐
│                         NEXT.JS SERVER (Node)                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  API Routes (app/api/)                                                   │ │
│  │  - data/* (projects, ideas, prompts, designs, architectures, files)    │ │
│  │  - generate-* (ticket, prompt, ideas, design, architectures, project)  │ │
│  │  - check-openai                                                         │ │
│  │  Validation: Zod (lib/api-validation.ts)                               │ │
│  │  Business/helpers: lib/ (run-helpers, todos-kanban, analysis-prompt…)   │ │
│  └───────────────────────────────┬─────────────────────────────────────────┘ │
│                                  │ fs, path (JSON / .md)                     │
│  ┌───────────────────────────────▼─────────────────────────────────────────┐ │
│  │  External: OpenAI API (server-side only)                                 │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────┼──────────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────────────┐
│  DATA LAYER (File system)                                                    │
│  - data/ (e.g. projects.json) — app data dir                                │
│  - .cursor/ (planner/features.md, tickets.md; prompt-records.json; etc.)     │
│  - Per-project repo paths for run context                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  TAURI SHELL (when NEXT_PUBLIC_IS_TAURI=true)                                │
│  - invoke('run_script', …), dialog.open, listen('script-exited', …)          │
│  - Same React app; data still via Next API + file system; run/terminal via   │
│    native commands                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### C. Guiding Architectural Principles

1. **File-first source of truth** — Projects, prompts, ideas, and planner state (features.md, tickets.md) live in versionable files; the app reads and writes them via API or Tauri, not a separate database.

2. **Single run state store** — All run-related state (projects, prompts, timing, queue, Implement All, floating terminal) lives in one Zustand store (`run-store.ts`) and is hydrated once to avoid duplication and drift.

3. **Dual-backend behind one interface** — Tauri vs browser is hidden behind `lib/tauri.ts` (invoke, listen, showOpenDirectoryDialog) and no-op implementations in browser so components do not branch on environment.

4. **API validation at the edge** — Every mutation API accepts JSON and validates with Zod via `parseAndValidate()`; invalid payloads return 400 with structured error details.

5. **No server-only leakage to client** — Database/fs and OpenAI are only used in API routes or server code; client never imports server-only modules.

6. **Atomic UI hierarchy** — Primitives in `ui/`, then atoms → molecules → organisms; shared and layout components sit in `shared/` and layout/navigation molecules.

7. **Explicit client boundary** — `"use client"` is used where needed (state, effects, event handlers, store/context); root layout and simple page wrappers stay server-compatible.

### D. Architectural Categories

- [x] REST API
- [ ] GraphQL
- [ ] tRPC
- [ ] Serverless (monolithic Next.js server)
- [x] Monolithic
- [ ] Microservices
- [ ] Event-Driven
- [ ] CQRS
- [ ] Domain-Driven Design (domain modules without formal DDD building blocks)
- [ ] Clean Architecture
- [x] Layered Architecture
- [x] Modular Architecture
- [ ] Feature-Sliced Design (folder structure is feature-aware but not FSD)
- [ ] Offline-First (API-first; Tauri can run offline but data still via API/fs)
- [ ] Real-Time (polling/refresh only, no WebSockets/SSE)

---

## 2. Directory Structure & Module Boundaries

### A. Complete Directory Tree

```
src/
├── app/                                    # Next.js App Router
│   ├── api/                                # REST API route handlers
│   │   ├── check-openai/route.ts
│   │   ├── data/                           # CRUD and read-only data
│   │   │   ├── route.ts                    # Aggregated data (projects, tickets, features, prompts, designs)
│   │   │   ├── projects/route.ts           # GET/POST projects
│   │   │   ├── projects/[id]/route.ts      # GET/PUT/PATCH/DELETE project
│   │   │   ├── projects/[id]/files/route.ts
│   │   │   ├── projects/[id]/file/route.ts
│   │   │   ├── projects/[id]/export/route.ts
│   │   │   ├── ideas/route.ts, ideas/[id]/route.ts
│   │   │   ├── prompts/route.ts, prompts/[id]/route.ts
│   │   │   ├── designs/route.ts, designs/[id]/route.ts
│   │   │   ├── architectures/route.ts, architectures/[id]/route.ts
│   │   │   ├── files/route.ts, file/route.ts
│   │   │   ├── february-folders/route.ts
│   │   │   ├── february-repos-overview/route.ts
│   │   │   └── seed-template/route.ts
│   │   ├── generate-ticket-from-prompt/route.ts
│   │   ├── generate-prompt-from-kanban/route.ts
│   │   ├── generate-prompt/route.ts
│   │   ├── generate-ideas/route.ts
│   │   ├── generate-design/route.ts
│   │   ├── generate-architectures/route.ts
│   │   └── generate-project-from-idea/route.ts
│   ├── (pages)/
│   │   ├── page.tsx                        # Home
│   │   ├── projects/page.tsx, projects/[id]/page.tsx, projects/new/page.tsx
│   │   ├── run/page.tsx
│   │   ├── ideas/page.tsx, architecture/page.tsx, design/page.tsx
│   │   ├── testing/page.tsx, documentation/page.tsx, prompts/page.tsx
│   │   ├── configuration/page.tsx
│   │   └── loading-screen/page.tsx
│   ├── layout.tsx                         # Root layout (providers, AppShell)
│   ├── error.tsx, global-error.tsx
│   └── globals.css
├── components/
│   ├── ui/                                # Primitives (shadcn-style, Radix)
│   │   ├── button.tsx, card.tsx, dialog.tsx, tabs.tsx, input.tsx, label.tsx
│   │   ├── dropdown-menu.tsx, select.tsx, scroll-area.tsx, tooltip.tsx
│   │   ├── progress.tsx, switch.tsx, popover.tsx
│   │   └── ...
│   ├── atoms/                             # Small, single-purpose components
│   │   └── forms/FeatureAddForm.tsx
│   ├── molecules/                         # Compound components by concern
│   │   ├── TabAndContentSections/          # Tab content for project, run, setup, data
│   │   ├── Kanban/                        # KanbanColumnCard, KanbanTicketCard, KanbanColumnHeader
│   │   ├── FormsAndDialogs/               # NewProjectForm, IdeaFormDialog, AddPromptDialog, …
│   │   ├── CardsAndDisplay/               # ProjectSelectionCard, RunFromFeatureCard, …
│   │   ├── LayoutAndNavigation/            # ThemedPageLayout, ProjectHeader, ThreeTabLayout
│   │   ├── Tables/, Displays/, ListsAndTables/
│   │   ├── ControlsAndButtons/, Navigation/, UtilitiesAndHelpers/
│   │   └── VisualEffects/
│   ├── organisms/                         # Page-level or feature-rich blocks
│   │   ├── AppShell, SidebarNavigation
│   │   ├── HomePageContent, RunPageContent, ProjectDetailsPageContent
│   │   ├── IdeasPageContent, ArchitecturePageContent, TestingPageContent
│   │   ├── TicketBoard, PromptRecordsPageContent, …
│   │   └── SingleContentPage, ThreeTabResourcePageContent
│   ├── shared/                            # Cross-cutting UI and utilities
│   │   ├── Dialog.tsx, DisplayPrimitives.tsx
│   │   ├── FloatingTerminalDialog.tsx, TerminalSlot.tsx
│   │   └── shared-design.css, tailwind-*.json
│   ├── app-shell.tsx
│   ├── ErrorBoundary.tsx, root-loading-overlay.tsx
│   ├── tickets-data-table.tsx, cursor-files-tree.tsx
│   └── utilities/
├── lib/                                   # Core logic, no UI
│   ├── api-validation.ts                  # Zod schemas + parseAndValidate
│   ├── api-projects.ts                    # Project API client helpers
│   ├── run-helpers.ts                     # Run/orchestration helpers
│   ├── todos-kanban.ts                    # Parse/serialize features.md, tickets.md
│   ├── analysis-prompt.ts                 # Analysis prompt building
│   ├── tauri.ts                           # invoke, listen, showOpenDirectoryDialog
│   ├── noop-tauri-api.ts                  # No-op when not in Tauri
│   ├── noop-tauri-dialog.ts
│   ├── utils.ts                           # getApiErrorMessage, cn, etc.
│   ├── file-tree-utils.ts, feature-to-markdown.ts, architecture-to-markdown.ts
│   ├── design-to-markdown.ts, design-config-to-html.ts
│   ├── cursor-best-practice.ts
│   └── proxy.ts                           # Next.js 16 proxy (pass-through)
├── store/
│   ├── run-store.ts                       # Zustand: run state and actions
│   └── run-store-hydration.tsx            # Hydrates run store from API on mount
├── context/
│   ├── ui-theme.tsx                       # Theme provider (Context)
│   ├── quick-actions-context.tsx
│   └── run-state.tsx
├── types/                                 # TypeScript types and interfaces
│   ├── project.ts, run.ts, ticket.ts, idea.ts, prompt.ts
│   ├── design.ts, architecture.ts, analysis.ts, file-tree.ts, git.ts
│   ├── tauri-api.d.ts, pdf-parse.d.ts
│   └── ...
├── data/                                  # Static config and templates
│   ├── ui-theme-templates.ts
│   ├── architecture-templates.ts, design-templates.ts, test-templates.ts
│   ├── test-best-practices.ts, template-ideas.ts
│   └── february-repos-overview.ts
└── (middleware not used; proxy.ts exists for reference)
```

**Folder purposes and rules:**

| Folder        | Purpose                                                                 | Do NOT put here                          | Import rules |
|---------------|-------------------------------------------------------------------------|------------------------------------------|--------------|
| `app/`        | Routes, API handlers, root layout, global error UI                     | Business logic, shared components        | Can import from components, lib, types, data |
| `app/api/`    | HTTP request/response, validation, call lib/ and fs                    | Direct UI, heavy business logic          | Can import lib, types, Node fs/path |
| `components/` | All React UI                                                            | API calls (prefer store or props), pure lib | ui/ imports only from ui or primitives; organisms may import molecules/atoms/ui |
| `lib/`        | Pure logic, validation, Tauri abstraction, file/API helpers             | JSX, hooks that depend on React tree     | No import from components or app |
| `store/`      | Zustand state and actions                                              | UI, API route logic                      | Can import lib, types; used by client components |
| `context/`    | React Context providers                                                 | Global side effects beyond theme/actions | Consumed by components |
| `types/`      | Shared TypeScript types and interfaces                                | Runtime code, defaults                    | No import from components or app |
| `data/`       | Static lists, theme definitions, templates (no runtime I/O)            | API routes, dynamic state                | Imported by lib, components |

### B. Module Boundaries & Dependency Rules

```
components/ (UI)
    ↓ MAY import
hooks (none formalized; hooks can live in components or lib)
    ↓
lib/, types/, data/, store/, context/

FORBIDDEN:
- types/ importing from components/ or app/
- lib/ importing from components/ or app/
- app/api importing from components/
- Circular dependencies between any two modules
```

**Enforcement:** Use ESLint `import/no-restricted-paths` (or equivalent) to block `components` and `app` from being imported by `lib` or `types`. Document any exception (e.g. a shared type used by both API and UI) in this doc.

### C. Naming Conventions

**Files:**

- **Pages/routes**: kebab-case (Next.js: `project-details/page.tsx` is not used; we use `[id]/page.tsx`).
- **Components**: PascalCase.tsx — `ProjectCard.tsx`, `KanbanTicketCard.tsx`, `RunPageHeader.tsx`.
- **Lib/utils**: kebab-case.ts — `api-validation.ts`, `run-helpers.ts`, `file-tree-utils.ts`.
- **Types**: kebab-case.ts — `project.ts`, `run.ts`, `api-response.ts`.
- **Store**: kebab-case — `run-store.ts`, `run-store-hydration.tsx`.

**Functions:**

- **Components**: PascalCase — `ProjectCard`, `AppShell`.
- **Hooks**: camelCase with `use` — `useAuth` (if added), custom hooks in components.
- **Utilities**: camelCase — `formatDate`, `parseAndValidate`, `readProjects`.
- **API handlers**: `GET`, `POST`, etc. (exported as `export async function GET`).

**Variables:**

- **Local**: camelCase.
- **Components**: PascalCase.
- **Constants**: SCREAMING_SNAKE_CASE for true constants (e.g. `DATA_DIR` in API routes); otherwise camelCase.

**Types:**

- **Interfaces/types**: PascalCase — `Project`, `RunState`, `PromptRecordItem`.
- **Generics**: Single letter or descriptive — `T`, `TData`, `TError`.

---

## 3. Data Flow & State Architecture

### A. Data Sources

1. **Server-side data (from backend)**
   - **REST**: `GET/POST/PUT/PATCH/DELETE` to `/api/data/*` and `/api/generate-*`.
   - No Server Actions, no tRPC, no GraphQL.

2. **Client-side data**
   - **Global**: Zustand `run-store` (projects, prompts, timing, queue, runs, floating terminal).
   - **Context**: `UIThemeProvider` (theme id), `QuickActionsProvider`, `run-state` (if used).
   - **Local**: `useState` / `useReducer` in components (forms, modals, selection).
   - **URL**: Route params (e.g. `projects/[id]`), query params where used.

3. **Persistent data**
   - **File system**: `data/projects.json`, `.cursor/planner/features.md`, `.cursor/planner/tickets.md`, `.cursor/prompt-records.json`, designs, architectures, ideas (paths defined in API routes).
   - **Browser**: `localStorage` for UI theme (`app-ui-theme`); no sessionStorage/IndexedDB for app data.
   - **Cookies**: None for app state.

4. **External**
   - **OpenAI**: Used only in API routes (generate-ticket, generate-prompt, generate-ideas, generate-design, generate-architectures, generate-project-from-idea, generate-prompt-from-kanban). API key in `OPENAI_API_KEY` (server-only).

### B. State Management Strategy

**Zustand (`run-store.ts`):**

- Holds: `isTauriEnv`, `loading`, `error`, `dataWarning`, `allProjects`, `activeProjects`, `prompts`, `selectedPromptRecordIds`, `timing`, `runningRuns`, `selectedRunId`, `featureQueue`, `queueRunInfoId`, `archivedImplementAllLogs`, `floatingTerminalRunId`.
- Actions: `refreshData`, `runScript`, `runWithParams`, `runImplementAll`, `runImplementAllForTickets`, `runSetupPrompt`, `stopScript`, `stopRun`, `addFeatureToQueue`, etc.
- Hydration: `RunStoreHydration` in root layout fetches once and populates the store so the rest of the app can rely on it without per-page loading.

**When to use Zustand:** Cross-cutting run/planning state, shared across Run tab, Project tabs, and floating terminal. Not for one-off form or modal state.

**When to use Context:** Theme (UIThemeProvider), quick actions. Rarely changing, provider-scoped.

**When to use local state:** Form inputs, modal open/closed, tab index, filters, selection in a single tree/table.

**When to use URL state:** Current project id (`/projects/[id]`), and any future shareable filters/pagination if added.

### C. Data Fetching Strategy

**No Server Components data fetching:** Pages do not `await` DB or API in the server tree; they render client-heavy organisms that fetch or read from the store.

**Client fetching:**

- **Run store**: `refreshData()` calls `/api/data` (or equivalent) and updates the store; components subscribe to the store.
- **Ad hoc**: Components that need project details, ideas, or other entities call `fetch('/api/data/...')` and set local state or pass to children.
- **Tauri**: Run/terminal flows use `invoke()` from the store (e.g. run script, listen for script-exited).

**No SWR/React Query:** The codebase does not use a client cache layer; the run store is the main cache for run-related data. Other data is fetched on demand.

### D. Caching & Revalidation

- **Next.js**: `fetch()` in API routes or server code can use default cache or `cache: 'no-store'`; no ISR/revalidate used in current app routes.
- **Client**: Run store holds the canonical list of projects/prompts; `refreshData()` is the explicit revalidation. No automatic refetch on focus/reconnect.
- **Cache invalidation:** After create/update/delete of a project or prompt, call `refreshData()` or refetch the affected resource in the component that performed the mutation.

### E. Optimistic Updates

Not standardized. Where needed, components can update local state optimistically and revert on API error (e.g. toast + revert). Run store does not currently implement optimistic updates for run commands.

---

## 4. API Design & Conventions

### A. API Endpoint Structure

**Data (CRUD):**

```
GET    /api/data/projects           → List projects
POST   /api/data/projects          → Create project
GET    /api/data/projects/[id]     → Get one project
PUT    /api/data/projects/[id]     → Full update
PATCH  /api/data/projects/[id]     → Partial update
DELETE /api/data/projects/[id]     → Delete project
```

Similar pattern for `ideas`, `prompts`, `designs`, `architectures` (with their own route files). Nested resources:

```
GET    /api/data/projects/[id]/files
GET    /api/data/projects/[id]/file (query params)
POST   /api/data/projects/[id]/file
GET    /api/data/projects/[id]/export
```

**Generate (AI):**

```
POST   /api/generate-ticket-from-prompt
POST   /api/generate-prompt-from-kanban
POST   /api/generate-prompt
POST   /api/generate-ideas
POST   /api/generate-design
POST   /api/generate-architectures
POST   /api/generate-project-from-idea
GET    /api/check-openai
```

**Aggregate:**

```
GET    /api/data   → allProjects, activeProjects, prompts, tickets, features, designs, kvEntries
```

### B. Request/Response Envelope

**Current pattern:** Many routes return the entity or array directly (e.g. `NextResponse.json(projects)`). Some return `{ error: string }` on failure. A consistent envelope is recommended for new endpoints:

**Success (recommended):**

```typescript
{ success: true, data: T }
```

**Error (recommended):**

```typescript
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED' | ...,
    message: string,
    details?: Record<string, string[]>
  }
}
```

Existing routes mix plain `{ error: string }` and direct payloads; new API routes should prefer the envelope above where feasible.

### C. HTTP Status Codes

| Code | Meaning           | Use |
|------|-------------------|-----|
| 200  | OK                | Successful GET, PUT, PATCH |
| 201  | Created           | Successful POST (create) |
| 204  | No Content        | Successful DELETE (optional) |
| 400  | Bad Request       | Validation error (Zod), malformed JSON |
| 404  | Not Found         | Resource id not found |
| 500  | Internal Server   | Unexpected error (log, return safe message) |
| 502  | Bad Gateway       | External service (e.g. OpenAI) returned invalid response |

Auth (401/403) and rate limit (429) are not used in the current app (no auth).

### D. Validation (Zod)

All mutation bodies must be validated with Zod. Central place: `lib/api-validation.ts`.

**Pattern:**

```typescript
import { parseAndValidate, createProjectSchema } from "@/lib/api-validation";

export async function POST(request: NextRequest) {
  const parsed = await parseAndValidate(request, createProjectSchema);
  if (!parsed.success) return parsed.response;
  const body = parsed.data;
  // use body
}
```

**Schemas used:** `createProjectSchema`, `updateProjectSchema`, `createIdeaSchema`, `createPromptRecordSchema`, `createDesignSchema`, `createArchitectureSchema`, `generateTicketsSchema`, `generateIdeasSchema`, `generateDesignSchema`, `generateArchitecturesSchema`, `generateProjectFromIdeaSchema`, `generatePromptRecordFromKanbanSchema`, and others. New endpoints should add a schema and use `parseAndValidate`.

### E. Error Handling Conventions

**Server:**

- Use try/catch in route handlers; on error log and return JSON with a safe message and appropriate status (400, 404, 500, 502).
- Do not expose stack traces or internal paths to the client.
- Validation errors: return 400 with `error` and optional `details` (e.g. Zod `errors`).

**Client:**

- Use `getApiErrorMessage` (from `lib/utils`) or equivalent to show a single message.
- Toast (sonner) for user-facing errors; avoid silent failures for mutations.
- Error boundary (`error.tsx`, `global-error.tsx`) for render-time errors; show message and "Try again" where applicable.

---

## 5. Native Integration Architecture (Tauri)

### A. Dual-Backend Strategy

The app runs in two modes:

- **Browser:** Next.js dev or build served in a browser; all data via `/api/*`; run/terminal features either disabled or no-op.
- **Tauri:** Same Next.js app inside Tauri webview; `NEXT_PUBLIC_IS_TAURI=true`; run/terminal use native commands via `invoke()`.

Abstraction lives in `lib/tauri.ts` and `lib/noop-tauri-api.ts`:

```typescript
// lib/tauri.ts
export const isTauri = process.env.NEXT_PUBLIC_IS_TAURI === 'true';

if (isTauri) {
  import("@tauri-apps/api/core").then(m => tauriInvoke = m.invoke);
  import("@tauri-apps/api/event").then(m => tauriListen = m.listen);
  import("@tauri-apps/plugin-dialog").then(m => { tauriOpen = m.open; });
} else {
  import("@/lib/noop-tauri-api").then(m => {
    tauriInvoke = m.invoke;
    tauriListen = m.listen;
    tauriOpen = m.open;
  });
}

export const invoke = async <T>(cmd: string, args?: Record<string, unknown>): Promise<T> => { ... };
export const listen = async <T>(event: string, handler: (event: { payload: T }) => void): Promise<() => void> => { ... };
export const showOpenDirectoryDialog = async (): Promise<string | undefined> => { ... };
```

Data (projects, prompts, etc.) always comes from the Next.js API or file system; only run/terminal and dialog are Tauri-specific.

### B. Tauri Commands / Frontend Invocation

- **invoke(cmd, args):** Used by the run store to start scripts, stop runs, and other shell-related operations. Command names and args are defined in the Tauri backend (Rust); the frontend calls `invoke('command_name', { ... })`.
- **listen(event, handler):** Used for events such as script-exited so the UI can update run status and advance the queue.
- **showOpenDirectoryDialog:** Used to pick a project/repo directory; returns a path string.

Frontend does not import Rust; it uses the abstracted `invoke`/`listen`/`showOpenDirectoryDialog` from `lib/tauri.ts`.

### C. Event System

Tauri backend can emit events (e.g. script-exited); frontend subscribes with `listen('event-name', (event) => { ... event.payload })`. Unsubscribe by calling the function returned by `listen`.

### D. Capabilities & Permissions

Tauri capabilities are configured in the Tauri project (e.g. `src-tauri/capabilities`). Typical needs: dialog (open directory), shell/execute for run scripts, and any file system access the backend uses. Not enumerated in the frontend repo; see Tauri docs and `src-tauri` config.

### E. Anti-Patterns

- **Don’t** mix Tauri-only and API-only logic in the same function without a clear abstraction (use `lib/tauri.ts` and run store).
- **Don’t** call `invoke` from server code (API routes); only from client.
- **Do** feature-detect: use `isTauri` or try/catch when invoking so browser builds don’t rely on Tauri.
- **Do** keep run/terminal flow in the store and call `invoke`/`listen` from there so the rest of the UI stays environment-agnostic.

---

## 6. Component Architecture

### A. Atomic Design Hierarchy

- **`ui/` (primitives):** Buttons, inputs, cards, dialogs, tabs, dropdowns, tooltips, etc. (shadcn/Radix style). Styling with Tailwind + CVA where used. No business logic.
- **`atoms/`:** Small, single-purpose components (e.g. `FeatureAddForm`). May use `ui/` only.
- **`molecules/`:** Compound components: forms+dialogs (NewProjectForm, IdeaFormDialog), cards (ProjectSelectionCard, RunFromFeatureCard), layout (ThemedPageLayout, ProjectHeader), Kanban (KanbanColumnCard, KanbanTicketCard), tables, lists, tabs content. 2–5 primitives/atoms; one clear responsibility.
- **`organisms/`:** Feature-level blocks: AppShell, SidebarNavigation, HomePageContent, RunPageContent, ProjectDetailsPageContent, TicketBoard, IdeasPageContent, etc. Can contain state, store usage, and multiple molecules.
- **`shared/`:** Dialog, DisplayPrimitives, FloatingTerminalDialog, TerminalSlot, shared CSS and Tailwind catalogs. Used across many pages.

### B. Component File Pattern

- Prefer **named export** for components: `export function ProjectCard(...)`.
- Props interface in the same file or imported from types.
- Keep a single logical component per file; subcomponents can be in the same file if small and private.

### C. Client vs. Server Components

- **Server:** Root `layout.tsx`, simple page wrappers that only render a single client organism (e.g. `export default function Home() { return <HomePageContent />; }`). No `useState`, no store, no browser APIs.
- **Client (`'use client'`):** Any component that uses `useState`, `useEffect`, event handlers, Zustand, or Context (other than being wrapped by a provider). Keep `'use client'` as low as possible (e.g. on the organism or molecule that needs it, not the whole tree).

### D. Props Pattern

- Prefer explicit props over large spread (`<Button variant="primary" size="lg" />`).
- Optional props with sensible defaults; discriminate variants with a union type when there are mutually exclusive modes.

### E. Composition

- Use compound components where it clarifies structure (e.g. Card + CardHeader + CardContent).
- Slots via `children` or explicit slots (e.g. DialogTrigger, DialogContent). No render-props in current codebase; use composition or callbacks.

---

## 7. Type System & Validation

### A. Type Organization

- **types/project.ts:** `Project`, `EntityCategory`, `ProjectEntityCategories`, `Feature`, `ProjectTabCategory`.
- **types/run.ts:** Run store state and related (Timing, PromptRecordItem, RunInfo, FeatureQueueItem, etc.).
- **types/ticket.ts, idea.ts, prompt.ts, design.ts, architecture.ts:** Domain entities and related DTOs.
- **types/file-tree.ts, git.ts, analysis.ts:** Supporting types for file tree, git, analysis.
- **types/tauri-api.d.ts, pdf-parse.d.ts:** Declarations for external/Tauri usage.

Validation lives in **lib/api-validation.ts** (Zod); types can be derived with `z.infer<typeof schema>` where the schema is the source of truth for API shapes.

### B. Zod ↔ TypeScript

For API request bodies, Zod schemas are the source of truth; use `z.infer<typeof schema>` for TypeScript types when the same shape is used in multiple places. Domain types (e.g. `Project`) are defined in `types/` and may be kept in sync with schemas manually or via inference where appropriate.

### C. Shared vs. Domain-Specific

- **Shared:** E.g. `ApiResponse<T>`, `PaginatedList<T>`, `EntityId` — in `types/` or a shared types file.
- **Domain:** `Project`, `RunState`, `PromptRecordItem`, etc. — in their respective `types/*.ts` files.

### D. Generic Patterns

Use standard utility types: `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`. Optional custom helpers (e.g. `Nullable<T>`, `AsyncResult<T, E>`) can live in `types/utils.ts` if needed.

---

## 8. Error Handling & Resilience

### A. Error Boundary Hierarchy

- **Root:** `app/error.tsx` and `app/global-error.tsx` catch errors in the tree; show message and "Try again" (reset).
- **Route/segment:** No additional boundaries in app router by default; can add error.tsx per route group if needed.
- **Component:** `components/ErrorBoundary.tsx` can wrap high-value organisms to show a fallback and avoid full-page crash.

### B. Error Propagation

- **API → client:** API returns 4xx/5xx and JSON `{ error: string }` (or structured error object). Client reads response and shows toast or inline message; use `getApiErrorMessage` for consistency.
- **Store:** Run store sets `error` state and can surface it in UI; toast on critical failures.

### C. Retry & Fallback

- No global retry wrapper. Components can implement "Retry" buttons that refetch or call `refreshData()`.
- Graceful degradation: if run or Tauri is unavailable, show a message and disable run actions rather than throwing.

### D. Logging & Monitoring

- **Development:** `console.error` in catch blocks and error boundaries.
- **Production:** Keep user-facing messages safe; consider structured logging or a service (e.g. Sentry) for unhandled exceptions; not present in repo today.

---

## 9. Performance & Optimization

### A. Bundle Splitting

- Next.js does route-based code splitting by default.
- Heavy components (e.g. charts, editors) can be loaded with `dynamic(() => import('...'), { loading: () => <Skeleton />, ssr: false })` if needed.

### B. Memoization

- Use `React.memo` for list item components that receive stable props and are expensive to render.
- Use `useMemo` for derived data (e.g. filtered/sorted lists) when the computation is non-trivial.
- Use `useCallback` for stable callbacks passed to memoized children or to avoid unnecessary effect re-runs.

### C. Image Optimization

- Use Next.js `Image` for images with known dimensions; `priority` for above-the-fold assets. Not heavily used in current codebase.

### D. Data / “Database” Optimization

- Read only needed files in API routes; avoid reading entire directories when a single file suffices.
- For large JSON arrays, consider streaming or pagination if the list grows (not implemented yet).
- Parse Markdown (features.md, tickets.md) once per request; reuse parsing helpers from `lib/todos-kanban.ts`.

---

## 10. Security Considerations

### A. Input Sanitization

- **Always validate with Zod** on the server for all mutation inputs; never trust client payloads.
- If rendering user-provided HTML, sanitize (e.g. DOMPurify); current app does not render raw HTML from users.
- File paths: validate and constrain to intended directories to avoid path traversal; API routes that read/write files should use a known base path (e.g. `data/`, `.cursor/`).

### B. Authentication & Authorization

- No auth in the app; all endpoints are effectively open. If adding auth later, protect API routes and use middleware or route guards to enforce session/role.

### C. Environment Variables

- **Never** expose secrets to the client. `OPENAI_API_KEY` must stay server-only (no `NEXT_PUBLIC_`).
- Use `.env.local` for local secrets; validate required env at startup if desired (e.g. Zod in a small `lib/env.ts`).

### D. Content Security Policy

- CSP and security headers can be added in `next.config.js` (e.g. `X-Frame-Options`, `X-Content-Type-Options`). Not configured in the repo at present.

---

## 11. Scalability & Extension Patterns

### A. Adding a New Data Entity

1. **Types:** Add interfaces in `types/<entity>.ts`.
2. **Validation:** Add Zod schema(s) in `lib/api-validation.ts` (create/update).
3. **Storage:** Decide file path (e.g. `data/<entity>.json` or under `.cursor/`). Add read/write helpers (or reuse a pattern from existing data routes).
4. **API:** Add `app/api/data/<entity>/route.ts` (GET list, POST create) and `app/api/data/<entity>/[id]/route.ts` (GET/PUT/PATCH/DELETE). Use `parseAndValidate` for mutations.
5. **UI:** Add organisms/molecules and wire to API or store as needed. Add nav link if it’s a top-level resource.

### B. Adding a New Page

1. Add `app/<route>/page.tsx` (and optional `layout.tsx`).
2. Implement page content in an organism under `components/organisms/` and import it from the page.
3. Add sidebar/nav link in `AppShell` / `SidebarNavigation` if needed.

### C. Adding a New AI Generation Endpoint

1. Add Zod schema in `lib/api-validation.ts` for the request body.
2. Create `app/api/generate-<name>/route.ts`; validate body, call OpenAI (or other provider), parse response, return JSON. Use `OPENAI_API_KEY` from env.
3. Add UI trigger (button/form) that `fetch`es the new endpoint and displays or stores the result.

### D. Adding a New Zustand Slice

- If run-related, consider extending `run-store.ts` (state + actions) to avoid multiple stores unless the domain is clearly separate.
- For a new domain store: create `store/<name>-store.ts` with `create<State & Actions>(...)`, export hooks (e.g. `useXStore`). Optionally add a hydration component that fetches once and populates the store.

---

## 12. Anti-Patterns (Forbidden)

1. **Business logic in page components** — Keep pages as thin wrappers; put logic in `lib/` or store.
2. **Global mutable state outside store/context** — No module-level `let currentUser = null`; use Zustand or Context.
3. **Fetch in useEffect without cleanup or error handling** — Prefer store refresh or explicit fetch with error state and optional AbortController.
4. **Prop drilling beyond a few levels** — Use Context or store for widely needed data.
5. **Using `any`** — Prefer proper types or `unknown` with type guards.
6. **Mixing concerns in one component** — Separate data fetching, transformation, and presentation where practical.
7. **Skipping API input validation** — Always use Zod (or equivalent) for mutation bodies.
8. **Importing server-only code in client components** — No `import { db } from '@/lib/db'` in `'use client'`; no fs/path in client. Use API or Tauri abstraction.
9. **Hardcoded URLs/secrets** — Use env vars and path aliases (`@/`).
10. **Silent failures** — Handle errors and show toast or message; log in development.
11. **Mutating props** — Treat props as read-only; use immutable updates.
12. **Over-abstracting too early** — Add generics or shared hooks when the pattern repeats (e.g. 3+ times), not on first use.
13. **Tauri invoke/listen in API routes** — Native calls only from client code.
14. **Putting UI in lib/** — Keep `lib/` free of JSX and React-specific code.

---

## 13. Architectural Decision Records (ADRs)

| Decision | Date | Rationale | Alternatives Considered |
|----------|------|------------|--------------------------|
| **Next.js App Router** | 2024+ | Single framework for UI and API, good DX, file-based routing | Vite (no built-in API), Remix (different model) |
| **File-based persistence** | 2024+ | Versionable, no DB setup, fits .cursor/planner workflow | SQLite (added complexity), cloud DB (not needed for desktop) |
| **Zustand for run state** | 2024+ | Single store for run/orchestration, simple API, no boilerplate | Redux (verbose), Context (re-render scope), local state only (prop drilling) |
| **Zod for API validation** | 2024+ | Type-safe, composable, single source for request shapes | Yup, Joi, manual checks |
| **Tauri for desktop** | 2024+ | Native shell/run and dialog, small binary, same web stack | Electron (heavier), pure browser (no native run) |
| **No auth in MVP** | 2024+ | Local/desktop-first; single user per machine | NextAuth (add when needed for cloud or multi-user) |
| **REST instead of tRPC/GraphQL** | 2024+ | Simple, enough for current scope, easy to call from Tauri | tRPC (extra abstraction), GraphQL (overkill) |
| **Atomic design (ui/atoms/molecules/organisms)** | 2024+ | Clear hierarchy, reuse, consistent structure | Feature folders only, flat components |

---

## Appendix: Quick Reference

### Common Patterns

- **Validate API body:** `const parsed = await parseAndValidate(request, schema); if (!parsed.success) return parsed.response;`
- **Read projects (API):** `readProjects()` from route (uses `DATA_DIR`, `PROJECTS_FILE`); or fetch `GET /api/data/projects`.
- **Run state:** `useRunStore()` / `useRunStore(useShallow(...))` for run-related state and actions.
- **Tauri vs browser:** `isTauri` from `@/lib/tauri`; use `invoke`/`listen` only when `isTauri` or behind abstraction that no-ops in browser.
- **Theme:** `UIThemeProvider` + `useContext(UIThemeContext)` or theme selector component; persist with `localStorage` key `app-ui-theme`.

### Import Path Aliases

- `@/*` → `./src/*` (from tsconfig paths).
- Use `@/components/...`, `@/lib/...`, `@/types/...`, `@/store/...`, `@/context/...`, `@/data/...` for imports.

### Key Files

- Run state: `src/store/run-store.ts`, `src/store/run-store-hydration.tsx`
- API validation: `src/lib/api-validation.ts`
- Tauri bridge: `src/lib/tauri.ts`, `src/lib/noop-tauri-api.ts`
- Planner (features/tickets): `src/lib/todos-kanban.ts`
- Project types: `src/types/project.ts`; run types: `src/types/run.ts`

---

*This architecture document is a living reference. Update it as the system evolves.*
