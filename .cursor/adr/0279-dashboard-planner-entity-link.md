# ADR 0279 — Dashboard: Planner in entity links row

## Status

Accepted.

## Context

- The Dashboard entity links row includes Projects, Ideas, Technologies, Prompts, Run, Testing (ADR 0275), Documentation, Database, Configuration, Loading.
- The app has a dedicated `/planner` redirect page (ADR 0277) and "Go to Planner" (⌘⇧J) in the command palette; Run, Testing, and Planner form the main work trio (Run tab, Testing tab, Planner tab on a project).
- The Dashboard had no one-click Planner link, so users had to use the sidebar, command palette, or shortcut to reach the Planner.

## Decision

- Add **Planner** to the `entityLinks` array in `DashboardOverview.tsx` so it appears in the same row as other entities.
- Place Planner **after Testing** to match the Run/Testing/Planner order used in the project tabs and command palette.
- Use `href: "/planner"`, label "Planner", icon `ListTodo`, and color `text-blue-600 dark:text-blue-400` (consistent with the Planner tab in project detail).

## Consequences

- Users can open the Planner (redirect to first active project's todo tab) from the Dashboard with one click, consistent with Run and Testing.
- Dashboard entity order reflects the Run/Testing/Planner work flow used elsewhere in the app.
