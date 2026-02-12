# ADR: Stakeholder tab – Agents section

## Date
2026-02-12

## Status
Accepted

## Context
The Stakeholder tab on the project details page contains Project Files, Design, Ideas, Architecture, Testing, and Documentation. The user requested an “Agents” section at the top of the tab that takes full width and shows one column per file in the project’s `.cursor/agents` folder.

## Decision
- **New section at top of Stakeholder tab:** An “Agents” section was added as the first block in the Stakeholder tab, full width (`w-full lg:col-span-2`).
- **Component:** `ProjectAgentsSection` was added under `src/components/molecules/TabAndContentSections/ProjectAgentsSection.tsx`. It:
  - Lists files in `.cursor/agents` via `listProjectFiles(projectId, ".cursor/agents", project.repoPath)`.
  - Filters to `.md` files and sorts by name.
  - Renders a responsive grid (2–6 columns by breakpoint) with one clickable column per agent file; each column shows a humanized name derived from the filename (e.g. `backend-dev.md` → “Backend Dev”).
  - On click, opens a dialog that loads and shows the file content via `readProjectFile`; the dialog title uses optional frontmatter `name` when present.
- **Stakeholder layout:** In `ProjectDetailsPageContent`, `ProjectAgentsSection` is rendered first inside the Stakeholder `TabsContent`, before the Project Files card, so Agents appears at the top and spans the full grid width.
- **Empty / no-repo handling:** If the project has no `repoPath`, the section shows a short message to set a repository path. If `.cursor/agents` is empty or listing fails, an empty state or error is shown.

## Consequences
- Stakeholder tab now surfaces Cursor agent definitions (`.cursor/agents/*.md`) at the top with one column per file and optional preview in a dialog.
- Layout is responsive and consistent with existing SectionCard styling (violet accent).
- Agent list is dynamic: any `.md` file added under `.cursor/agents` in the project repo appears as a column without code changes.
