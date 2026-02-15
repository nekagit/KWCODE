# ADR 0002: Frontend and Backend tabs with tech stack storage

## Status
Accepted

## Context
Project details need a clear way to describe and outline any project: frontend and backend tech stack, entities, and DB diagrams. This information should live in versionable, project-specific docs and also be available as a reusable template when initializing new projects.

## Decision
- **Two new tabs:** Add **Frontend** and **Backend** tabs to the project details page (with Setup, Planner, Worker, Versioning). Each tab displays markdown content from the project repo.
- **Project-specific content:** Store in `.cursor/setup/frontend.md` and `.cursor/setup/backend.md`. Content includes tech stack, key entities, and optional diagrams (e.g. Mermaid). Read via existing `readProjectFileOrEmpty(projectId, path, project.repoPath)`.
- **Reusable template:** Add `.cursor_inti/setup/frontend.md` and `.cursor_inti/setup/backend.md` with the same structure and placeholders. When a project is initialized (copy `.cursor_inti` → `.cursor`), new projects receive these files so they can fill in their own tech stack, entities, and DB outline.
- **New components:** `ProjectFrontendTab` and `ProjectBackendTab` in `src/components/molecules/TabAndContentSections/`. They load the corresponding setup file, render markdown (ReactMarkdown + remarkGfm), and show an empty state when the repo path is missing or the file does not exist.

## Consequences
- Project details page has six tabs: Setup, Frontend, Backend, Planner, Worker, Versioning.
- Frontend/Backend tabs require a project repo path to show content; otherwise they show guidance to set repo path or add the doc file.
- Initialize flow unchanged: copying `.cursor_inti` now includes `setup/frontend.md` and `setup/backend.md`, giving new projects a ready-to-fill outline.
- No API or Tauri changes; existing project file read APIs are used.

## References
- `src/components/organisms/ProjectDetailsPageContent.tsx`: TAB_CONFIG and TabsContent for Frontend/Backend
- `src/components/molecules/TabAndContentSections/ProjectFrontendTab.tsx`, `ProjectBackendTab.tsx`
- `.cursor/setup/frontend.md`, `.cursor/setup/backend.md` (this project)
- `.cursor_inti/setup/frontend.md`, `.cursor_inti/setup/backend.md` (template)
- ADR 0001: Initialize copies `.cursor_inti` as `.cursor`
