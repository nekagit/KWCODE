# ADR 0031: Agent --trust flag for scripted runs

## Status

Accepted

## Context

- The Cursor agent CLI requires workspace trust before running. When invoked non-interactively (e.g. from the app’s Implement All or Debugging “Run terminal agent to fix”), it prints “WORKSPACE TRUST REQUIRED” and suggests running interactively or passing `--trust`, `--yolo`, or `-f`.
- App-triggered runs (Tauri script and API agent-runner) run the agent with a prompt and no stdin, so the trust prompt would block forever and the user would see no progress.

## Decision

- **Scripted runs with a prompt:** Always pass `--trust` to the agent when the app runs it with `-p "<prompt>"`.
- **script/implement_all.sh:** Use `agent --trust -p "$ESCAPED"` when a prompt file is provided (`-F`).
- **src/lib/agent-runner.ts:** Use `agent --trust -p "$(cat "$TMPFILE")"` for server-side prompt runs.
- **Interactive runs:** When the script is run with no prompt file, keep `agent` with no flags so the user can answer the trust prompt if needed.

## Consequences

- Implement All (with worker/ticket prompt), Debugging “Run terminal agent to fix”, and any API route that runs the agent will proceed without blocking on the trust prompt.
- The user has already chosen to run from the app for that project path; passing `--trust` reflects that choice. For stricter control, the user would run `agent` manually in a terminal.

## References

- `script/implement_all.sh` — `agent --trust -p` when `-F` is set
- `src/lib/agent-runner.ts` — `--trust` in spawn command
