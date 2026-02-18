# ADR 0106 — Versioning tab: bigger, colorful changes section and overview

## Status

Accepted.

## Context

The Versioning (Git) tab’s “Changed files” block was compact (fixed 200px height) and status badges did not use the intended color coding from `getStatusStyle()` (the dynamic `className` was not applied because it lived in a static Tailwind catalog string). Users wanted a larger changes area, clearer colors, and a quick overview.

## Decision

- **Changes section container:** Wrap the “Changed files” card in a distinct container with `border-2 border-amber-500/20`, subtle gradient `from-card to-amber-500/5`, and rounded corners so it reads as the main overview block.
- **Size:** Increase the changed-files list height to `min-h-[280px] h-[42vh] max-h-[520px]` so more files are visible without scrolling and it scales with viewport.
- **Overview line:** Add a header row with “Changed files” and, when there are changes, a summary “X file(s) changed” plus a small legend (M, A, D, ??) with the same color semantics as the list badges (amber=modified, emerald=added, destructive=deleted, muted=untracked).
- **Status badges:** Apply the dynamic `getStatusStyle(status).className` via `cn()` so each row’s status badge uses the correct color (modified, added, deleted, untracked, etc.).
- **Empty state:** When there are no changed files, show a larger, dashed-border empty area with centered “No changed files” for consistency.
- **Tailwind catalog:** Replace the placeholder `${className}` in the ProjectGitTab badge class with a fixed base class; the component merges the status-specific class with `cn()`.

## Consequences

- The Versioning tab gives a clearer, more scannable overview of changes with color-coded status and a larger list.
- Status colors (M/A/D/??) are consistent in both the legend and the list.
- Layout remains responsive and works in the existing project-detail tab layout.
