# ADR 0317 — Bugfix: Versioning tab — Current project files show all files

## Status

Accepted.

## Context

- The Versioning (Git) tab has a "Current project files" section that lists all files under the project root (ADR 0201, ADR 0214).
- The list is built by `listAllProjectFilePaths()` in `api-projects.ts`, which recursively walks the repo using `listProjectFiles` (Tauri: `list_files_under_root`) and was capped at **3,000 files** to avoid UI freeze on very large repos.
- Users reported not seeing all project files: any project with more than 3,000 files showed only the first 3,000 (depth-first order), with no indication that the list was truncated.

## Decision

1. **Raise the default cap**
   - Increase `DEFAULT_MAX_RECURSIVE_FILES` from 3,000 to **100,000** in `src/lib/api-projects.ts` so most projects show their full file set; very large monorepos may still hit the limit.

2. **Return truncation signal**
   - Change `listAllProjectFilePaths()` to return `{ paths: string[], truncated: boolean }` instead of `string[]`. Set `truncated: true` when the collected count reaches `maxFiles` so the UI can inform the user.

3. **UI: truncation message**
   - In `ProjectGitTab.tsx`, store the `truncated` flag and when true show: "Showing first N files (limit reached; project may have more)." so users know the list may be incomplete.

## Implementation

- **`src/lib/api-projects.ts`**
  - `DEFAULT_MAX_RECURSIVE_FILES = 100_000`.
  - New type `ListAllProjectFilePathsResult = { paths: string[]; truncated: boolean }`.
  - `listAllProjectFilePaths()` returns that type; `truncated` is true when `paths.length >= maxFiles`.

- **`src/components/molecules/TabAndContentSections/ProjectGitTab.tsx`**
  - Add state `allProjectFilesTruncated`.
  - In `fetchAllProjectFiles`, use `const { paths, truncated } = await listAllProjectFilePaths(...)`; set both `allProjectFiles` and `allProjectFilesTruncated`.
  - In the "Current project files" section, when `allProjectFilesTruncated` is true, render an amber note: "Showing first N files (limit reached; project may have more)."

## Consequences

- Projects with up to 100k files now see their full list in the Versioning tab; only exceptionally large repos are capped.
- When the cap is hit, users see an explicit message instead of assuming the list is complete.
- Single caller of `listAllProjectFilePaths` (ProjectGitTab) was updated to the new return shape; no other callers.
