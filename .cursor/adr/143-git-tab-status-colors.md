# ADR 143: Git tab – colored status badges for changed files

## Context

The Git tab’s “Changed files” list showed two-character status codes (M, D, A, ??, etc.) and paths in plain black/white text. Users wanted clearer visual distinction so status types are easier to scan.

## Decision

- Add a `getStatusStyle(status)` helper that maps the two-character `git status -sb` prefix to semantic colors:
  - **Modified (M)**: amber background + text
  - **Deleted (D)**: destructive (red) background + text
  - **Added (A)**: emerald/green background + text
  - **Untracked (??)**: muted
  - **Renamed (R) / Copied (C)**: blue
  - **Unmerged (U)**: destructive (red)
- Render each status as a small rounded badge (background + colored text) with tooltip describing the status.
- Keep file paths in default foreground for readability.
- Highlight “Current branch” value with `text-primary` so it stands out.

## Consequences

- Changed files are easier to scan; M/D/A/?? etc. are distinguishable at a glance.
- Works in both light and dark themes via `dark:` variants where used.
- No API or data changes; styling only in `ProjectGitTab.tsx`.
