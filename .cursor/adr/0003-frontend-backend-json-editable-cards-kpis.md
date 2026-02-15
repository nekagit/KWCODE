# ADR 0003: Frontend/Backend tabs use JSON; editable cards, inputs, KPIs

## Status
Accepted

## Context
ADR 0002 introduced Frontend and Backend tabs that display markdown from `.cursor/setup/frontend.md` and `backend.md`. Users need to elevate that content into structured UI: KPI cards, editable tech stack and entities, and the ability to change data via inputs and persist back—without fragile markdown round-trips. Initialize should provide generalized templates reusable for any project or entity.

## Decision
- **Structured JSON as source of truth:** Frontend and Backend tabs read and write `.cursor/setup/frontend.json` and `.cursor/setup/backend.json` instead of markdown. Schema includes: `version`, `title`, `overview`, `kpis[]`, `techStack[]`, `entities[]`, and (frontend) `routes[]` or (backend) `endpoints[]`. All array items have stable `id` for keys.
- **UI:** Each tab renders: (1) KPI cards grid (label + value + unit); (2) Overview textarea; (3) Tech stack card with editable list (category, name, version; add/remove rows); (4) Entities editable table; (5) Frontend: Routes table (page, route, component); Backend: Endpoints table (method, path, description). Save button persists JSON via `writeProjectFile`. Toast on success/error.
- **Types and helpers:** `src/types/setup-json.ts` defines `FrontendSetupJson`, `BackendSetupJson`, and parse/default helpers (`parseFrontendSetupJson`, `parseBackendSetupJson`, `getDefaultFrontendSetup`, `getDefaultBackendSetup`, `generateId`). Missing or invalid JSON yields default empty structure.
- **Initialize templates:** `.cursor_inti/setup/frontend.json` and `.cursor_inti/setup/backend.json` contain generalized placeholder content (empty or one sample row per section) so any project gets the same structure and can add any entities/endpoints/KPIs. No project-specific names in the template.
- **Backward compatibility:** Tabs no longer read `frontend.md` or `backend.md` for main content. The `.md` files in `.cursor/setup/` and `.cursor_inti/setup/` remain for reference or future “Export to .md” from JSON; they are not used by the tab UI.

## Consequences
- Frontend and Backend tabs are fully editable: KPIs, overview, tech stack, entities, routes/endpoints. Changes persist to JSON on Save.
- New projects initialized from `.cursor_inti` receive `frontend.json` and `backend.json` with generic placeholders.
- This project (KWCode) has `.cursor/setup/frontend.json` and `backend.json` populated from existing frontend/backend .md content for continuity.
- No new API or Tauri endpoints; existing `readProjectFileOrEmpty` and `writeProjectFile` (and POST project file) are used.

## References
- `src/types/setup-json.ts`: types and parse/default helpers
- `src/components/molecules/TabAndContentSections/ProjectFrontendTab.tsx`, `ProjectBackendTab.tsx`: JSON load/save, KPI cards, SectionCard, editable tables
- `.cursor/setup/frontend.json`, `.cursor/setup/backend.json` (this project)
- `.cursor_inti/setup/frontend.json`, `.cursor_inti/setup/backend.json` (generalized template)
- ADR 0002: Frontend and Backend tabs with tech stack storage (markdown; superseded for tab content by this ADR)
