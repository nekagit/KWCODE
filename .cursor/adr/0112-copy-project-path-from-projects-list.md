# ADR 0112 — Projects list: Copy project path from card

## Status

Accepted.

## Context

The Projects list page shows each project as a card with name, description, repo path (as text), and meta. The project detail header already has a "Copy path" button that copies the repo path to the clipboard. On the list, users had to open a project to copy its path; there was no copy action on the card itself.

## Decision

- In **`ProjectCard`**, when `project.repoPath` is set, add a **Copy path** icon button (Copy from Lucide) next to the path text. On click: stop event propagation (so the card does not open), call `copyTextToClipboard(project.repoPath)` from `@/lib/copy-to-clipboard`. If path is empty, show toast "No project path set".
- Reuse existing `copyTextToClipboard`; no new lib module. Button is ghost, small, with aria-label "Copy project path to clipboard" and title "Copy path".

## Consequences

- Users can copy a project’s repo path from the Projects list without opening the project, matching the behaviour of the project detail header and improving keyboard/workflow efficiency.
- Minimal change: one component touch, one new ADR; follows existing copy/clipboard patterns in the app.
