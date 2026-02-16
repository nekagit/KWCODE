# Migrate planner to 7. planner and worker to 8. worker

## Overview

Move all content and references from `.cursor/planner` to `.cursor/7. planner` and from `.cursor/worker` to `.cursor/8. worker`. Add path constants in `cursor-paths.ts`, update app/API code, templates, and documentation; then move the physical folders.

---

## Part A: Planner → `.cursor/7. planner`

### A1. cursor-paths.ts (planner)

Add in [src/lib/cursor-paths.ts](src/lib/cursor-paths.ts):

- `PLANNER_ROOT = ".cursor/7. planner"`
- `PLANNER_TICKETS_PATH = ".cursor/7. planner/tickets.md"`
- `PLANNER_FEATURES_PATH = ".cursor/7. planner/features.md"`
- `PLANNER_KANBAN_STATE_PATH = ".cursor/7. planner/kanban-state.json"`

### A2. Frontend and shared libs (planner)

| File | Change |
|------|--------|
| [PlannerFilesSection.tsx](src/components/molecules/TabAndContentSections/PlannerFilesSection.tsx) | Use `PLANNER_ROOT`, `PLANNER_TICKETS_PATH` from `@/lib/cursor-paths`. |
| [api-projects.ts](src/lib/api-projects.ts) | JSDoc: `.cursor/planner/tickets.md` → `.cursor/7. planner/tickets.md`. |
| [todos-kanban.ts](src/lib/todos-kanban.ts) | JSDoc/comments: `.cursor/planner` → `.cursor/7. planner`. |
| [analysis-prompt.ts](src/lib/analysis-prompt.ts) | All `.cursor/planner/tickets.md` and `features.md` → `.cursor/7. planner/...`. |
| [initialization-templates.ts](src/lib/initialization-templates.ts) | Template text: `.cursor/planner/` → `.cursor/7. planner/`. |
| [types/project.ts](src/types/project.ts) | Comment example → `.cursor/7. planner/tickets.md`. |

### A3. API routes (planner)

| File | Change |
|------|--------|
| [src/app/api/data/route.ts](src/app/api/data/route.ts) | `PLANNER_PATH = ".cursor/7. planner"`. |
| [src/app/api/data/dashboard-metrics/route.ts](src/app/api/data/dashboard-metrics/route.ts) | Same. |
| [src/app/api/data/projects/[id]/file/route.ts](src/app/api/data/projects/[id]/file/route.ts) | JSDoc example path. |
| [src/app/api/generate-ticket-from-prompt/route.ts](src/app/api/generate-ticket-from-prompt/route.ts) | Comment path. |

### A4. Tauri (planner)

[src-tauri/src/lib.rs](src-tauri/src/lib.rs), `archive_cursor_file`: replace `".cursor/planner/tickets.md"` and `".cursor/planner/features.md"` with `".cursor/7. planner/..."`; update minimal features.md content string.

### A5. Template and .cursor (planner)

- Rename `.cursor_template/planner` → `.cursor_template/7. planner`.
- Update all file contents under `.cursor_template` that mention `.cursor/planner` to `.cursor/7. planner` (README, planner/features.md, ai-suggestions, ticket-templates, worker queue/workflows, agents, milestones).
- Move `.cursor/planner/` contents into `.cursor/7. planner/`; remove empty `.cursor/planner/`.

### A6. Docs and ADRs (planner)

Update `.cursor/planner` → `.cursor/7. planner` in: .cursor/README.md, .cursor/1. project/*.md, .cursor/2. agents/*.md, .cursor/worker/**/*.md, .cursor/adr (0021, 0026, 0016, 0013, 0004), docs/guides/usage-guide.md.

---

## Part B: Worker → `.cursor/8. worker`

### B1. cursor-paths.ts (worker)

Add in [src/lib/cursor-paths.ts](src/lib/cursor-paths.ts):

- `WORKER_ROOT = ".cursor/8. worker"`
- `ANALYZE_QUEUE_PATH = ".cursor/8. worker/queue/analyze-jobs.json"` (export here as single source of truth)

### B2. App code (worker)

