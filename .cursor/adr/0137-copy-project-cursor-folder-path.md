# ADR 0137 — Project detail: Copy .cursor folder path to clipboard

## Status

Accepted.

## Context

The project detail header has "Copy path" (repo path), "Open .cursor folder", and other actions, but no way to copy the path to the project's `.cursor` folder. Users who want to paste the path (e.g. `/path/to/repo/.cursor`) into a terminal or script had to open the folder or construct it manually. Ideas, Documentation, and Technologies pages already offer "Copy path" for their folders; aligning the project detail with this pattern improves workflow.

## Decision

- Add **`src/lib/copy-project-cursor-folder-path.ts`** with:
  - **`getProjectCursorFolderPath(repoPath)`** — build path as `repoPath` with trailing slashes trimmed + `/.cursor`.
  - **`copyProjectCursorFolderPath(repoPath)`** — if path is empty, show toast and return; otherwise copy via `copyTextToClipboard` and success toast. Works in both Tauri and browser (path is known on frontend).
- In **ProjectHeader**, add a "Copy .cursor path" button next to "Open .cursor folder", calling `copyProjectCursorFolderPath(project.repoPath)` with Copy icon and title "Copy .cursor folder path".

## Consequences

- Users can copy the project's `.cursor` folder path from the project detail header and paste it into a terminal or script.
- Same pattern as Copy path and as Ideas/Documentation/Technologies "Copy path". Run `npm run verify` to confirm tests, build, and lint pass.
