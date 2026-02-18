# ADR 0195: Refactor — Unify page-level focus-filter hooks

## Status

Accepted.

## Context

Five hooks implemented the same "/" focus-filter behaviour for top-level pages: `useDashboardFocusFilterShortcut` ("/"), `useProjectsFocusFilterShortcut` ("/projects"), `usePromptsFocusFilterShortcut` ("/prompts"), `useIdeasFocusFilterShortcut` ("/ideas"), and `useTechnologiesFocusFilterShortcut` ("/technologies"). Each duplicated pathname check and keydown handling (focus input on "/" unless already in INPUT/TEXTAREA/SELECT). This duplicated logic already had a counterpart for project-detail tabs (ADR 0192: `useProjectTabFocusFilterShortcut`); page-level hooks only need exact pathname match, no search params.

## Decision

- **New shared module** `src/lib/page-focus-filter-shortcut.ts`:
  - Export `usePageFocusFilterShortcut(inputRef, pathnameMatch: string)` with the single implementation of pathname/keydown logic for exact pathname match.
- **Thin wrappers** (behaviour unchanged, public API unchanged):
  - `dashboard-focus-filter-shortcut.ts`: `useDashboardFocusFilterShortcut(inputRef)` calls `usePageFocusFilterShortcut(inputRef, "/")`.
  - `projects-focus-filter-shortcut.ts`: calls `usePageFocusFilterShortcut(inputRef, "/projects")`.
  - `prompts-focus-filter-shortcut.ts`: calls `usePageFocusFilterShortcut(inputRef, "/prompts")`.
  - `ideas-focus-filter-shortcut.ts`: calls `usePageFocusFilterShortcut(inputRef, "/ideas")`.
  - `technologies-focus-filter-shortcut.ts`: calls `usePageFocusFilterShortcut(inputRef, "/technologies")`.
- No changes to call sites; no new features or bug fixes. Shortcuts-help and project-tab focus filters remain separate (dialog open state or tab search param).

## Consequences

- One place to maintain path + "/" keydown logic for simple page-level filter focus.
- Same public hook names and behaviour; existing usage remains valid.
- New pages that need "/" to focus a filter can reuse `usePageFocusFilterShortcut` with the page pathname.
