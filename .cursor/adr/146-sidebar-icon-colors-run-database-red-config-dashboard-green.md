# ADR 146: Sidebar and FAB icon colors — Run/Database red, Configuration/Dashboard green

## Status

Accepted.

## Context

Users requested clearer visual grouping for sidebar and quick-action icons: Run and Database should appear in red; Configuration and Dashboard in green.

## Decision

- **Red (destructive)** for Run and Database:
  - Sidebar: Run and Database nav items use `iconClassName: "text-destructive/90"`.
  - Quick-actions FAB: Run action uses `iconClassName: "text-destructive/90"`.

- **Green (success)** for Configuration and Dashboard:
  - Sidebar: Dashboard nav item and Configuration nav item use `iconClassName: "text-success/90"`.
  - Quick-actions FAB: Configuration action uses `iconClassName: "text-success/90"`.

- **Files updated**
  - `src/components/organisms/SidebarNavigation.tsx`: `dashboardNavItem`, Database in `toolsNavItems`, Run and Configuration in `bottomNavItems`.
  - `src/context/quick-actions-context.tsx`: `FAB_ACTIONS` for Run and Configuration.

## Consequences

- Run and Database are consistently red across sidebar and FAB; Configuration and Dashboard are green, improving scanability and semantic grouping (action/risk vs. setup/overview).
