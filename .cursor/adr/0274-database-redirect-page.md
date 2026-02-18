# ADR 0274 — Database redirect page /database

## Status

Accepted.

## Context

- Run and Testing have dedicated redirect pages: `/run` and `/testing` redirect to the first active project's Worker or Testing tab.
- The Database view (Dashboard "all" tab) was only reachable via `/?tab=all`; there was no top-level `/database` route.
- Sidebar, command palette, and Dashboard linked directly to `/?tab=all`, which is less consistent with Run and Testing (which use `/run` and `/testing`).

## Decision

- Add a **Database redirect page** at **/database** that redirects to `/?tab=all` on mount (client-side, same pattern as `/run` and `/testing`).
- Point all Database entry points to **/database** instead of `/?tab=all`:
  - **Sidebar:** Database nav item `href="/database"`; keep active when pathname is `/database` or when on home with `tab=all`.
  - **Command palette:** NAV_ENTRIES Database href `/database`; Go to Database shortcut (⌘⇧G) navigates to `/database`.
  - **Dashboard:** Database entity link href `/database`.
- Add `/database` to the page title map so the document title is "Database" during the brief redirect.

## Consequences

- Users can bookmark or share the URL `/database`; it behaves like `/run` and `/testing` as a canonical top-level route.
- Sidebar, palette, and Dashboard use a single canonical URL for the Database view.
- No change in behaviour for the Database tab content; only the URL and entry points are unified.
