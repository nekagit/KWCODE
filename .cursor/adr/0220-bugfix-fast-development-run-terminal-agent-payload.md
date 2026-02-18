# ADR 0220: Bugfix — Fast development "Failed to create ticket or start agent" (run_run_terminal_agent payload)

## Status

Accepted.

## Context

In the Worker tab’s **Fast development** flow, after creating a ticket and updating kanban state, the app starts the terminal agent via `runTempTicket`, which invokes the Tauri command `run_run_terminal_agent`. The frontend sends the payload in **camelCase**: `{ projectPath, promptContent, label }`. The Rust command was defined with **snake_case** parameters (`project_path`, `prompt_content`, `label`). Tauri/serde deserializes the invoke payload by matching JSON keys to parameter names; with no aliases, the camelCase keys did not match, causing deserialization to fail and the user to see "Failed to create ticket or start agent."

## Decision

- **Backend (Rust):** Introduce a `RunTerminalAgentArgs` struct with `#[serde(alias = "projectPath")]` for `project_path` and `#[serde(alias = "promptContent")]` for `prompt_content`, so the frontend’s camelCase payload deserializes correctly. Change `run_run_terminal_agent` to take a single `args: RunTerminalAgentArgs` parameter and destructure it inside the command.
- **Frontend:** Initially continued to send `{ projectPath, promptContent, label }`. In the **built** app, Tauri IPC expects the parameter key `args`, so the payload must be `{ args: { projectPath, promptContent, label } }`. See ADR 0227.

## Consequences

- Fast development flow works in Tauri dev and built app: ticket is created, kanban updated, and the terminal agent starts (or is queued) without invoke errors.
- Aligns with existing pattern (e.g. `ProjectIdArg` with `projectId` alias) for accepting camelCase from the frontend.
- Night shift and other `runTempTicket` / `runSetupPrompt` flows also require the `args` wrapper in the built app (ADR 0227).
