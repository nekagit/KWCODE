# ADR 0067: Desktop (Tauri) — project link uses client-side navigation

## Status

Accepted.

## Context

In the desktop build (Tauri + static export), clicking a project on the Projects list (or a project card on the Dashboard) was navigating to the Dashboard (/) instead of opening project details (/projects/:id). The app uses Next.js `<Link href={/projects/${id}}>`; in the Tauri WebView this can trigger a full document navigation. The static export only includes a single dynamic route for `projects/[id]` via `generateStaticParams()` (e.g. `id: "new"`), so requesting `/projects/<uuid>` as a full load does not resolve to a static file and the asset protocol can end up serving the app root or a fallback, which shows the Dashboard.

## Decision

1. **Projects list**  
   In `ProjectsListPageContent`, when running in Tauri (`isTauri`), add an `onClick` on the project `<Link>` that calls `e.preventDefault()` and `router.push(\`/projects/${project.id}\`)` so navigation is always client-side. The Link keeps the same href for accessibility and non-Tauri (browser) behavior.

2. **Dashboard project cards**  
   Apply the same pattern in `DashboardOverview`’s `ProjectCard`: in Tauri, `onClick` on the project link prevents default and uses `router.push(\`/projects/${project.id}\`)`.

3. **Scope**  
   Only override link behavior when `isTauri` is true so the web app is unchanged.

## Consequences

- In the desktop app, opening a project from the Projects page or from the Dashboard correctly shows project details instead of the Dashboard.
- Web (browser) behavior is unchanged; Link continues to work as usual.
- All project entry points that could be used in desktop (list and dashboard) are consistent.

## References

- `src/components/organisms/ProjectsListPageContent.tsx` — project list link + Tauri onClick
- `src/components/molecules/DashboardsAndViews/DashboardOverview.tsx` — ProjectCard link + Tauri onClick
- `src/lib/tauri.ts` — isTauri
- ADR 0052 — Tauri static export and `generateStaticParams` for `projects/[id]`
