# ADR 0332 — Worker agents: require Tauri and clearer errors

## Status

Accepted.

## Context

- Worker agents (Asking, Plan, Fast development, Debugging, Night shift) call the Tauri command `run_run_terminal_agent`, which spawns `script/worker/run_terminal_agent.sh` and the Cursor CLI. This only works in the Tauri desktop app.
- In the browser (e.g. Next.js dev server), `invoke()` is not available, so runs failed with a generic "Tauri invoke API not available" and the toast "Failed to start queued agent." without explaining that the desktop app is required.
- Backend did not validate `project_path` before writing the prompt file, so empty or invalid paths could produce obscure failures.
- When the backend returned an error (e.g. script not found, project root not found), the frontend toast did not show that message.

## Decision

1. **Guard when not in Tauri**  
   - In `runTempTicket` and `runSetupPrompt`, if `!isTauri`, do not add to queue / do not invoke; set store error and show a toast: "Worker agents require the desktop app. Run the app with Tauri (from the repo or install the desktop build)." and return `null`.

2. **Surface backend error in toast**  
   - In `processTempTicketQueue` catch block, show the actual error in the toast when present: `toast.error(errMsg ? \`Failed to start agent: ${errMsg}\` : "Failed to start queued agent.")` so users see messages like "Project path is not a directory" or "Run terminal agent script not found".

3. **Validate project path in Rust**  
   - At the start of `run_run_terminal_agent`, require `project_path` to be non-empty and to be an existing directory; return `Err("Project path is required.")` or `Err("Project path is not a directory or does not exist: ...")` otherwise.

4. **Worker tab banner when not Tauri**  
   - In `ProjectRunTab`, when `!isTauri`, render a banner at the top of the Worker content: "Worker agents require the desktop app. Run the app with Tauri (e.g. npm run tauri dev from the repo or install the desktop build) to use Asking, Plan, Fast development, Debugging, and Night shift."

## Implementation

- `src/store/run-store.ts`: Early return in `runTempTicket` and `runSetupPrompt` when `!isTauri` with message and toast; in `processTempTicketQueue` catch, include `errMsg` in toast.
- `src-tauri/src/lib.rs`: In `run_run_terminal_agent`, trim `project_path`, check non-empty, then `PathBuf::from(project_path).is_dir()`; return clear `Err` and convert to `String` for the rest of the function.
- `src/components/molecules/TabAndContentSections/ProjectRunTab.tsx`: Conditional banner when `!isTauri` above WorkerStatusBar.

## Consequences

- Users in the browser see an explicit explanation and banner instead of a generic failure.
- Users in the desktop app see the real backend error when something goes wrong (bad path, missing script, etc.).
- Invalid or empty project path is rejected by the backend with a clear message.
