# ADR 0143 — Projects list: Discover folders and add as projects

## Status

Accepted.

## Context

The Projects list page has "New project" (manual form) and "Refresh", but no way to bulk-add projects from the app’s configured folder root (February directories). Users could go to New project and use the "Local repos" section to add one folder at a time. There was no single entry point on the Projects list to discover all folders in the root that are not yet projects and add them in one go.

## Decision

- Add a **Discover folders** button on the Projects list page (in the header next to Refresh). When clicked, open a dialog that:
  - Fetches folder paths from the configured root via Tauri `list_february_folders` or GET `/api/data/february-folders`.
  - Fetches current projects via `listProjects()` and compares normalized `repoPath` values to determine which folders are not yet in the list.
  - Shows a list of "new" paths with checkboxes (all selected by default). User can select all, select none, or pick individual folders.
  - On "Add selected", creates a project for each selected path using `createProject({ name: basename(path), repoPath: path })`. Success/error toasts; on success the parent refreshes the project list and closes the dialog.
- **New lib** `src/lib/discover-folders.ts`: `getFolderPaths()`, `discoverFoldersNotInProjects()`, `projectNameFromPath(path)`.
- **New component** `src/components/molecules/FormsAndDialogs/DiscoverFoldersDialog.tsx`: dialog with loading state, empty state ("No new folders found"), scrollable list with checkboxes, Select all / Select none, Cancel and Add selected actions.
- **ProjectsHeader**: optional prop `onDiscoverFolders`; when provided, show a "Discover folders" button. **ProjectsListPageContent**: state for dialog open, pass `onDiscoverFolders` and render the dialog with `onAdded={refetch}`.

## Consequences

- Users can discover and add multiple projects from the configured root in one flow without leaving the Projects list or adding them one-by-one from the New project page.
- Path comparison is normalized (slashes, trim, case-insensitive) so duplicates across OS or trailing-slash differences are avoided.
- Works in both Tauri (invoke) and browser (API route) for folder listing and project creation.
