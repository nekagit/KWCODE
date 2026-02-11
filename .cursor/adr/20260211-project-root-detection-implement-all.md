# ADR 20260211: Project root detection uses implement_all.sh

## Status
Accepted

## Context
Project root was detected by checking for `script/run_prompts_all_projects.sh` and `data/`. Those scripts were removed; the repo now uses `script/implement_all.sh`. The app failed to find the project root and showed: "Project root not found. Run the app from the repo root (contains script/run_prompts_all_projects.sh and data/)."

## Decision
- Update `is_valid_workspace()` in `src-tauri/src/lib.rs` to require `script/implement_all.sh` and `data/` instead of `script/run_prompts_all_projects.sh`.
- Update the error message to reference `script/implement_all.sh` and `data/`.

## Consequences
- The app finds the repo root when run from the repo that contains `script/implement_all.sh` and `data/`.
- No change to `script_path()` (still points to the old script name); callers that use it may need separate updates if that flow is still used.
