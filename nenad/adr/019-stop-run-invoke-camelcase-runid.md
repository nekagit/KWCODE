# ADR 019: stop_run invoke use camelCase runId for Tauri 2

## Status
Accepted

## Context
Stopping a running process from the UI failed with:
`invalid args runId for command stop_run: command stop_run missing required key runId`.

The frontend was invoking the Tauri command with snake_case: `invoke("stop_run", { run_id: runId })`.

## Decision
Use camelCase for the invoke payload key: `invoke("stop_run", { runId })`.

Tauri 2 converts Rust parameter names from snake_case to camelCase for the JavaScript API, so the frontend must pass the camelCase key that Tauri expects.

## Consequences
- `stop_run` works when stopping a run from the app.
- Future Tauri command invokes in this project should use camelCase for argument keys (e.g. `runId`, not `run_id`) to match Tauri’s serialization.
