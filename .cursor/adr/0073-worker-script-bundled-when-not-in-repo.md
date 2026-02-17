# ADR 0073: Worker (run terminal agent) script bundled for Desktop app

## Status
Accepted

## Context
When KWCode is run from the Desktop (built app), `project_root()` fails because the app bundle is not inside the repo. The Worker tab’s “fast development” flow calls `run_run_terminal_agent`, which needs `script/worker/run_terminal_agent.sh`. That led to “FAILED TO START queued agent” because the script was not found.

## Decision
- Bundle `script/worker/run_terminal_agent.sh` in the Tauri app via `tauri.conf.json` → `bundle.resources` (mapped to `run_terminal_agent.sh` under the app’s resource directory).
- In `run_run_terminal_agent`: if `project_root()` succeeds, keep using repo script path and repo as current dir; if it fails (e.g. app run from Desktop), resolve the script with `app.path().resolve("run_terminal_agent.sh", BaseDirectory::Resource)` and use the resource directory (or temp) as current dir for spawning the script.
- `run_run_terminal_agent_script_inner` now takes `script_path` and `current_dir` instead of `ws`, so it can be driven either from the repo or from the bundle.

## Consequences
- Worker “Run terminal agent” / queued agent works when the app is launched from the Desktop (or anywhere outside the repo).
- No change when running from the repo (e.g. `tauri dev` or running the binary from the repo).
- One extra file is included in the app bundle (the shell script).
