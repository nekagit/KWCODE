# ADR 0227: run_run_terminal_agent — args payload in built version (night shift / temp ticket)

## Status

Accepted.

## Context

In the **built** Tauri app, starting **night shift** agents (or any flow that uses `runTempTicket` / `run_run_terminal_agent`) failed to start the agent. The Rust command `run_run_terminal_agent` takes a single parameter `args: RunTerminalAgentArgs`. In the built app, Tauri IPC expects the payload to use the **parameter name** as the top-level key: `args`. The frontend was sending a flat object `{ projectPath, promptContent, label }`, which does not match.

## Decision

- Use the payload shape **`{ args: { projectPath, promptContent, label } }`** for the Tauri command `run_run_terminal_agent`.
- Added **`runRunTerminalAgentPayload(projectPath, promptContent, label)`** in `@/lib/tauri` that returns this shape.
- Updated **run-store.ts** to use it in:
  - `processTempTicketQueue` (night shift, fast development, debugging, etc.)
  - `runSetupPrompt`
- ADR 0220 updated to reference this built-version requirement.

## Consequences

- Night shift and all terminal-agent flows (temp ticket, setup prompt) work in the built app.
- Single payload helper for `run_run_terminal_agent` keeps the shape consistent.
