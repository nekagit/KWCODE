# ADR 0320 — Worker tab: per-section agent modes (normal, ask, plan, debug)

## Status

Accepted.

## Context

- The Worker tab has several sections that run the Cursor CLI terminal agent (Asking, Fast development, Debugging). All used the same invocation: `agent -p "..."` with no mode.
- Cursor CLI supports `--mode=ask`, `--mode=plan`, and `--mode=debug`. Users wanted each section to use the appropriate mode so that:
  - **Fast development** uses the normal agent (default).
  - **Asking** uses `--mode=ask` (questions only, no file changes).
  - A new **Plan** section uses `--mode=plan` (design approach first, then execute).
  - **Debugging** uses `--mode=debug` (runtime-focused bug fixing).

## Decision

1. **Pipeline for agent mode**  
   - Add optional `agentMode?: 'agent' | 'ask' | 'plan' | 'debug'` to `RunMeta`. When a temp-ticket job is run, pass `job.meta?.agentMode` through the run store into the Tauri command `run_run_terminal_agent` and thence to the worker script.

2. **Payload and backend**  
   - Extend `runRunTerminalAgentPayload(projectPath, promptContent, label, agentMode?)` to accept an optional fourth argument; include `agentMode` in `args` only when present and non-empty.
   - In Rust: `RunTerminalAgentArgs` gets optional `agent_mode: Option<String>` (alias `agentMode`). `run_run_terminal_agent_script_inner` accepts `agent_mode` and, when it is `Some(m)` and `m != "agent"`, passes `-M` and the value to the script.
   - Script `run_terminal_agent.sh`: add optional `-M mode`. When set, run `"$AGENT_CMD" --mode="$MODE" -p "$ESCAPED"`; otherwise keep `"$AGENT_CMD" -p "$ESCAPED"`.

3. **Worker sections**  
   - **Fast development**: do not set `agentMode` (or treat as normal); script receives no `-M`, CLI runs in default mode.
   - **Asking**: pass `agentMode: 'ask'` in meta (along with existing `placeholderRunId` when used).
   - **Plan**: new section with input and "Plan" button; on submit call `runTempTicket(..., { agentMode: 'plan' })`. Optional short prompt prefix instructs the agent to design the approach first and not execute yet.
   - **Debugging**: pass `agentMode: 'debug'` in meta.

4. **Section order**  
   - Order in the Worker tab: Asking → Plan → Fast development → Debugging (then Terminal output, Queue, History unchanged).

## Implementation

- `src/types/run.ts`: Add `agentMode?: "agent" | "ask" | "plan" | "debug"` to `RunMeta`.
- `src/lib/tauri.ts`: Extend `runRunTerminalAgentPayload` with optional fourth parameter `agentMode`; include in `args` only when present and non-empty.
- `src-tauri/src/lib.rs`: Add `agent_mode: Option<String>` to `RunTerminalAgentArgs`; pass to `run_run_terminal_agent_script_inner`; in script inner, when `agent_mode` is `Some(m)` and `m != "agent"`, add `.arg("-M").arg(m)` to the script invocation.
- `script/worker/run_terminal_agent.sh`: Add `-M mode` to usage and parsing; when `MODE` is set, run the CLI with `--mode="$MODE"`.
- `src/store/run-store.ts`: In `processTempTicketQueue`, call `runRunTerminalAgentPayload(..., job.meta?.agentMode)`.
- `src/components/molecules/TabAndContentSections/ProjectRunTab.tsx`:  
  - **WorkerAskingSection**: pass `agentMode: 'ask'` in meta.  
  - **WorkerPlanSection**: new component (indigo/ListChecks), input + Plan button, `runTempTicket(..., { agentMode: 'plan' })`.  
  - **WorkerDebuggingSection**: pass `agentMode: 'debug'` in meta.  
  - Insert `WorkerPlanSection` between Asking and Fast development in the render.

## Consequences

- Each Worker section now maps to the intended Cursor CLI mode; Plan mode is available via a dedicated section.
- Existing flows (e.g. `runSetupPrompt`, night shift) that do not set `agentMode` continue to use the default agent.
- If the Cursor CLI does not support a given `--mode`, the script still passes it; the CLI may error or ignore (no app change required for forward compatibility).
