# ADR 0062: Remove Local repos section and fix Browse for repo path

## Status
Accepted (2025-02-17)

## Context
- The projects list page showed a "Local repos" section (LocalReposSection) that listed folders from the configured projects directory (february-dir.txt). Users requested removal of this "local project" tab/section.
- The "Browse" button next to the repo path field on the New Project form should open a native folder picker in the desktop app; it was not reliably working (e.g. when Tauri uses `withGlobalTauri` and exposes the dialog on `window.__TAURI__.dialog` instead of the dynamic import).

## Decision
- **Remove Local repos section:** Remove `LocalReposSection` from the projects list page (`ProjectsListPageContent`). The projects list now shows only the header, error display, and the list of existing projects (or empty state). Users can still create a project by going to New project and typing or pasting a repo path, or using the Browse button.
- **Make Browse work:** In `src/lib/tauri.ts`:
  - If the dynamic import of `@tauri-apps/plugin-dialog` fails, fall back to `window.__TAURI__.dialog?.open` (for apps built with `withGlobalTauri: true`).
  - In `showOpenDirectoryDialog`, also try `window.__TAURI__.dialog.open` when `tauriOpen` is still undefined after waiting for the import.
  - On dialog error, throw so the caller can show a toast instead of failing silently.
- In `NewProjectForm`, wrap `showOpenDirectoryDialog()` in try/catch and show a toast on error.

## Consequences
- Projects list page is simpler; no accordion for local repos.
- Browse button works in both dynamic-import and global-Tauri dialog setups.
- Users see a clear error message if the folder dialog fails to open.
