# ADR 114: Project details Git tab – button group for push, pull, commit, fetch

## Context

The project details page Git tab had only a single Refresh button next to the "Repository" title. Users wanted quick access to common Git operations (push, pull, commit, and similar) directly from the Git tab without switching to a terminal or external Git client.

## Decision

- Add a **button group** next to the Refresh button with:
  - **Fetch** – fetches from remote(s) without merging
  - **Pull** – pulls and merges from remote
  - **Push** – pushes current branch to remote
  - **Commit** – opens a dialog to stage all changes and commit with a message
  - **Refresh** – refreshes git info display (unchanged behavior)

- **Backend**: New Tauri commands: `git_fetch`, `git_pull`, `git_push`, `git_commit` (project_path, message). Reuse existing `run_git` helper; update it to return `Err` on non-zero exit so failures surface correctly.

- **Commit flow**: Commit button opens a Dialog with a textarea for the message. On submit, runs `git add -A` then `git commit -m "message"`. Non-empty message required. Success closes dialog and refreshes git info.

- **UI**: Connected button-group style (shared borders, `rounded-r-none` / `rounded-l-none` on ends). Each button shows a loading spinner while its operation runs. All buttons disabled during any git operation.

## Consequences

- Users can perform common Git operations from the project details Git tab without leaving the app.
- Errors (e.g. push rejected, merge conflict) surface as toast and in the error area; `run_git` now returns `Err` on failure for accurate error handling.
- Commit requires explicit message via dialog, reducing accidental empty commits.
