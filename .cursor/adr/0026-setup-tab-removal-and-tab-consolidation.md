# ADR 0026: Setup tab removal and tab consolidation

## Status

Accepted

## Context

- The project details page had many top-level tabs: Ideas, Project, Setup, Frontend, Backend, Testing, Documentation, Milestones, Planner, Worker, Control, Versioning.
- The **Setup** tab acted as an overview of `.cursor` folders (project files, setup, ideas, ADR, agents, planner, milestones, worker, documentation, rules) and duplicated content that belonged in dedicated tabs.
- **Ideas**, **Documentation**, and **Worker** were standalone tabs; the Worker tab showed run/queue UI that added complexity.
- Setup-related docs lived under `.cursor/2. setup`, separate from project docs in `.cursor/1. project`, which split “project” content across two roots.

## Decision

- **Remove the Setup tab** and delete `ProjectSetupTab.tsx`. Remove the **Ideas**, **Documentation**, and **Worker** tabs and their components (`ProjectIdeasDocTab` as standalone tab, `ProjectDocumentationHubTab`, `ProjectRunTab`).
- **Consolidate into Project tab:** The Project tab now includes: Project Files (`.cursor` browser), Project info (1. project docs + preview + Run section), Ideas (embedded `ProjectIdeasDocTab`), ADR file list (`.cursor/adr`), Agents (`ProjectAgentsSection`), and Rules file list (`.cursor/rules`).
- **Planner tab:** Add a “Planner files” section listing `.cursor/7. planner` with ticket stats (total/done) from `tickets.md`. Implemented as `PlannerFilesSection.tsx`.
- **Milestones tab:** Add a “Milestones files” section listing `.cursor/milestones` inside `ProjectMilestonesTab`.
- **Migrate `2. setup` into `1. project`:** Move all files and subdirs from `.cursor/2. setup` into `.cursor/1. project` (design, architecture, testing, documentation, frontend, backend, and subdirs `development/`, `setup/`, `documentation/`, `testing/`). Remove the `2. setup` folder and repurpose path constants in `cursor-paths.ts` so former setup paths point to `PROJECT_ROOT` (`.cursor/1. project`). Update worker queue `analyze-jobs.json` and `.cursor_template` accordingly.
- **Toasts and copy:** Replace all “See Worker tab” messaging with neutral text (e.g. “Analysis started.”, “Check queue or run output.”). Update comments in `api-projects.ts` and `run-helpers.ts` to drop Worker-tab references.

## Consequences

- Fewer tabs and a single “Project” tab that aggregates project-related content (files, ideas, ADR, agents, rules) and project info/run.
- One canonical project root: `.cursor/1. project` holds both project docs and former setup docs (design, architecture, testing, etc.), simplifying path handling and templates.
- Planner and Milestones tabs gain a clear “files in this folder” section plus planner ticket stats where relevant.
- Worker and Documentation tabs are removed; run/store and analyze flows remain, but there is no dedicated Worker tab UI. Control tab description updated to not reference the Worker tab.
- ADR 0021’s “2. setup” entity is retired; path constants and docs updated to reflect “1. project” as the single project/setup root.

## References

- `src/lib/cursor-paths.ts` — `SETUP_ROOT` removed; former setup paths use `PROJECT_ROOT`
- `src/components/organisms/ProjectDetailsPageContent.tsx` — tab list and TabsContent updated
- `src/components/molecules/TabAndContentSections/ProjectProjectTab.tsx` — expanded with ProjectFilesTab, Ideas, ADR, Agents, Rules
- `src/components/molecules/TabAndContentSections/PlannerFilesSection.tsx` — lists `.cursor/7. planner` for Planner tab
- `.cursor/1. project/` — current location of design, architecture, testing, documentation, frontend, backend docs and prompts
- `.cursor/worker/queue/analyze-jobs.json` — paths updated to `.cursor/1. project/`
