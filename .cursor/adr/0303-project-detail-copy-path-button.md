# ADR 0303 — Project detail: Copy project path button

## Status

Accepted.

## Context

When viewing a project at `/projects/[id]`, users can copy the project's repo path from the Dashboard (project card "Copy path") or the command palette ("Copy first project path"). The project detail page itself had no inline action to copy the current project's path; users had to leave the page or open the palette to copy it.

## Decision

- Add a **Copy path** button to the project detail header in `ProjectDetailsPageContent.tsx`, next to the repo path metadata badge (the badge that shows `project.repoPath`).
- The button is shown only when `project.repoPath` is set. On click it copies `project.repoPath` to the clipboard via `copyTextToClipboard` from `@/lib/copy-to-clipboard`, with success or error toast.
- Styling: ghost, size sm, Copy icon; `aria-label="Copy project path to clipboard"` and `title="Copy path"` for accessibility.
- No new Tauri commands or libs; reuses existing `copyTextToClipboard`.

## Consequences

- Users can copy the current project's path from the project detail page in one click without opening the command palette or going to the Dashboard.
- Behaviour is consistent with the Dashboard project card "Copy path" and the command palette "Copy first project path" action.
