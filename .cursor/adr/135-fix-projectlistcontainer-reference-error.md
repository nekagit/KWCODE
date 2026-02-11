# 135: Fix ProjectListContainer ReferenceError

## Status

Accepted

## Context

The console reported: `ReferenceError: Can't find variable: ProjectListContainer`. The component `ProjectListContainer` is defined in `src/components/molecules/ListsAndTables/ProjectListContainer.tsx` but was not imported or used anywhere in the app. The projects list page (`ProjectsListPageContent`) had been refactored to render a plain `<ul>` for "Your projects" and no longer referenced `ProjectListContainer`, which can cause the runtime (or a cached bundle) to expect the variable in scope when rendering the projects list.

## Decision

1. **Import** `ProjectListContainer` in `ProjectsListPageContent`.
2. **Use** it by wrapping the "Your projects" list in `<ProjectListContainer>`, so the component is in scope and the list is consistently wrapped in the shared grid container.

## Consequences

- The ReferenceError is resolved because `ProjectListContainer` is now imported and used on the projects list page.
- The "Your projects" list is wrapped in the same container abstraction used elsewhere (e.g. for project cards), keeping layout consistent.
- No behavioral change to the list itself; the inner `<ul>` and items are unchanged.
