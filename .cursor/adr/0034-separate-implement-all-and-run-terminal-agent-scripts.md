# ADR 0034: Separate Implement All script and Run terminal agent script

## Status

Accepted.

## Context

Previously a single script (`script/implement_all.sh`) and a single Tauri command (`run_implement_all`) were used for (1) Implement All (3 slots, worker + tickets), (2) Implement All for tickets, (3) Run terminal agent to fix (debugging), (4) Setup prompt, and (5) all runTempTicket flows (ideas, analyze, generate ticket, etc.). Users wanted clear separation: one script dedicated to Implement All, and a separate script for “Run terminal agent to fix” (debugging) and other single-prompt runs.

## Decision

- **Implement All only** → `script/implement_all.sh` and Tauri `run_implement_all`. Used for: Implement All (3 slots with worker prompt), Implement All for tickets (N slots with per-ticket prompts). Script accepts `-P` project path, optional `-S 1|2|3`, optional `-F` prompt file.
- **Single-prompt terminal agent** → `script/run_terminal_agent.sh` and Tauri `run_run_terminal_agent`. Used for: Run terminal agent to fix (debugging), Setup prompt, runTempTicket (Improve idea, Generate ticket, Analyze, etc.). Script accepts `-P` project path and `-F` prompt file (required).

## Implementation

- **script/run_terminal_agent.sh**: New script. Single run: cd to project, run agent with prompt from file. No slot; minimal banner “Run terminal agent (single run)”.
- **src-tauri/src/lib.rs**: Added `run_terminal_agent_script_path`, `run_run_terminal_agent_script_inner`, and `#[tauri::command] run_run_terminal_agent(project_path, prompt_content, label)`. Registered command.
- **src/store/run-store.ts**: `runSetupPrompt` and `runTempTicket` now call `invoke("run_run_terminal_agent", { projectPath, promptContent, label })` instead of `run_implement_all`.
- **Implement All** and **runImplementAllForTickets** unchanged: they still call `run_implement_all` and use `implement_all.sh`.

## Consequences

- Implement All and “Run terminal agent to fix” / Setup / temp tickets use different scripts and Tauri commands; intent is clear and scripts can evolve independently.
- Debugging “Run terminal agent to fix” no longer goes through the Implement All script or banner.
