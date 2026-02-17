# ADR 0040: Implement All minimal script and .cursor/2. agents everywhere

## Status

Accepted.

## Context

Implement All in the Worker tab needed a single canonical prompt and consistent use of the agents folder. Scripts had been moved under `script/worker/`; the app still referenced `script/implement_all.sh` and `.cursor/agents`.

## Decision

- **Implement All prompt:** Single prompt file at `.cursor/8. worker/implement-all.md` (general ticket implementation rules; ticket and agent instructions are appended by the app). Worker tab uses this instead of `.cursor/prompts/worker.md` for both “with tickets” and “no tickets” flows.
- **Agents path:** Use `.cursor/2. agents` everywhere. Added `AGENTS_ROOT` in `cursor-paths.ts`; ProjectRunTab, ProjectAgentsSection, and ProjectTicketsTab load or list agents from `AGENTS_ROOT`. JSDoc and comments updated to reference `.cursor/2. agents`.
- **Prompt order:** For ticket runs, prompt = implement-all.md content first, then ticket block + agent instructions (so the model sees rules before the specific ticket).
- **Script:** Tauri invokes `script/worker/implement_all.sh`. `implement_all_script_path` points to `script/worker/implement_all.sh`; `is_valid_workspace` accepts either `script/implement_all.sh` or `script/worker/implement_all.sh`. Script header documents that the prompt is built from `.cursor/8. worker/implement-all.md` and the ticket (+ `.cursor/2. agents` when assigned).

## Consequences

- One Implement All prompt; ticket and assigned agent docs are injected consistently.
- All agent usage goes through `.cursor/2. agents`; no remaining `.cursor/agents` references in code.
- Implement All runs use the worker script under `script/worker/`.

## References

- `src/lib/cursor-paths.ts` — `WORKER_IMPLEMENT_ALL_PROMPT_PATH`, `AGENTS_ROOT`
- `src/components/molecules/TabAndContentSections/ProjectRunTab.tsx` — prompt path and agent path
- `src/components/molecules/TabAndContentSections/ProjectAgentsSection.tsx` — `AGENTS_ROOT`
- `src/components/molecules/TabAndContentSections/ProjectTicketsTab.tsx` — `AGENTS_ROOT`
- `src-tauri/src/lib.rs` — `implement_all_script_path`, `is_valid_workspace`
- `script/worker/implement_all.sh` — minimal -P, -S, -F
- `.cursor/8. worker/implement-all.md` — canonical Implement All prompt
