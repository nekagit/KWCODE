# 0002-consolidate-organisms-directory

## Status
Accepted

## Context
The `src/components/organisms/` directory contained several subdirectories (`Controls`, `Display`, `Navigation`, `Tables`). This structure deviates from the desired convention of having all organism components directly within the `organisms` directory, without further nesting of folders.

## Decision
All files from the subdirectories within `src/components/organisms/` have been moved to the root of the `src/components/organisms/` directory. The now-empty subdirectories have been removed.

## Consequences
- The `src/components/organisms/` directory now directly contains all organism components, simplifying the file structure and adhering to the desired convention.
- Imports for components previously located in subdirectories within `src/components/organisms/` will need to be updated. (This will be handled in subsequent changes or manual adjustments.)
