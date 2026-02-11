# ADR 141: Git tab — Commit via in-app dialog instead of window.prompt

## Status

Accepted.

## Context

The Git tab Commit button (ADR 140) used `window.prompt("Commit message:")` to get the commit message. In the Tauri desktop app, native browser dialogs (`prompt`, `alert`, `confirm`) often do not appear or are blocked in the webview, so clicking Commit appeared to do nothing with no user feedback.

## Decision

- Replace `window.prompt` with an **in-app commit dialog**:
  - Clicking **Commit** opens a modal (shared `Dialog` component) with a labeled **Commit message** input and **Cancel** / **Commit** buttons.
  - User types the message and clicks **Commit** or presses Enter to submit; **Cancel** or dialog close dismisses without committing.
  - Empty message: **Commit** button is disabled; submitting empty shows a toast: "Enter a commit message."
  - On submit: dialog closes, `git_commit` is invoked, then success/error toast and git info refresh (unchanged).
- Reuse existing UI: `Dialog` from `@/components/shared/Dialog`, `Input` and `Label` from `@/components/ui`.

## Consequences

- Commit works reliably in Tauri and in browser; no dependency on native `window.prompt`.
- Consistent UX with the rest of the app (modals instead of native dialogs).
- Clear feedback when the message is missing (toast + disabled primary action).
