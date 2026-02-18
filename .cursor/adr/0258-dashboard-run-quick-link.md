# ADR 0258: Dashboard Run quick link in entity links

## Status

Accepted.

## Context

The Dashboard (home / overview) shows entity quick links for Projects, Ideas, Technologies, and Prompts, plus a "Database" link. The Run page is a first-class section (sidebar, ⌘⇧W, command palette "Go to Run") but had no one-click link from the Dashboard. Users had to use the sidebar or command palette to reach the Run page from the overview.

## Decision

Add a **Run** quick link to the Dashboard entity links:

- One new entry in the `entityLinks` array in `DashboardOverview.tsx`: `href: "/run"`, `label: "Run"`, `icon: Terminal`, `color: "text-orange-600 dark:text-orange-400"`.
- Place it after Prompts so the order is: Projects, Ideas, Technologies, Prompts, Run (consistent with app emphasis on the run/worker flow).
- Reuse the existing entity-link rendering; no new component.

## Consequences

- Users can open the Run page from the Dashboard with one click, without using the sidebar or ⌘K.
- Run is visually aligned with other main sections (Projects, Ideas, Technologies, Prompts) on the overview.
- Single file change; no new dependencies or store usage.
