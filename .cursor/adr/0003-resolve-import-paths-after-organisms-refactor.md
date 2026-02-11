# 0003-resolve-import-paths-after-organisms-refactor

## Status
Accepted

## Context
Following the refactoring detailed in ADR 0002, where subdirectories within `src/components/organisms/` were eliminated and their contents moved to the parent directory, several import paths across the codebase became outdated, leading to build errors (e.g., "Failed to read source code" and "No such file or directory").

## Decision
All affected import paths in various component files have been updated to reflect the new flattened `src/components/organisms/` directory structure. Specifically, imports referencing `src/components/organisms/Display/RunningTerminalsPopover` or `src/components/organisms/Navigation/SidebarNavigation` (and similar) have been changed to directly reference `src/components/organisms/RunningTerminalsPopover` and `src/components/organisms/SidebarNavigation`, respectively.

## Consequences
- The build errors related to incorrect import paths have been resolved.
- The codebase now correctly reflects the updated file locations after the `organisms` directory refactor.
- Future additions of organism components should adhere to the flat structure within `src/components/organisms/`.
