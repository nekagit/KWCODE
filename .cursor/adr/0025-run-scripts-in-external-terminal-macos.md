# ADR 0025: Run scripts in external Terminal on macOS

## Status

Accepted.

## Context

Users on macOS wanted clicking a script in the Run section (e.g. `dev:full`) to open the system Terminal (Terminal.app) and execute the command there, instead of running in-app with streamed output. Running in an external terminal gives a real TTY and keeps long-running processes (dev servers) in a dedicated window.

## Decision

- **macOS:** When the user clicks a script button in the Project tab Run section, the app first tries to open the system Terminal and run `cd <project_path> && npm run <script_name>` there via AppleScript (`tell application "Terminal" to do script "..."`). On success, show toast "Opened in Terminal." and do not create an in-app run.
- **Other platforms:** If the "external terminal" command is not supported (returns "External terminal is only supported on macOS"), the app falls back to the existing in-app run: `run_npm_script` with output in the same tab and optional "Open app" when localhost URL is detected.
- **New Tauri command:** `run_npm_script_in_external_terminal(project_path, script_name)` — macOS only; validates path and script name, then runs `osascript -e 'tell application "Terminal" to do script "cd '\''...'\'' && npm run ..."'`. Non-macOS returns an error so the frontend can fall back to in-app run.

## Implementation

- `src-tauri/src/lib.rs`: Added `run_npm_script_in_external_terminal` (same escaping as `open_implement_all_in_system_terminal`: path and command escaped for AppleScript). Registered in invoke handler.
- `src/store/run-store.ts`: Added `runNpmScriptInExternalTerminal(projectPath, scriptName)` returning `Promise<boolean>`; invokes the new command and returns true on success, false on error (and sets store error).
- `src/components/molecules/TabAndContentSections/ProjectProjectTab.tsx`: On script button click, call `runNpmScriptInExternalTerminal` first; if it returns true, toast "Opened in Terminal." and return. If false, if store error includes "only supported on macOS", call `runNpmScript` for in-app run; otherwise toast the error. Updated copy: "On macOS, each script opens in Terminal.app; on other platforms output appears below."

## Consequences

- On macOS, Run section script buttons open Terminal.app and run the command there; no in-app output or Stop button for that run.
- On Windows/Linux, behavior unchanged: script runs in-app with output and "Open app" when applicable.
- Users who prefer in-app run on macOS could be given an option later (e.g. modifier key or setting) to force in-app; not in scope for this ADR.
