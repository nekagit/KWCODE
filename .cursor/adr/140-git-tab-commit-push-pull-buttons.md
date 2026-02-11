# ADR 140: Git tab — add Commit, Push, Pull button group at top right

## Status

Accepted.

## Context

The Git tab (ProjectGitTab) showed repository status, branches, remotes, commits, and changed files with a single Refresh button. Users needed a quick way to run common git operations (pull, commit, push) without leaving the app. The Tauri backend already exposed `git_pull`, `git_push`, and `git_commit` commands.

## Decision

- Add a **button group at the top right** of the Git tab containing:
  - **Pull** — invokes `git_pull(projectPath)`, then refreshes git info; shows loading state and toast on success/error.
  - **Commit** — prompts for a commit message via `window.prompt`, then invokes `git_commit(projectPath, message)` (backend runs `git add -A` and `git commit -m`), then refreshes; toast on success/error.
  - **Push** — invokes `git_push(projectPath)`, then refreshes; toast on success/error.
  - **Refresh** — existing behavior (re-fetch git info).
- Use the shared **ButtonGroup** component with `alignment="right"` and outline buttons; icons: `GitPullRequest`, `GitCommit`, `Upload` (push).
- Disable all buttons while any action or refresh is in progress; show a spinner on the active action button.
- Labels: visible on larger screens (`sm:not-sr-only`), screen-reader only on small; tooltips via `title` for clarity.

## Consequences

- Users can pull, commit (with prompt for message), and push from the Git tab without using a terminal.
- Commit uses a simple browser prompt; a future improvement could be a proper dialog with message field and optional stage selection.
- All actions refresh git info after success so the tab stays in sync.
