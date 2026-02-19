# ADR 0319 — Bugfix: Project detail prev/next navigation — avoid redirect to dashboard

## Status

Accepted.

## Context

- On the **project details** page (overview header), **Previous project** and **Next project** are shown as left/right arrow buttons beside the project title. They were implemented as `<Link href={/projects/${prevId}}>` and `<Link href={/projects/${nextId}}>`. When the user clicked them (especially in Tauri/static export), they were sometimes sent back to the **dashboard** instead of staying on the project details for the adjacent project.

## Root cause

- Using `<Link>` for prev/next caused a **full document navigation** in some environments (e.g. Tauri webview with static export). The request for `/projects/<id>` can 404 or be served as the app’s fallback (e.g. `index.html`), so the user effectively lands on the home/dashboard instead of the project detail route.

## Decision

1. **Use client-side navigation for prev/next**
   - In `ProjectDetailsPageContent.tsx`, replace the prev/next **Link** components with **button** elements that call `router.push(...)` so navigation stays inside the Next.js client-side router and does not trigger a full page load.

2. **Preserve current tab**
   - When navigating to previous/next project, include the current tab in the URL when set (e.g. `/projects/{id}?tab=worker`), so the user stays on the same tab (e.g. Worker, Planner) after switching project.

3. **No change to “All projects”**
   - The existing “All projects” **Link** to `/projects` is unchanged; it remains a normal link.

## Consequences

- Clicking Previous/Next project keeps the user on the project details page for the adjacent project instead of redirecting to the dashboard.
- Tab (e.g. Worker, Milestones) is preserved when switching projects.
- Navigation remains SPA-style and works reliably in Tauri and static export.
