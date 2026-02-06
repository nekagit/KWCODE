# ADR 074: Project details page — Git, Todos, and Setup tabs

## Status

Accepted.

## Context

The project details page previously showed all content in a single long list of accordions (Project Spec, Files in .cursor, Designs, Architecture, Prompts, Tickets, Features, Ideas, Categorization, Link to this project). Users wanted:

1. **Git and repo context** in the app: see branches, status, remotes, commits, and `.git`-related info for the project repo.
2. **A dedicated Todos area** to organize and run work: Project Spec files, Features, and Tickets in one place, with Run / Add to queue actions so the next tasks can be executed without leaving the page.
3. **A Setup area** for linking and configuration (Prompts, Ideas, Categorization, Architecture, Design, Link to this project) so they can set things up once and then focus on the Todos tab.

## Decision

- **Three tabs** on the project details page:
  - **Git:** All git info for the project repository when `repoPath` is set and the app runs in Tauri. Backed by a new Tauri command `get_git_info(project_path)` that runs `git status -sb`, `git branch -a`, `git log -n 30 --oneline`, `git remote -v`, and reads `.git/HEAD` and `.git/config` (preview). Rendered as read-only sections: Status, Current branch, HEAD, Branches, Remotes, Last 30 commits, optional config preview, and a Refresh button.
  - **Todos (default):** Single place to organize and run work:
    - Project Spec: list of spec files with preview, add/remove, and “Download all to .cursor” (unchanged behavior).
    - Files in .cursor: tree/list and “Add to spec” (unchanged).
    - Features: linked features with **Run now** (invoke run store `runWithParams` with feature’s prompts and project paths) and **Add to run queue** (`addFeatureToQueue`).
    - Tickets: linked tickets with **Run** (invoke `runWithParams` with ticket’s prompt_ids and project repo path), plus Analysis and link to Tickets tab.
  - **Setup:** Accordions only: Prompts (linked list + link to Prompts page), Ideas (linked list + link to Ideas page), Categorization (phase/step/organization/categorizer/other), Architecture (linked + Analysis + Open Architecture + drag-drop from spec), Design (linked + Analysis + Open Design + drag-drop from spec), Link to this project (checkboxes + Save links). No duplicate Tickets or Features accordions here; linking is done via “Link to this project”.
- **Backend:** New Tauri command `get_git_info(project_path: String) -> Result<GitInfo, String>`. `GitInfo` struct includes `current_branch`, `branches`, `remotes`, `status_short`, `last_commits`, `head_ref`, `config_preview`. Implemented via `std::process::Command` running `git` in the project path and reading `.git` files; no new Tauri permissions.
- **Frontend types:** `GitInfo` interface in `src/types/git.ts` to type the command response.
- **Default tab:** Todos, so users can focus on work after setup.

## Consequences

- Users get full git context (status, branches, remotes, recent commits, HEAD, config) inside the app when using the desktop build and a project with a repo path.
- Run and queue actions are available from the project details page for features and tickets, reducing context switching to the Run page.
- Setup (linking and categorization) is separated from execution (Todos), making the page easier to scan and use.
- The project details page remains a single route; tab state is local (default “todos”). No new permissions or dependencies beyond existing Tauri and `std::process::Command`.
