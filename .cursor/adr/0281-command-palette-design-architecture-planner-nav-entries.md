# ADR 0281 — Command palette: Design, Architecture, Planner as navigation entries

## Status

Accepted.

## Context

- The command palette (⌘K) has two kinds of entries: **navigation** (NAV_ENTRIES — links to top-level routes) and **actions** (e.g. "Go to Run", "Go to Design").
- NAV_ENTRIES included Run, Testing, Database, Documentation, Configuration, Loading but not Design, Architecture, or Planner.
- The app has redirect pages at `/design`, `/architecture`, `/planner` (ADRs 0277, 0278) and actions "Go to Design", "Go to Architecture", "Go to Planner" that navigate to those URLs. Users could reach these only via actions, not by selecting a nav item in the palette list.

## Decision

- Add **Planner**, **Design**, and **Architecture** to NAV_ENTRIES in `CommandPalette.tsx` so they appear in the palette’s navigation list alongside Run and Testing.
- Order: after Testing insert Planner (`/planner`, ListTodo), Design (`/design`, Palette), Architecture (`/architecture`, Building2), then Database. Icons were already imported.
- Keep existing "Go to Planner", "Go to Design", "Go to Architecture" actions unchanged (they remain for users who search by "Go to …").

## Consequences

- Users can open the command palette and select "Planner", "Design", or "Architecture" from the nav list (same flow as "Run" and "Testing"), improving consistency and discoverability.
- Nav list aligns with Dashboard entity links and redirect pages (Run, Testing, Planner, Design, Architecture).
- Single file change; no new lib or route.
