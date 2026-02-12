# ADR: Stakeholder tab – File listing supported in desktop app

## Date
2026-02-12

## Status
Accepted

## Context
The Stakeholder tab includes a "Project Files" section that lists files under the project's `.cursor` directory. The frontend called Tauri command `list_files_under_root(root, path)` when running in the desktop app; the command did not exist in the Rust backend, so the invoke failed and the UI showed: "File listing not supported in desktop app yet."

## Decision
- **Tauri backend**
  - Implement command `list_files_under_root(root: String, path: String)` in `src-tauri/src/lib.rs` that:
    - Canonicalizes `root` (project repo path) and resolves `path` (e.g. `.cursor` or `.cursor/rules`) relative to it.
    - Ensures the resolved directory is under `root` and is a directory.
    - Reads one level of directory entries (no recursion); skips `.` and `..`.
    - Returns `Vec<DirListingEntry>` with fields: `name`, `isDirectory`, `size`, `updatedAt` (camelCase for frontend).
    - Sorts entries: directories first, then by name (case-insensitive).
  - Add struct `DirListingEntry` with serde renames for `isDirectory` and `updatedAt`; `updatedAt` is ISO 8601 from file metadata modified time (chrono).
  - Register `list_files_under_root` in the Tauri invoke handler.

## Consequences
- In the desktop app, the Stakeholder tab "Project Files" section now lists files and folders under the project repo as expected; the previous error message is no longer shown when the command succeeds.
- If invoke still fails (e.g. permission or path error), the existing catch in `api-projects.ts` continues to show a fallback error and log to console.
