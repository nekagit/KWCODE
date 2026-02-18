# ADR 0262: Dashboard — Copy path on project cards

## Status

Accepted.

## Context

The Projects list page uses `ProjectCard` (in `CardsAndDisplay/ProjectCard.tsx`) with a "Copy path" button; the project detail header also has "Copy path". The Dashboard shows project cards via an inline `ProjectCard` in `DashboardOverview.tsx` that only navigates to the project on click and has no copy action. Users on the Dashboard had to open the project or go to the Projects list to copy a project's repo path.

## Decision

Add a **Copy path** button to each Dashboard project card:

- In `DashboardOverview.tsx`, in the inline `ProjectCard`, add a small ghost button with the Copy icon that calls `copyTextToClipboard(project.repoPath)` from `@/lib/copy-to-clipboard`.
- Use `e.preventDefault()` and `e.stopPropagation()` on click so the card does not navigate.
- When `project.repoPath` is missing or empty, show toast "No project path set".
- Use the same accessibility and styling as the Projects list ProjectCard: `aria-label="Copy project path to clipboard"`, `title="Copy path"`, ghost/sm button.

## Consequences

- Users can copy a project's repo path from the Dashboard without opening the project or the Projects list.
- Parity with the Projects list card and project detail header for copy-path actions.
- Single file change; reuses existing `copyTextToClipboard` and toast behavior.
