# ADR 0193: Refactor — api-projects dual-mode helper

## Status

Accepted.

## Context

`src/lib/api-projects.ts` implements the project CRUD and related operations in dual mode: when running in Tauri it uses `invoke(cmd, args)`; in browser it uses `fetch` to Next.js API routes. Six functions repeated the same pattern: `if (isTauri) return invoke(...); else return fetchJson(...)`. This duplicated logic and made the contract (one Tauri command, one API path) implicit in each function.

## Decision

- Introduce an internal helper in `api-projects.ts`:
  - **`tauriOrFetch<T>(tauriCmd, tauriArgs, fetchUrl, fetchInit?)`**: returns `invoke<T>(tauriCmd, tauriArgs)` when `isTauri`, otherwise `fetchJson<T>(fetchUrl, fetchInit)`.
- Refactor the following functions to use `tauriOrFetch` with a single call each:
  - `getProjectResolved`
  - `listProjects`
  - `createProject` (keep the existing agent-log block; then call helper)
  - `updateProject`
  - `deleteProject`
  - `getProjectExport`
- Leave unchanged: `getFullProjectExport` (browser path does custom JSON.stringify), `readProjectFile`, `writeProjectFile`, `listProjectFiles`, `initializeProjectRepo`, and all analyze/queue functions (different branching or no 1:1 mapping).

## Consequences

- Less duplication: one place defines the Tauri-vs-API dual-mode contract for simple CRUD-style calls.
- Behaviour unchanged: same commands, same URLs, same request/response shapes; existing tests and callers unaffected.
- Future project API functions that follow the same pattern can use `tauriOrFetch` for consistency.
- Helper is file-private (not exported); no changes to other modules.
