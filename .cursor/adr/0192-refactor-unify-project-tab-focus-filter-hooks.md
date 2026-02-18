# ADR 0192: Refactor — Unify project-tab focus-filter hooks

## Status

Accepted.

## Context

Three hooks implemented the same "/" focus-filter behaviour for project detail tabs: `useProjectDesignFocusFilterShortcut` (Design tab), `useProjectArchitectureFocusFilterShortcut` (Architecture tab), and `useRunHistoryFocusFilterShortcut` (Run tab, `tab=worker`). Each duplicated pathname matching (`/projects/[id]`, exclude "new"), search-param check (`tab=…`), and keydown handling. This made changes and fixes harder and increased maintenance.

## Decision

- **New shared module** `src/lib/project-tab-focus-filter-shortcut.ts`:
  - Export `useProjectTabFocusFilterShortcut(inputRef, tab: 'design' | 'architecture' | 'worker')` with the single implementation of pathname/searchParams/keydown logic.
  - Export type `ProjectTabSlug` for the allowed tab values.
- **Thin wrappers** (behaviour unchanged, public API unchanged):
  - `project-design-focus-filter-shortcut.ts`: `useProjectDesignFocusFilterShortcut(inputRef)` calls `useProjectTabFocusFilterShortcut(inputRef, 'design')`.
  - `project-architecture-focus-filter-shortcut.ts`: `useProjectArchitectureFocusFilterShortcut(inputRef)` calls `useProjectTabFocusFilterShortcut(inputRef, 'architecture')`.
  - `run-history-focus-filter-shortcut.ts`: `useRunHistoryFocusFilterShortcut(inputRef)` calls `useProjectTabFocusFilterShortcut(inputRef, 'worker')`.
- No changes to call sites; no new features or bug fixes.

## Consequences

- One place to maintain path/tab/slash-to-focus logic for project tabs.
- Same public hook names and behaviour; existing tests and usage remain valid.
- Future project tabs that need "/" to focus a filter can reuse `useProjectTabFocusFilterShortcut` with a new tab slug (and update the type if we add tabs).
