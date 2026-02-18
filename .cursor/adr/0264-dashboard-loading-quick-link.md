# ADR 0264: Dashboard Loading quick link in entity links

## Status

Accepted.

## Context

The Dashboard shows entity quick links for Projects, Ideas, Technologies, Prompts, Run, Documentation, and Configuration. The Loading page (/loading-screen) is a first-class section (sidebar, ⌘⇧L "Go to Loading", command palette) but had no one-click link from the Dashboard. Users had to use the sidebar or command palette to reach the loading screen from the overview.

## Decision

Add a **Loading** quick link to the Dashboard entity links:

- One new entry in the `entityLinks` array in `DashboardOverview.tsx`: `href: "/loading-screen"`, `label: "Loading"`, `icon: Moon`, `color: "text-indigo-600 dark:text-indigo-400"`.
- Place it after Configuration so the order is: Projects, Ideas, Technologies, Prompts, Run, Documentation, Configuration, Loading.
- Reuse the existing entity-link rendering; no new component.

## Consequences

- Users can open the Loading page from the Dashboard with one click, without using the sidebar or ⌘K.
- Loading is visually aligned with other main sections on the overview.
- Single file change; no new dependencies or store usage.
