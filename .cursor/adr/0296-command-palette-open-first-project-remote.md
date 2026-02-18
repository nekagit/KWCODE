# ADR 0296 — Command palette: Open first project's remote in browser

## Context

The app has a "View source" command palette action that opens the **app** repository (from `NEXT_PUBLIC_APP_REPOSITORY_URL`) in the browser. The project Git tab shows remotes via Tauri `get_git_info`, but there was no way to open the **first active project's** Git remote (e.g. GitHub or GitLab URL) from the command palette. Users had to open the project, go to the Versioning/Git tab, and copy or open the remote from there.

## Decision

- Add a **Command palette** action **"Open first project's remote in browser"** that:
  - Resolves the first active project (same as other "first project" actions).
  - In browser (non-Tauri) mode: show toast "Open first project's remote is available in the desktop app." and close the palette.
  - In Tauri: invoke `get_git_info(projectPath)`, parse the first URL from `remotes` (output of `git remote -v`) via a small lib, then open that URL in a new tab with `window.open(url, '_blank', 'noopener,noreferrer')`.
- **New lib** `src/lib/parse-first-remote-url.ts`: `parseFirstRemoteUrl(remotes: string): string | null` to extract the first `http://` or `https://` URL from `git remote -v` output.
- No new Tauri commands; reuse existing `get_git_info`.
- Document the new action in `src/data/keyboard-shortcuts.ts` (Command palette section).

## Consequences

- Users can open the first project's remote (e.g. GitHub repo) in one action from the command palette (⌘K) without opening the project or Git tab.
- Behaviour is consistent with other "first project" actions (select project first; in browser mode show desktop-only toast).
- Optional trailing `.git` is stripped from the opened URL for cleaner browser display.
