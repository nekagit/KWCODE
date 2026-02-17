# ADR 0054: Dashboard overview — projects and entities

## Status
Accepted

## Context
The dashboard page showed only metric cards, quick actions, and ticket board. Users needed a single, visually clear overview of projects and other entities (tickets, prompts, designs, ideas, technologies) from the navigation dashboard.

## Decision
- Add a **DashboardOverview** component on the dashboard tab that:
  - Renders a hero strip with key metrics (projects, tickets, prompts, designs) and gradient styling.
  - Provides quick links to Projects, Ideas, Technologies, Prompts, and Database.
  - Lists up to 6 projects as cards with entity counts (tickets, prompts, ideas) and links to project details.
- Replace the standalone "Metrics" section (DashboardMetricsCards) in `DashboardTabContent` with this overview to avoid duplication and improve usefulness.
- Reuse existing APIs: `get_dashboard_metrics` (Tauri) / `GET /api/data/dashboard-metrics`, and `listProjects()`.

## Consequences
- Dashboard tab is the main entry for projects and entities at a glance.
- Single place for overview metrics, entity navigation, and project list; QuickActions and TicketBoard remain below.
- DashboardMetricsCards is no longer used on the dashboard tab but remains available for reuse elsewhere if needed.
