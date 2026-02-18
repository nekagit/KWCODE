# ADR 0293 — Sidebar Versioning nav item

## Status

Accepted.

## Context

- The app has a dedicated `/versioning` redirect page (ADR 0292) that redirects to the first active project's Versioning (Git) tab, or to /projects with a toast when no project is selected.
- The Dashboard has a Versioning entity link and the command palette offers "Go to Versioning" (⌘⇧U) with the same behaviour.
- The sidebar includes Run, Testing (ADR 0268), and Planner but had no direct link to Versioning; users had to use the Dashboard, command palette, or keyboard shortcut.

## Decision

- Add **Versioning** to the sidebar in the **Work** section.
- **Versioning:** `href="/versioning"`, label "Versioning", icon `FolderGit2` (consistent with Dashboard and command palette).
- Place after Planner so Work section order is: Projects, Prompts, Run, Testing, Planner, Versioning, Design, Architecture.
- No new routes; reuse existing `/versioning` redirect page.

## Consequences

- Users can open Versioning from the sidebar with one click, consistent with Run, Testing, and Planner.
- Sidebar navigation aligns with Dashboard and command palette for Versioning access.
- Active state for the Versioning item works when pathname is `/versioning` (during the redirect).
