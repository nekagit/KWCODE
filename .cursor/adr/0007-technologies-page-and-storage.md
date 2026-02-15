# ADR 0007: Technologies page and storage

## Status

Accepted

## Context

The app needed a dedicated place to define preferred technologies (libraries, frameworks, open source / GitHub sources) for future projects. Requirements: (1) a new "Technologies" page in the sidebar, (2) a tech stack section rendered with UI components (cards/chips/badges), (3) optional sections for libraries & frameworks and open source / GitHub sources, (4) content persisted in a `technologies` folder in both `.cursor_inti` (template) and `.cursor` (actual content).

## Decision

- **Sidebar:** Add a "Technologies" nav item under the Tools section (alongside Ideas), href `/technologies`, icon Cpu.
- **Storage:**
  - **`.cursor_inti/technologies/`** — template (committed). Contains `tech-stack.json`, optional `tech-stack.md`, `libraries.md`, `sources.md`.
  - **`.cursor/technologies/`** — editable content (created on first save). Read preferred; fallback to `.cursor_inti/technologies/` per file when missing.
- **API:** New route `GET/POST /api/data/technologies`. GET returns `{ files: { "tech-stack.json": "...", ... } }` (content from `.cursor/technologies/` first, fallback to `.cursor_inti/technologies/`). POST body `{ path, content }` writes only to `.cursor/technologies/` (path validated, no `..`).
- **Page:** Route `/technologies` renders `TechnologiesPageContent`. Tech stack section parses `tech-stack.json` and renders Frontend, Backend, Tooling as SectionCards with Badges per key-value. Libraries and Open source / GitHub sections render `libraries.md` and `sources.md` with Edit dialogs that POST back. SingleContentPage layout, loading and error states, toast on save.

## Consequences

- **Template:** New projects that copy `.cursor_inti` to `.cursor` get a default tech stack (Next.js, Tailwind, Zustand, Supabase, Clerk, etc.) and placeholder markdown files.
- **Editing:** Tech stack, libraries, and sources are editable via the page; changes are written to `.cursor/technologies/` only. No write API for `.cursor_inti/technologies/` (template is version-controlled).
- **Consistency:** Tech stack schema aligns with existing `.cursor_inti/configs/tech-stacks/*.json` (frontend, backend, tooling objects).

## References

- `src/app/technologies/page.tsx` — Technologies route
- `src/components/organisms/TechnologiesPageContent.tsx` — Page content and edit dialogs
- `src/app/api/data/technologies/route.ts` — GET/POST handler
- `src/components/organisms/SidebarNavigation.tsx` — Technologies nav item
- `.cursor_inti/technologies/tech-stack.json` — Template tech stack
- ADR 0004: KWCode restructuring — .cursor_inti and .cursor
