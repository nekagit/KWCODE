# ADR: Design and Documentation page in Tools section

## Date
2026-02-13

## Status
Accepted

## Context
Ticket #3 requested a “Design and Documentation” presence within the tools section. The app already had `/design` and `/documentation` routes and organisms, but they were not discoverable under the sidebar Tools section (which listed Testing, Architecture, Database, Ideas). The Design page used a generic empty placeholder and did not follow the same layout and UX patterns as other tool pages (PageHeader, shared container, organism classes).

## Decision
- **Navigation:** Add “Design” and “Documentation” to the Tools section in `SidebarNavigation.tsx`, with icons Palette and FileText respectively, so both pages are reachable under Tools.
- **Design page alignment:** Replace the Design page’s `EmptyPagePlaceholder` with a proper tools-style layout: `PageHeader` (title, description, icon), same container/layout classes as Documentation and Testing (`min-h-screen`, `container`, `max-w-7xl`, `animate-fade-in`), and a short placeholder content block. Add `DesignPageContent.tsx` to `tailwind-organisms.json` for consistent styling.
- **Documentation page:** No structural change; it already used `PageHeader` and shared layout; only its entry in the Tools nav was added.
- **No new routes:** Reuse existing `/design` and `/documentation` routes; no new backend commands or API routes.

## Consequences
- Design and Documentation are discoverable from the Tools section and align with existing configuration and UX standards.
- Design page matches the same layout and header pattern as Documentation and Testing for consistency.
- Future expansion (e.g. design templates, doc tabs) can build on this structure without further nav changes.