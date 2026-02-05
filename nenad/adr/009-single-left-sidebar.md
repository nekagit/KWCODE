# ADR 009: Single left sidebar

## Status

Accepted.

## Context

The app had two navigation surfaces: (1) the app-shell left sidebar (Dashboard, Prompts, Configuration) and (2) a second sidebar or tab bar on the dashboard page (Dashboard, Prompts & timing, Projects, Tickets, Feature, AI Generate, Data, Log). This was confusing and used extra horizontal space.

## Decision

- **Single sidebar**: All navigation lives in one left sidebar provided by the app shell.
- **App-shell sidebar** now includes:
  - Dashboard (home)
  - Prompts & timing (/?tab=prompts)
  - Projects (/?tab=projects)
  - Tickets (/?tab=tickets)
  - Feature (/?tab=feature)
  - AI Generate (/?tab=ai-generate)
  - Data (/?tab=data)
  - Log (/?tab=log)
  - Prompts (page) (/prompts)
  - Configuration (/configuration)
- **Dashboard page** no longer renders its own sidebar or tab list. The current view is driven by the URL query `tab` (e.g. `/?tab=tickets`). The app-shell sidebar highlights the active item using pathname and `tab` param.
- **Prompts & timing** tab content was added on the dashboard so the sidebar link has a dedicated view.

## Consequences

- One consistent place for navigation; no duplicate sidebars.
- Browser back/forward and bookmarking work per tab via `?tab=`.
- Dashboard page is simpler (no TabsList/aside); content only.
