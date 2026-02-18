# ADR 0263: Dashboard Configuration quick link in entity links

## Status

Accepted.

## Context

The Dashboard shows entity quick links for Projects, Ideas, Technologies, Prompts, Run, and Documentation. The Configuration page is a first-class section (sidebar, ⌘⇧O "Go to Configuration", command palette) but had no one-click link from the Dashboard. Users had to use the sidebar or command palette to reach Configuration from the overview.

## Decision

Add a **Configuration** quick link to the Dashboard entity links:

- One new entry in the `entityLinks` array in `DashboardOverview.tsx`: `href: "/configuration"`, `label: "Configuration"`, `icon: Settings`, `color: "text-green-600 dark:text-green-400"`.
- Place it after Documentation so the order is: Projects, Ideas, Technologies, Prompts, Run, Documentation, Configuration.
- Reuse the existing entity-link rendering; no new component.

## Consequences

- Users can open the Configuration page from the Dashboard with one click, without using the sidebar or ⌘K.
- Configuration is visually aligned with other main sections on the overview.
- Single file change; no new dependencies or store usage.
