# ADR 0030: Worker tab debugging section

## Status

Accepted

## Context

- Developers often need to paste error logs (build failures, runtime errors, stack traces) and get an AI-assisted diagnosis and fix.
- The Worker tab already runs terminal agents via `runTempTicket` (slot 1) for one-off prompts (e.g. analyze doc, improve idea). Reusing that flow for a “paste logs → run debugging agent” UX keeps behavior consistent and avoids new infrastructure.

## Decision

- **Worker tab:** Add a **Debugging** section between Command Center and Terminals.
- **UI:** A textarea for pasting error/log content and a button **Run terminal agent to fix**.
- **Prompt:** A fixed system prompt (expert debugging assistant) is prepended to the user’s pasted logs. The combined prompt is sent to the terminal agent via `runTempTicket(projectPath, fullPrompt, "Debug: fix errors")`, so the run appears in slot 1 like other temp tickets.
- **Output:** The agent runs in the same terminal slot; the user sees output in the existing Worker terminals and can act on the suggested fixes.

## Consequences

- Users can paste any error output and trigger a single debugging run without leaving the Worker tab.
- The debugging prompt is embedded in the frontend (constant `DEBUG_ASSISTANT_PROMPT` in `ProjectRunTab.tsx`); changing it requires a code update.
- No new API or Tauri command; reuses `run_implement_all` (slot 1) and run store.

## References

- `src/components/molecules/TabAndContentSections/ProjectRunTab.tsx` — `WorkerDebuggingSection`, `DEBUG_ASSISTANT_PROMPT`
- `src/store/run-store.ts` — `runTempTicket`
- `src/lib/run-helpers.ts` — `isImplementAllRun` includes `label.startsWith("Debug:")` so debug runs appear in the Worker terminal slots
