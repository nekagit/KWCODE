# Features

## Implemented features

| Title | Description |
|-------|-------------|
| Dashboard | Tabbed home: quick actions, ticket kanban (backlog/in progress/done/blocked), prompts, active repos, link to Run. |
| Tickets | CRUD; status and priority; drag-and-drop between columns; Add ticket accordion; paginated table. |
| AI tickets | Generate tickets from description + optional files (PDF/text) or from a selected project (Tauri: project analysis). |
| Features | Define features (title, tickets, prompts, projects); run one or add to queue; filter by project; delete all. |
| Run | Select prompts and projects; run script (Tauri); view live log; run by feature; stop run. |
| Feature queue | Queue multiple features; run in order; advance on script exit. |
| Projects list | List from API/Tauri; create from template or idea; create from local path (Tauri); delete. |
| Project detail | Accordions: prompts, tickets, features, ideas, design, architecture, spec markdown, Cursor files; link/unlink entities; categorizations. |
| Project export | Export project spec (design, architecture, features) as markdown; “Download for Cursor”. |
| Cursor best practice | Button to get recommended Cursor project structure (files and locations). |
| Analysis prompt | Button to build a Cursor-ready analysis prompt from project design/architecture/tickets. |
| Prompts | Full CRUD via API; table view; AI generate prompt from description. |
| Ideas | CRUD; categories (saas, iaas, paas, website, etc.); AI generate ideas; create project from idea. |
| Design | Config (sections, colors, typography); generate markdown/HTML; save to library; AI generate from description. |
| Architecture | CRUD records (name, description, category, practices, scenarios); category filter; AI generate. |
| Configuration | Timing parameters for run script (sleeps between open, focus, paste, etc.). |
| Data tab | List scripts, list JSON files, view KV/tickets/features (Tauri: SQLite; browser: read-only). |
| All data tab | Combined view: projects, prompts, tickets, features, ideas, design. |
| Seed template | Seed new project from template (ideas, designs, architectures, features with tickets). |
| Root loading overlay | Initial loading state until run store is hydrated. |

## Missing features (suggested next steps)

| Feature | Suggestion |
|---------|------------|
| Automated tests | Add Jest or Vitest for lib/store; Playwright or Cypress for critical flows (e.g. run, create project). |
| API auth | If deploying beyond localhost, add auth (e.g. API key header or session) to `/api/*` and generate routes. |
| Request validation | Validate request bodies (e.g. Zod) in API routes to return 400 with clear errors instead of 500. |
| Error boundaries | Add React error boundaries at layout or route level to avoid full white screen on errors. |
| Run history | Persist run metadata and log snippets (e.g. in SQLite or JSON) and add a “History” view. |
| OPENAI feedback in UI | When OPENAI_API_KEY is missing, show a clear message on generate buttons or after first failure. |
| Offline / PWA | If browser mode should work offline, add service worker and consider syncing to backend when online. |
| i18n | Add locale/translation layer if the app will be used in multiple languages. |
| Project sync | Explicit “Reload from disk” or sync for local projects vs `projects.json`. |
| Accessibility | Audit and fix focus, keyboard nav, and ARIA where Radix doesn’t cover (e.g. custom tables, kanban). |
