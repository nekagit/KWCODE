# ADR 0260: Dashboard Documentation quick link in entity links

## Status

Accepted.

## Context

The Dashboard (home / overview) shows entity quick links for Projects, Ideas, Technologies, Prompts, and Run. The Documentation page is a first-class section (sidebar, ⌘⇧D "Go to Documentation", command palette "Go to first project Documentation") but had no one-click link from the Dashboard. Users had to use the sidebar or command palette to reach the Documentation page from the overview.

## Decision

Add a **Documentation** quick link to the Dashboard entity links:

- One new entry in the `entityLinks` array in `DashboardOverview.tsx`: `href: "/documentation"`, `label: "Documentation"`, `icon: BookOpen`, `color: "text-sky-600 dark:text-sky-400"`.
- Place it after Run so the order is: Projects, Ideas, Technologies, Prompts, Run, Documentation.
- Reuse the existing entity-link rendering; no new component.

## Consequences

- Users can open the Documentation page from the Dashboard with one click, without using the sidebar or ⌘K.
- Documentation is visually aligned with other main sections on the overview.
- Single file change; no new dependencies or store usage.
