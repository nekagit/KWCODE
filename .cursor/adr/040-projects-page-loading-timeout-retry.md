# ADR 040: Projects page – loading timeout and retry

## Status

Accepted.

## Context

The Projects page (`/projects`) loads the project list via `listProjects()` (browser: `fetch("/api/data/projects")`, Tauri: `invoke("list_projects")`). If the request never resolves (e.g. dev server down, Tauri backend slow or stuck), the page stayed in a loading state indefinitely with no way to recover.

## Decision

1. **Timeout**  
   In the initial-load `useEffect`, run a 15-second timeout. If `listProjects()` has not settled by then, set `loading` to `false` and set an error message so the user sees a clear message instead of an endless spinner.

2. **Clear timeout on settle**  
   When the promise resolves or rejects, clear the timeout in `finally` and set loading to false as before. On unmount, clear the timeout in the effect cleanup.

3. **Retry on error**  
   When `error` is set, show the message and a "Retry" button that clears the error, sets loading true, calls `listProjects()` again, and clears loading in `finally`.

## Consequences

- Users are no longer stuck on a perpetual loading state; after 15 seconds they see an error and can retry.
- Retry gives a way to recover without a full page refresh.
- Error message hints at environment (browser: dev server; Tauri: data/projects.json readable).
