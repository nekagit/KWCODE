# ADR 078: Project details Git tab – show changed files (git status)

## Context

The project details page Git tab already showed branch info, working tree summary (clean / modified count), branch tree, remotes, and recent commits. The underlying data (`get_git_info` → `status_short` from `git status -sb`) includes the full list of changed files (the lines after the first branch line), but that list was not shown in the UI. Users wanted to see the same changed files they see when running `git status` directly.

## Decision

- Add a **Changed files (git status)** card on the Git tab when there are uncommitted changes.
- The card lists each file line from `status_short` (lines after the branch line), with a two-character status prefix (e.g. ` M`, `M `, ` D`, `??`) and the file path.
- Use a scrollable list (ScrollArea) so many files don’t overflow; style the status prefix (staged vs unstaged vs untracked) for quick scanning.
- Reuse existing `gitInfo.status_short`; no new Tauri command or API change.

## Consequences

- Users can see the current changed files from git status on the project details page without leaving the app or running `git status` in a terminal.
- The card only appears when there is at least one changed file; a clean working tree does not show an empty “Changed files” card.
