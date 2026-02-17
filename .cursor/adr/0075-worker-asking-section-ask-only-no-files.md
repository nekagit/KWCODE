# ADR 0075: Worker tab “Asking” section — ask-only agent, no file changes

## Status
Accepted

## Context
Users need a way to ask the agent questions about the project without risking any file creation, modification, or deletion. Reusing the same terminal agent flow (run_terminal_agent.sh, -p normal) keeps one execution model and reuses the terminals below.

## Decision
- Add an **Asking** section in the Worker tab, above Fast development.
- Use the same `runTempTicket` → `run_run_terminal_agent` flow and the same terminal slots as Fast development and Debugging.
- Prepend a fixed prompt prefix instructing the agent: do not create, modify, or delete any files; only answer the question; read-only terminal use (e.g. list, grep, cat) is allowed.
- No new scripts or Tauri commands; behavior is enforced by prompt only.

## Consequences
- One more section in the Worker tab; users can ask questions with a clear “ask only” guarantee.
- Same script and terminals as existing flows; no extra infra.
- Compliance is best-effort (prompt-based); future agent or tool restrictions could harden this if needed.
