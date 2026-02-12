# Architecture

## Name and category

**Layered + REST**. The app uses a thin layered structure with a REST-style API and an optional native shell (Tauri). Categories: **rest**, **dry**, **kiss**, **solid** (moderate).

## Description

- **Frontend**: Next.js 15 App Router. Pages under `src/app/`; shared UI in `src/components/`; types in `src/types/`; client-side state in Zustand (`src/store/run-store.ts`) and React state; lib utilities and API helpers in `src/lib/`.
- **Data access**: Two modes. (1) **Browser**: Next.js API routes read/write `data/*.json` and proxy to generate endpoints. (2) **Tauri**: Frontend calls `invoke("command_name", payload)`; Rust backend in `src-tauri/` uses SQLite (`data/app.db`) and file system for scripts/config. Same UI, different data source by environment.
- **API**: REST-style. `GET/POST /api/data`, `GET/POST/DELETE /api/data/{resource}/[id]`, `POST /api/generate-*` for AI. No GraphQL; no formal API versioning.
- **Run automation**: Tauri spawns shell scripts (`script/run_prompts_all_projects.sh`), streams log lines via events, and tracks run state; frontend subscribes via store and optional events.

## Main practices

- **Single source of truth per screen**: Projects from API/Tauri; tickets/features from same backend or `/api/data` in browser.
- **Run state centralized**: Zustand store holds projects, prompts, timing, running runs, feature queue; pages use `useRunState()`.
- **Type sharing**: TypeScript types in `src/types/` used by app, API route handlers, and (where applicable) Tauri payloads.
- **No server-side session**: Stateless API; no auth or user session in current design.

## When to use / scenarios

- **Adding a new “data” entity**: Add type in `src/types/`, JSON schema or DB in Tauri, API route under `src/app/api/data/<entity>/`, and optionally a generate route under `src/app/api/generate-<entity>/`.
- **Adding a new page**: Add route under `src/app/`, use `AppShell` (layout), and reuse `src/components/ui/` and `src/lib/` as needed.
- **Tauri-only behavior**: Implement command in `src-tauri/src/lib.rs`, expose via capability, call from frontend with `invoke()`.

## References

- Next.js App Router: [nextjs.org/docs/app](https://nextjs.org/docs/app)
- Tauri v2: [tauri.app](https://tauri.app)
- Zustand: [github.com/pmndrs/zustand](https://github.com/pmndrs/zustand)

## Anti-patterns to avoid

- **Mixing Tauri and API in the same flow without env checks**: Use `isTauri()` / `isTauriEnv` and branch; don’t assume one backend.
- **Putting business logic in page components**: Prefer `src/lib/` or store actions so logic can be reused and tested.
- **New global state without going through the store**: Run-related state should live in the run store to avoid duplicate sources.
- **Synchronous file access in API routes**: Prefer async reads; avoid blocking the event loop.

## Brief examples

**Calling the backend by environment:**

```ts
// Tauri: invoke backend
if (isTauri()) {
  const list = await invoke<Project[]>("get_projects");
}
// Browser: fetch API
else {
  const res = await fetch("/api/data/projects");
  const list = await res.json();
}
```

**Run state (Zustand):**

```ts
const { activeProjects, runWithParams, runningRuns } = useRunState();
await runWithParams({ promptIds, activeProjects, runLabel: "My run" });
```

**Adding a data API route:**

- Create `src/app/api/data/my-resource/route.ts` (GET list) and `src/app/api/data/my-resource/[id]/route.ts` (GET/PUT/DELETE one). Return JSON; read/write from `data/` or delegate to Tauri if needed.
