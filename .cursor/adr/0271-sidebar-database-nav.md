# ADR 0271 — Sidebar Database nav item

## Status

Accepted.

## Context

- The home page (/) has tabs: dashboard, projects, prompts, all (Database), data (page-title-context: "Database" for tab "all").
- The command palette offers "Go to Database" (⌘⇧G) linking to `/?tab=all`.
- The Dashboard entity links include a Database link to `/?tab=all`.
- The sidebar had no direct link to the Database view; users had to open Dashboard then switch to the "all" tab or use the command palette.

## Decision

- Add **Database** to the sidebar in the **Tools** section.
- **Database:** `href="/?tab=all"`, label "Database", icon `LayoutGrid` (consistent with Dashboard and command palette).
- Use `tab: "all"` so the sidebar highlights this item when pathname is "/" and search param `tab=all`.
- Place after Documentation so Tools section order is: Ideas, Technologies, Documentation, Database.

## Consequences

- Users can open the Database view from the sidebar with one click, consistent with Run and Testing in the Work section.
- Sidebar navigation aligns with Dashboard and command palette for Database access.
- Active state shows when the user is on the Database tab (/?tab=all).
