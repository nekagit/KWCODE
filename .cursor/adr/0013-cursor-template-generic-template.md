# ADR 0013: .cursor_template as generic .cursor template

## Status

Accepted

## Context

We needed a project-agnostic template for the `.cursor` directory that can be copied into new projects. The existing Initialize flow uses `.cursor_inti` (read via API or Tauri and written as `.cursor/` in the target project). A separate, manual template was desired: a folder that contains the same structure and path references as `.cursor` but with no project-specific (e.g. KWCode) content, so that when starting a new project elsewhere, users can copy this folder into the repo as `.cursor` and have everything work without any app code changes.

## Decision

- **Introduce `.cursor_template/`** in this repo as a standalone template folder.
- **Content:** Same directory tree as `.cursor`, with:
  - **Copy as-is:** `prompts/**`, `agents/*.md`, `7. planner/ticket-templates/*`, `worker/workflows/*`, `scripts/*` (from repo `script/`). Worker queue: `ready.md`, `in-progress.md`, `completed.md` with short generic text; `analyze-jobs.json` with same structure and `.cursor/...` paths.
  - **Genericize:** `README.md` (explain copy-to-.cursor usage, no KWCode/.cursor_inti references); `setup/*` (placeholders or empty/sample rows for frontend.json, backend.json; short placeholders for setup/*.md); `adr/` (one generic ADR, e.g. 0001-how-to-use-adrs.md); `7. planner/tickets.md`, `features.md`, `kanban-state.json`, `ai-suggestions/generated-tickets.md` (format-only or minimal placeholders); `project/PROJECT-INFO.md`, `documentation/`, `milestones/` (minimal placeholders or one example).
  - **Technologies:** `technologies/tech-stack.json` with same schema and generic description.
- **Path references:** All references inside files remain `.cursor/...` (never `.cursor_template/...`) so that after copying the folder to `.cursor`, paths are correct.
- **No application code changes.** The app continues to read/write only `.cursor/`. Initialize continues to use `.cursor_inti` if present. `.cursor_template` is for manual use: copy it to `.cursor` in a new project.

## Consequences

- New projects can be bootstrapped by copying `.cursor_template` into the repo as `.cursor`, without depending on this app’s Initialize or `.cursor_inti`.
- This repo keeps `.cursor` as the project-specific implementation and `.cursor_template` as the reusable, generic template.
- Maintenance: when adding new expected paths or prompts under `.cursor`, add corresponding content or placeholders to `.cursor_template` so the template stays complete.

## References

- `.cursor_template/README.md` — How to use the template (copy to `.cursor`)
- ADR 0004: KWCode restructuring — .cursor_inti and .cursor
- ADR 0001: Initialize copies .cursor_inti as .cursor
