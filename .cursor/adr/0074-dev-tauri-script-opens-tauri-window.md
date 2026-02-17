# ADR 0074: dev:tauri script opens Tauri window (wait vs full dev)

## Status
Accepted

## Context
`npm run dev:tauri` only ran the wait-dev-server script (checks that the Next.js dev server and chunks are ready, then exits). It never started the Tauri dev process, so the Tauri window did not open when running from the project Run section or CLI. The wait script was designed as Tauri’s `beforeDevCommand`; when run standalone, users expected the full “dev server + Tauri window” flow.

## Decision
- Introduce **`dev:tauri:wait`**: runs only `node script/wait-dev-server.mjs` (used as `beforeDevCommand` in `tauri.conf.json`).
- **`dev:tauri`**: runs `npm run dev:tauri:wait` then `node script/tauri-with-local-target.mjs dev`, so the Tauri window opens after the app is ready.
- Set **`beforeDevCommand`** in `tauri.conf.json` to `npm run dev:tauri:wait` so that `tauri dev` still runs only the wait step before opening; the full `dev:tauri` script is for one-shot “run dev + open Tauri” (e.g. IDE Run button).

## Consequences
- Running `npm run dev:tauri` (or the equivalent Run button) starts the wait logic and then opens the Tauri dev window.
- `tauri dev` (e.g. `npm run tauri -- dev`) continues to use the same wait script as beforeDevCommand, with no recursion.
