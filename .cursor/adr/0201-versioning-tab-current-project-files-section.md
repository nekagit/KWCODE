# ADR 0201: Versioning tab — current project files section

## Status
Accepted

## Context
Users need a quick overview of all files in the current project from the Versioning (Git) tab, without switching to the Project Files or other tabs. The section should be prominent and tall so the list is easy to scan.

## Decision
- Add a **Current project files** section in the Versioning tab (`ProjectGitTab`).
- List all files recursively under the project repo root using the existing `listProjectFiles` API (Tauri `list_files_under_root` / Next.js `/api/data/projects/[id]/files`).
- Introduce a frontend helper `listAllProjectFilePaths` in `api-projects.ts` that walks directories and collects file paths (capped at 3000 files to avoid UI freeze on very large repos).
- Render the list in a **very tall** scroll area: fixed height `65vh` with max `75vh` so the section dominates the tab.
- Provide a Refresh button to re-fetch the list; initial load runs when the tab is shown (when `repoPath` and `projectId` are set).

## Consequences
- Versioning tab now shows both git-focused content (changed files, branch, pull/push) and a full project file tree in one place.
- Recursive listing is done in the frontend via multiple one-level API calls; for very large repos the first load may take several seconds and is limited to 3000 files.
- No new Tauri commands or API routes; reuses existing list-files infrastructure.
