# ADR 011: Remove top navbar from dashboard

## Status

Accepted.

## Context

The dashboard (home) page had a top tab bar (TabsList) with Dashboard, Projects, Tickets, Feature, AI Generate, Data, Log. This duplicated navigation already provided by the app-shell left sidebar (ADR 009). Users wanted a single navigation surface: only the sidebar.

## Decision

- **Remove the top tab bar** from the dashboard page (`src/app/page.tsx`).
- **Keep** the `Tabs` and `TabsContent` so tab state and content still follow the `?tab=` URL; navigation is done only via the sidebar.
- **Remove** unused imports: `TabsList`, `TabsTrigger`.

## Consequences

- Single source of navigation: only the left sidebar.
- Less visual clutter and no duplicate nav on the dashboard.
- Tab content and URL behavior unchanged; sidebar links continue to switch views.
