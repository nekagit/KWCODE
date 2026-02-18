# ADR 0203: Versioning tab — "/" to focus filter for Current project files

## Status

Accepted.

## Context

The Versioning (Git) tab has a "Current project files" section that lists all files under the project root (ADR 0201). There was no filter input; users had to scroll to find a path. The Design, Architecture, Run, and other pages use "/" to focus their filter (e.g. ADR 0185). Adding a filter input and the same "/" keyboard shortcut on the Versioning tab lets users focus the filter and narrow the list by path substring. This is real, additive UX that would show up in a changelog.

## Decision

- **ProjectTabSlug**: Already includes `"git"` in `src/lib/project-tab-focus-filter-shortcut.ts` so the shared hook supports the Versioning tab.
- **New hook** `src/lib/project-versioning-focus-filter-shortcut.ts`: `useProjectVersioningFocusFilterShortcut(inputRef)` calls `useProjectTabFocusFilterShortcut(inputRef, "git")`. On `/projects/[id]?tab=git`, pressing "/" focuses the ref unless focus is in an input, textarea, or select.
- **ProjectGitTab**: Add state `projectFilesFilterQuery`, ref for the filter input, call `useProjectVersioningFocusFilterShortcut(ref)`. In the "Current project files" section add an Input (placeholder "Filter file paths…"); filter `allProjectFiles` by case-insensitive substring before rendering the list. Show "N of M files" when a filter is active; show empty state when no paths match.
- **keyboard-shortcuts.ts**: Add "/ (Versioning tab)", description "Focus filter" in the Help group.
- No new Tauri commands or API routes.

## Consequences

- When viewing a project's Versioning tab, users can press "/" to focus the filter input and type to narrow the file list.
- If the user is already typing in an input/textarea/select, "/" is not intercepted.
- The shortcut is documented in the Keyboard shortcuts help dialog.
- Run `npm run verify` to confirm tests, build, and lint pass.
