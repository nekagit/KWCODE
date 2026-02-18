# ADR 0282 — Sidebar Design, Architecture, Planner nav items

## Status

Accepted.

## Context

- The app has redirect pages at `/design`, `/architecture`, and `/planner` (ADRs 0277, 0278) that redirect to the first active project's corresponding tab (or `/projects` with a toast when none selected).
- The Dashboard entity links row includes Design, Architecture, and Planner (ADRs 0278, 0279).
- The command palette NAV_ENTRIES include Design, Architecture, and Planner (ADR 0281).
- The sidebar **Work** section had only Projects, Prompts, Run, and Testing; users could not reach Design, Architecture, or Planner from the sidebar without using the command palette or Dashboard.

## Decision

- Add **Planner**, **Design**, and **Architecture** to the sidebar in the **Work** section.
- **Order:** After Testing: Planner (`/planner`, icon `ListTodo`), Design (`/design`, icon `Palette`), Architecture (`/architecture`, icon `Building2`).
- No new routes; reuse existing redirect pages.

## Consequences

- Users can open Planner, Design, and Architecture from the sidebar with one click, consistent with Run and Testing.
- Sidebar Work section aligns with command palette and Dashboard for these destinations.
- Active state for each item works when pathname is `/planner`, `/design`, or `/architecture` (during redirect or when the redirect page is shown).
