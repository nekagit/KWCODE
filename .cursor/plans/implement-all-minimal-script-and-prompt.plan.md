# Implement All minimal script and prompt

## Overview

Minimize the Implement All flow: single prompt file (`.cursor/8. worker/implement-all.md`), first 3 In Progress tickets run in the 3 terminals with that prompt plus ticket and **assigned agent instructions from `.cursor/2. agents`**. Use **`.cursor/2. agents` everywhere** in the codebase for agent docs (no `.cursor/agents`). Script and Tauri point to `script/worker/implement_all.sh`.

---

## 1. Prompt: `.cursor/8. worker/implement-all.md`

Create the canonical Implement All prompt that:

- States the agent will receive a **Ticket** section and optionally **Agent instructions** from `.cursor/2. agents` (assigned to the ticket).
- Instructs: implement only the given ticket; follow Agent instructions when present; respect project layout and conventions; small, testable steps; run tests/build before done.
- Stays short; ticket + agent content is appended by the app.

Suggested structure: intro (you are implementing one ticket; ticket and agent instructions appear below); rules (one ticket, follow agents, project conventions, tests/build, no scope creep); note that ticket and agent instructions are appended by the app.

---

## 2. Path constants — use `.cursor/2. agents` everywhere

In [src/lib/cursor-paths.ts](src/lib/cursor-paths.ts) add:

- `WORKER_IMPLEMENT_ALL_PROMPT_PATH = ".cursor/8. worker/implement-all.md"`
- `AGENTS_ROOT = ".cursor/2. agents"` — **single source of truth for agent docs**

Replace every use of `.cursor/agents` with `AGENTS_ROOT` (or the constant) across the app.

---

## 3. Use `.cursor/2. agents` in all relevant files

| File | Change |
|------|--------|
| [src/lib/cursor-paths.ts](src/lib/cursor-paths.ts) | Add `WORKER_IMPLEMENT_ALL_PROMPT_PATH`, `AGENTS_ROOT = ".cursor/2. agents"`. |
| [src/components/.../ProjectRunTab.tsx](src/components/molecules/TabAndContentSections/ProjectRunTab.tsx) | Use `WORKER_IMPLEMENT_ALL_PROMPT_PATH` instead of `.cursor/prompts/worker.md`; load agent files from `AGENTS_ROOT` (e.g. `${AGENTS_ROOT}/${agentId}.md`). Combine prompt: implement-all.md then ticket + agents. |
| [src/components/.../ProjectAgentsSection.tsx](src/components/molecules/TabAndContentSections/ProjectAgentsSection.tsx) | Replace `AGENTS_DIR` / `.cursor/agents` with `AGENTS_ROOT` from cursor-paths for listing and reading agents. |
| [src/components/.../ProjectTicketsTab.tsx](src/components/molecules/TabAndContentSections/ProjectTicketsTab.tsx) | Use `AGENTS_ROOT` for listing agents when assigning to tickets (e.g. `listProjectFiles(projectId, AGENTS_ROOT, ...)`). |
| [src/lib/analysis-prompt.ts](src/lib/analysis-prompt.ts) | JSDoc/comments: `.cursor/agents` → `.cursor/2. agents` where relevant. |
| Any other file referencing `.cursor/agents` | Grep for `.cursor/agents` and replace with `AGENTS_ROOT` or `.cursor/2. agents` as appropriate. |

---

## 4. Script and Tauri

- **Tauri** [src-tauri/src/lib.rs](src-tauri/src/lib.rs): `implement_all_script_path` → `script/worker/implement_all.sh`; `is_valid_workspace` accept `script/worker/implement_all.sh` (or both script paths).
- **Script** [script/worker/implement_all.sh](script/worker/implement_all.sh): Keep minimal (-P, -S, -F); optional comment that prompt is built from `.cursor/8. worker/implement-all.md` and ticket + `.cursor/2. agents`.

---

## 5. Worker tab flow (paths only)

- **With tickets:** First 3 In Progress; per slot: read `WORKER_IMPLEMENT_ALL_PROMPT_PATH`, read `${AGENTS_ROOT}/${agentId}.md` for each `ticket.agents`; prompt = implement-all content + ticket block + agent content; run via `runImplementAllForTickets`.
- **No tickets:** Read `WORKER_IMPLEMENT_ALL_PROMPT_PATH` (+ optional kanban context); run in all 3 slots.

---

## 6. Summary: `.cursor/2. agents` everywhere

- **Constant:** `AGENTS_ROOT = ".cursor/2. agents"` in cursor-paths.
- **ProjectRunTab:** Implement All prompt path + agent docs from `AGENTS_ROOT`.
- **ProjectAgentsSection:** List/read agents from `AGENTS_ROOT`.
- **ProjectTicketsTab:** List agents from `AGENTS_ROOT` for assignment.
- **Docs/comments:** Where agent folder is mentioned, say `.cursor/2. agents`.

No alternative path; `.cursor/2. agents` is the only agents directory used by the app.
