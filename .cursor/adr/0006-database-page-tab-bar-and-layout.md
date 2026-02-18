# ADR 0006: Database page tab bar and layout

## Status

Accepted. Implemented 2025-02-18.

## Context

The Database view (home `?tab=all`) was only reachable from the sidebar. The home page had no visible tab bar, so switching between Dashboard, Projects, Prompts, Database, and DB Data felt like a "form" driven entirely by the sidebar and looked disjointed. The Database (All Data) content itself was a flat grid of cards with a plain text header that felt cramped and form-like.

## Decision

- **Home page tab bar**
  - Added a visible `TabsList` with `TabsTrigger` items (Dashboard, Projects, Prompts, Database, DB Data) on the home page, in the strip below the breadcrumb and action buttons.
  - Each trigger includes an icon (LayoutDashboard, FolderOpen, MessageSquare, LayoutGrid, Database) and uses existing tab URL semantics (`?tab= dashboard|projects|prompts|all|data`). List uses `flex flex-wrap` and `w-full sm:w-auto` so it works on small screens.

- **Database (All Data) page layout**
  - Replaced the plain "Database" heading block with a clear page header: rounded panel with gradient background (`from-muted/40 via-background to-primary/5`), icon badge (LayoutGrid in a rounded box), and short description ("Your central data hub"). This presents the view as a dashboard, not a form.
  - Kept the four section cards (Projects, Prompt records, Ideas, Design) in the same responsive grid; normalized copy (e.g. "PromptRecords" → "Prompt records", shorter Design subtitle) and fixed class index for the Design description paragraph (classes[9]).
  - Removed unused imports (Link, TicketIcon, TicketRow, Project, TicketsDisplayList).

## Consequences

- Users can switch to Database (and other home tabs) from the page itself via a clear tab bar, reducing reliance on the sidebar and improving discoverability.
- The Database page reads as a dedicated data overview with a proper header and consistent card grid.
- No change to URLs, tab values, or data contracts; only presentation and navigation on the home and All Data views.
