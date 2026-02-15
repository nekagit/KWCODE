# ADR: All prompt runs via agent -p and temporary tickets on 3 agents

## Status

Accepted (2026-02-15)

## Context

Following [use-agent-cli-instead-of-openai](use-agent-cli-instead-of-openai.md), LLM features use the `agent` CLI. Execution could happen either on the Next server (`runAgentPrompt` in API routes) or in the Tauri desktop app via `script/implement_all.sh` (agent -p). Users wanted all prompt runs to go through the agent -p script and to appear as temporary tickets in the Run tab, running immediately on the 3 agent slots so they can see what is happening.

## Decision

1. **Execution path in desktop app (Tauri)**  
   - When the app runs as Tauri, all user-triggered prompt runs (analyze doc, improve idea, generate ideas/architectures/prompt/ticket) use the agent -p script via `run_implement_all` (slot 1).  
   - Each run is created as a **temporary ticket**: one entry in `runningRuns` with a descriptive label and optional metadata (`RunMeta`: `projectId`, `outputPath`, `onComplete`, `payload`).  
   - Runs are added to the run queue and started immediately on slot 1 so they appear in the Run tab (Worker status bar and terminals).

2. **Prompt-only API**  
   - All seven API routes that call `runAgentPrompt` support a **promptOnly** flag (in request body or query). When `promptOnly: true`, the route returns `{ prompt: string }` without executing the agent.  
   - The Tauri frontend calls these routes to get the prompt, then runs it via `runTempTicket(projectPath, prompt, label, meta)` so execution always happens on the user’s machine through the implement_all script.

3. **Run metadata and post-run actions**  
   - `RunInfo` (in `src/types/run.ts`) has optional `meta?: RunMeta`.  
   - When a run exits (`script-exited`), the run-store-hydration handler:  
     - If `meta.projectId` and `meta.outputPath` are set: joins `logLines` and writes to the project file via `writeProjectFile`.  
     - If `meta.onComplete` is set: looks up a one-time handler in a registry by key `onComplete + ':' + (payload.projectId ?? payload.requestId ?? runId)`, calls it with stdout, and dispatches a `run-complete` custom event.  
   - Components register handlers with `registerRunCompleteHandler(key, (stdout) => { ... })` before starting the run and parse the agent output when the run completes.

4. **Features using the Tauri path**  
   - **Analyze project doc**: Fetches prompt with `promptOnly`, runs `runTempTicket` with `meta: { projectId, outputPath, payload: { repoPath } }`; on exit, output is written to the project file.  
   - **Improve idea**, **Generate ideas**, **Generate architectures**, **Generate prompt**, **Generate ticket** (Tickets and Milestones tabs): Same pattern—promptOnly, `runTempTicket` with `onComplete` and `payload`, handler parses stdout and updates UI state.  
   - **Generate project from idea**: Still uses the full API (no Tauri temp-ticket path) because the API creates project/prompts/tickets in data/*.json; applying the same from agent stdout would require an additional “apply generated project” flow.

5. **Browser (non-Tauri)**  
   - When not running in Tauri, the app continues to call the existing API routes without `promptOnly`; the Next server runs the agent via `runAgentPrompt` and returns the result. No change to browser behaviour.

6. **Setup “Run Prompt” and Run tab**  
   - Setup doc “Run Prompt” already uses `runSetupPrompt` → `run_implement_all` (slot 1) and appears in the Run tab. No change.  
   - The Run tab shows the 3 agent slots and all runs (including temporary tickets) in `runningRuns`.

## Consequences

- **Pros**: All prompt execution in the desktop app goes through agent -p; every run is visible in the Run tab; no API key; execution on the user’s machine.  
- **Cons**: Requires Tauri and a project path (or default from run store) for features that run as temp tickets; generate-project-from-idea remains server-executed unless an apply-generated-project flow is added later.  
- **References**: Run type and store (`src/types/run.ts`, `src/store/run-store.ts`), run-store-hydration (`src/store/run-store-hydration.tsx`), API routes with `promptOnly`, and frontend call sites listed in the implementation plan.