| File | Change |
|------|--------|
| [src/lib/api-projects.ts](src/lib/api-projects.ts) | Remove local `ANALYZE_QUEUE_PATH`; import `ANALYZE_QUEUE_PATH` from `@/lib/cursor-paths`. Update comment "worker tab" if needed. |
| [ProjectDetailsPageContent.tsx](src/components/organisms/ProjectDetailsPageContent.tsx) | No path change if it only imports `ANALYZE_QUEUE_PATH` from api-projects (after B2, that re-exports from cursor-paths). |

### B3. Template and .cursor (worker)

- Rename `.cursor_template/worker` → `.cursor_template/8. worker`.
- Move `.cursor/worker/` contents into `.cursor/8. worker/` (queue/, workflows/); remove empty `.cursor/worker/`.

### B4. Docs and ADRs (worker)

Update `.cursor/worker` → `.cursor/8. worker` in:

- [.cursor/README.md](.cursor/README.md) — Run tab, queue files, workflow, analyze-jobs path.
- [.cursor/adr/0026-setup-tab-removal-and-tab-consolidation.md](.cursor/adr/0026-setup-tab-removal-and-tab-consolidation.md) — analyze-jobs path.
- [.cursor/adr/0021-numbered-entity-folders-refactor.md](.cursor/adr/0021-numbered-entity-folders-refactor.md) — optional follow-up note.
- [.cursor/adr/0013-cursor-template-generic-template.md](.cursor/adr/0013-cursor-template-generic-template.md) — worker paths.
- [.cursor/adr/0004-kwcode-restructuring-cursor-inti-and-cursor.md](.cursor/adr/0004-kwcode-restructuring-cursor-inti-and-cursor.md) — worker reference.
- [docs/guides/usage-guide.md](docs/guides/usage-guide.md) — queue and workflow paths.
- [docs/contributing/ticket-workflow.md](docs/contributing/ticket-workflow.md) — workflow path.
- [docs/development/workflows.md](docs/development/workflows.md) — worker queue path.
- [.cursor/8. worker/workflows/ticket-workflow.md](.cursor/8. worker/workflows/ticket-workflow.md) (after move) and [.cursor_template/8. worker/workflows/ticket-workflow.md](.cursor_template/8. worker/workflows/ticket-workflow.md) — internal paths: `.cursor/worker/queue/...` → `.cursor/8. worker/queue/...`; keep `.cursor/7. planner` refs as in Part A.

**Note:** Tauri does not reference `.cursor/worker`; no Rust changes for worker.

---

## Part C: ADRs and verification

### C1. ADR for both migrations

Add [.cursor/adr/0028-planner-and-worker-numbered-folders.md](.cursor/adr/0028-planner-and-worker-numbered-folders.md): status accepted; context (align planner and worker with numbered entities 7 and 8); decision (move to `.cursor/7. planner` and `.cursor/8. worker`, constants in cursor-paths); consequences (code, template, docs, Tauri planner paths updated; existing repos must migrate if they use these paths).

### C2. Verification

- Planner tab lists `.cursor/7. planner` and reads tickets from `.cursor/7. planner/tickets.md`.
- Analyze-all and queue read/write `.cursor/8. worker/queue/analyze-jobs.json`.
- Tauri `archive_cursor_file` uses `.cursor/7. planner/...`.
- New projects from template get `7. planner` and `8. worker`; no `planner` or `worker` folders.
- Grep for `.cursor/planner` and `.cursor/worker` (outside ADR history) returns no matches.

---

## Execution order

1. **cursor-paths.ts**: Add planner and worker constants (including `ANALYZE_QUEUE_PATH`).
2. **api-projects.ts**: Import `ANALYZE_QUEUE_PATH` from cursor-paths; remove local definition.
3. **PlannerFilesSection**, **analysis-prompt**, **initialization-templates**, **todos-kanban**, **types/project**: planner path updates.
4. **API routes** (data, dashboard-metrics, file, generate-ticket-from-prompt): planner/worker path or comments.
5. **Tauri** lib.rs: planner paths in `archive_cursor_file`.
6. **Rename/move folders**: `.cursor_template/planner` → `7. planner`, `.cursor_template/worker` → `8. worker`; `.cursor/planner` → `7. planner`, `.cursor/worker` → `8. worker`.
7. **Update all file contents** in template and .cursor (worker workflow, queue .md, planner refs in template).
8. **Docs and ADRs**: all references to `.cursor/planner` and `.cursor/worker`.
9. **Add ADR 0028.**
