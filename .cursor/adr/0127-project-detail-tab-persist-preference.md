# ADR 0127 — Project detail: Persist tab preference

## Status

Accepted.

## Context

The project detail page (`/projects/[id]`) has multiple tabs (Project, Frontend, Worker, Planner, Control, etc.). When the user navigated to a project without a `?tab=` query, the app always showed the default "Worker" tab. Other surfaces (Dashboard/Home, Ideas, Projects list, Prompts) persist and restore tab or view preferences; project detail did not, so returning to a project did not restore the last tab the user had open.

## Decision

- **New lib** — **`src/lib/project-detail-tab-preference.ts`**: Storage key prefix `kwcode-project-tab-` + sanitized project ID. Valid tab values match the project detail tabs (project, frontend, backend, testing, documentation, ideas, milestones, todo, worker, control, git). Export **`getProjectDetailTabPreference(projectId)`** and **`setProjectDetailTabPreference(projectId, tab)`**. SSR-safe (return default when `window` is undefined).
- **ProjectDetailsPageContent**: (1) When there is no `?tab=` in the URL, a **useEffect** reads the saved tab for the current project and sets **activeTab** so the last tab is restored. (2) When the user changes tab (**onValueChange**), call **setProjectDetailTabPreference(projectId, v)** to persist. The URL is not updated (stays `/projects/[id]` unless the user deep-links with `?tab=`).
- Deep links with `?tab=` continue to take precedence over the stored preference.

## Consequences

- Returning to a project without a tab query restores the last selected tab for that project, matching the UX of Dashboard, Ideas, and other pages.
- Preference is stored per project in localStorage; no backend or API changes. Direct links with `?tab=...` continue to work and take precedence.
