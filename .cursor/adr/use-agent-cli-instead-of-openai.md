# ADR: Use agent CLI instead of OpenAI for doc analysis and generation

## Status

Accepted (2026-02-12)

## Context

The app previously used the OpenAI API (and `OPENAI_API_KEY`) for:

- Project doc analysis (analyze-project-doc)
- Improving raw ideas (improve-idea)
- Generating tickets, ideas, architectures, prompts, and full project-from-idea

The codebase already runs an `agent` CLI with `agent -p "<prompt>"` for interactive and scripted flows (e.g. `script/run_prompt.sh`, `script/implement_all.sh`). Users requested to use this agent as much as possible throughout the app instead of the OpenAI key, so that a single agent (e.g. Cursor CLI or local model) handles all LLM tasks without exposing or requiring an API key in the app.

## Decision

1. **Shared agent runner**  
   - New server-only module: `src/lib/agent-runner.ts`.  
   - `runAgentPrompt(projectPath: string, promptText: string): Promise<string>` writes the prompt to a temp file, runs `agent -p "$(cat tempFile)"` in the given project directory (via `bash -c`), and returns stdout.  
   - Env: `AGENT_CLI_PATH` optional (default `agent`). Timeout 120s, maxBuffer 4MB.  
   - Errors: clear message if agent not found or non-zero exit (e.g. "Agent CLI not found. Install agent and ensure it is in PATH (or set AGENT_CLI_PATH).").

2. **API routes switched to agent**  
   - All seven routes that previously called OpenAI now call `runAgentPrompt` with a combined prompt (system + user instructions in one string) and parse the returned text (JSON or markdown) as before.  
   - Routes: `analyze-project-doc`, `improve-idea`, `generate-ticket-from-prompt`, `generate-ideas`, `generate-architectures`, `generate-prompt`, `generate-project-from-idea`.  
   - For routes without a natural project path, `process.cwd()` is used as the agent working directory.

3. **No OpenAI fallback**  
   - No `OPENAI_API_KEY` is required for these features. The `openai` package was removed from `package.json`.  
   - If the agent CLI is not installed or fails, the API returns 502 with the runner error message.

4. **Docs and references**  
   - Backend API list (`.cursor/setup/backend.json`): check-openai endpoint marked deprecated with a note that LLM features use the agent CLI.

## Consequences

- **Pros**: Single LLM path (agent CLI); no API key in the app; agent runs in project context where applicable; consistent with existing scripts.  
- **Cons**: Requires `agent` (or the binary set in `AGENT_CLI_PATH`) to be installed and in PATH on the machine running the Next server; no fallback if agent is unavailable.  
- **Follow-up (2026-02-15)**: In the desktop app (Tauri), all prompt execution is via the agent -p script and temporary tickets on the 3 agent slots; see [agent-prompt-via-temp-tickets-and-3-agents](agent-prompt-via-temp-tickets-and-3-agents.md). API routes are used for browser execution or with `promptOnly: true` to return the prompt for Tauri to run locally.
