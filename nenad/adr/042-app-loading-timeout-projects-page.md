# ADR 042: App and projects page loading timeouts

## Status

Accepted.

## Context

When the app or the Projects page depended on a network/backend call that never resolved (e.g. dev server down, Tauri backend slow, or `/api/data` / `list_projects` hanging), the UI could stay in a loading state indefinitely. The run store hydration had a 10s safety timeout only when `isTauriEnv === true`; in browser, if `fetch("/api/data")` hung, `loading` was never cleared. The Projects page had a 15s timeout, which was long for quick feedback.

## Decision

1. **Run store hydration – unified safety timeout**  
   In `run-store-hydration.tsx`, apply the “force `loading` to false after 10s” logic whenever `isTauriEnv !== null` (both browser and Tauri), not only when `isTauriEnv === true`. So if `refreshData()` hangs in either environment, the app shell stops blocking after 10 seconds.

2. **Projects page – shorter timeout**  
   Reduce the initial load timeout on the Projects page from 15s to 8s so users see the timeout error and Retry sooner when the projects request does not complete.

## Consequences

- The app no longer stays on a full-screen loading spinner forever in browser when `/api/data` hangs; after 10s the shell renders and the user can navigate.
- Tauri behavior is unchanged (10s safety was already in place; now expressed in one effect for both environments).
- The Projects page shows a timeout message and Retry after 8s instead of 15s when `listProjects()` does not resolve.
