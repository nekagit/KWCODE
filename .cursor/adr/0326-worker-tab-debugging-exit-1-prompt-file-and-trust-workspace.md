# ADR 0326 — Worker tab Debugging: fix agent exit 1 (prompt file path + Cursor CLI trust workspace)

## Status

Accepted.

## Context

- In the Worker tab, clicking **Debugging** ("Run terminal agent to fix") started the agent then the run showed **Failed (exit 1)** in the terminal slot.
- The flow uses `run_run_terminal_agent`: Rust writes the prompt to a temp file, invokes `script/worker/run_terminal_agent.sh` with `-P` (project path) and `-F` (prompt file path), and the script runs the Cursor CLI with `--mode=debug -p "<content>"`.
- Two likely causes:
  1. **Prompt file**: The prompt file was written under `std::env::temp_dir()`. In some environments (e.g. built app, sandbox), the child process may not have access to that path, so the script’s `-F` check or `cat "$PROMPT_FILE"` could fail and exit 1.
  2. **Trust workspace**: The Cursor CLI may require the workspace to be trusted (e.g. `-F` flag) when running in debug/plan/ask mode to apply changes; without it the agent can exit with code 1.

## Decision

1. **Prompt file in project directory**  
   - In `run_run_terminal_agent_script_inner`, write the prompt file under the **project path** as `.kwcode_run_prompt_<run_id>.txt` instead of under `std::env::temp_dir()`.  
   - Pass that path to the script as `-F`. The script already `cd`s to the project and the file is removed after reading, so the run is self-contained and the child can always read the file.

2. **Cursor CLI trust workspace**  
   - In `run_terminal_agent.sh`, when invoking the Cursor CLI, pass **`-F`** (trust workspace) in addition to `-p` so the agent can modify the project.  
   - Use: `"$AGENT_CMD" --mode="$MODE" -F -p "$ESCAPED"` when `MODE` is set, and `"$AGENT_CMD" -F -p "$ESCAPED"` when not (normal agent).

## Implementation

- `src-tauri/src/lib.rs`: In `run_run_terminal_agent_script_inner`, set prompt path to `Path::new(&project_path).join(format!(".kwcode_run_prompt_{}.txt", run_id))`, write the file there, and pass that path to the script. Improve error message on write failure.
- `script/worker/run_terminal_agent.sh`: Add `-F` to both agent invocations (with and without `-M`).

## Consequences

- Debugging (and other Worker flows using `run_terminal_agent.sh`) no longer depend on the process being able to read the app’s temp directory.
- The Cursor CLI is explicitly run with workspace trust, which should prevent exit 1 when the agent tries to apply fixes in debug/plan/ask mode.
- The prompt file is created inside the project directory and removed by the script after read; no extra cleanup in Rust is required.
