# ADR 144: Git tab — remove icon and title from header row

## Status

Accepted.

## Context

The Git tab (ProjectGitTab) showed a header row with a FolderGit2 icon and "Git" label on the left, and the action buttons (Pull, Commit, Push, Refresh) on the right. The tab is already identified as "Git" in the parent tab bar (ProjectDetailsPageContent), so the duplicate icon and title in the content area were redundant.

## Decision

- Remove the left-side header block (FolderGit2 icon + "Git" text) from the Git tab content header row.
- Keep only the button group (Pull, Commit, Push, Refresh) in that row.
- Use `justify-end` on the row so the buttons remain aligned to the right.

## Consequences

- Cleaner Git tab header with no redundant icon/title; tab identity is clear from the parent tab trigger.
- FolderGit2 remains used in loading, error, and empty states within the same component.
