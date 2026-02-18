# ADR 0135 — Project Design and Architecture tabs: Persist filter and sort per project

## Status

Accepted.

## Context

The project detail **Design** and **Architecture** tabs each have a filter-by-name input and a sort dropdown (Name A–Z / Z–A). Previously, neither filter nor sort was persisted; when users switched projects or tabs and returned, the filter and sort reset. Other areas (Ideas page, Projects list, Prompts page, Run history) already persist view preferences in localStorage. Users expect the same behaviour on Design and Architecture so they can resume work without re-entering filters.

## Decision

- Add **`src/lib/project-design-architecture-preferences.ts`** with per-project preferences keyed by sanitized `projectId`:
  - **Design:** keys `kwcode-project-design-prefs-{id}`; store `{ filterQuery: string, sortOrder: "name-asc" | "name-desc" }`; filter query capped at 500 chars. Export `getProjectDesignPreferences(projectId)`, `setProjectDesignPreferences(projectId, partial)`, and default constants.
  - **Architecture:** keys `kwcode-project-architecture-prefs-{id}`; same shape and helpers.
- **ProjectDesignTab:** Initialize `filterQuery` and `sortOrder` from `getProjectDesignPreferences(projectId)`. Debounce (300 ms) writing `filterQuery` via `setProjectDesignPreferences`. On sort change, write immediately. On "Reset filters", set local state to defaults and call `setProjectDesignPreferences(projectId, defaults)`.
- **ProjectArchitectureTab:** Same pattern using architecture preference getters/setters.

## Consequences

- Filter and sort on Design and Architecture tabs are restored when returning to the same project.
- Aligns with Ideas, Projects list, Prompts, and Run history persistence patterns.
- No new UI; only persistence behaviour. Run `npm run verify` to confirm tests, build, and lint pass.
