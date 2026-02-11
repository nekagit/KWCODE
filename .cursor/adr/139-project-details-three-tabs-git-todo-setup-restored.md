# ADR 139: Project details page — restore Git, Todo, Setup tabs

## Status

Accepted.

## Context

The project details page had previously been refactored to show all sections (Design, Ideas, Features, Tickets, Prompts, Architecture) in a single vertical stack. Users requested bringing back the three-tab layout (Git, Todo, Setup) so that:

1. **Git** — All git info for the project repository (status, branch, HEAD, branches, remotes, last commits, changed files, config preview).
2. **Todo** — All tickets, features, and prompts in one place for organizing and running work.
3. **Setup** — Design, architecture, ideas, and related configuration (linking and setup).

This aligns with ADR 074 (project details Git, Todos, Setup tabs).

## Decision

- **Three tabs** on the project details page:
  - **Git:** New `ProjectGitTab` component. When `repoPath` is set and the app runs in Tauri, calls `get_git_info(projectPath)` and renders: repository path, status (branch line), current branch, HEAD ref, changed files (from `status_short`), branches, remotes, last 30 commits, optional `.git/config` preview, and a Refresh button. When no repo path: prompt to set it via Edit project. When not Tauri: message that git info is only available in the desktop app.
  - **Todo (default):** Single tab containing `ProjectTicketsTab`, `ProjectFeaturesTab`, and `ProjectPromptRecordsTab` — all tickets, features, and prompts.
  - **Setup:** Single tab containing `ProjectDesignTab`, `ProjectIdeasTab`, and `ProjectArchitectureTab` — design, ideas, and architecture (and related linking/setup).
- **Default tab:** Todo, so users land on work items after opening the project.
- **Implementation:** `ProjectDetailsPageContent` uses `Tabs` (from `@/components/ui/tabs`) with `defaultValue="todo"` and three `TabsTrigger` values: `git`, `todo`, `setup`. Each `TabsContent` renders the corresponding section(s).

## Consequences

- Users get git context (status, branches, remotes, commits, changed files) in the Git tab when using the desktop build and a project with a repo path.
- Todo tab groups tickets, features, and prompts for execution and organization without leaving the page.
- Setup tab groups design, ideas, and architecture for one-time linking and configuration.
- Tab state is local; default is Todo. No new API or Tauri commands beyond existing `get_git_info`.
