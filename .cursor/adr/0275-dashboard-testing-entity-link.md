# ADR 0275 — Dashboard: Testing in entity links row

## Status

Accepted.

## Context

- The Dashboard entity links row includes Projects, Ideas, Technologies, Prompts, Run, Documentation, Database, Configuration, Loading.
- The sidebar and command palette have "Go to Testing" (⌘⇧Y) and a dedicated `/testing` route; Run and Testing are paired elsewhere in the app.
- The Dashboard had no one-click Testing link, so users had to use the sidebar or command palette to reach the Testing page.

## Decision

- Add **Testing** to the `entityLinks` array in `DashboardOverview.tsx` so it appears in the same row as other entities.
- Place Testing **after Run** to match the Run/Testing pair used in the sidebar and command palette.
- Use `href: "/testing"`, label "Testing", icon `TestTube2`, and color `text-rose-600 dark:text-rose-400`.

## Consequences

- Users can open the Testing page from the Dashboard with one click, consistent with Run and other entity links.
- Dashboard entity order reflects the Run/Testing pairing used elsewhere in the app.
