# 0009-replace-list-projects-with-list-february-folders

## Status

Accepted

## Context

The frontend application in `src/lib/api-projects.ts` was attempting to invoke a Tauri command named `list_projects` when running in a Tauri environment. This command does not exist in the backend (`src-tauri/src/lib.rs`), which resulted in the error: `ERROR:COMMAND LIST_PROJECTS NOT FOUND`.

The backend `src-tauri/src/lib.rs` provides a command `list_february_folders` which is intended for listing all subdirectories of the parent of the project root (specifically, the "February" folder). This command is appropriate for displaying local projects in the frontend.

## Decision

Replace the invocation of `list_projects` with `list_february_folders` in `src/lib/api-projects.ts`.

Specifically, the line:
```typescript
return invoke("list_projects");
```
was changed to:
```typescript
return invoke("list_february_folders");
```

## Consequences

- The frontend will now correctly retrieve the list of local project folders from the "February" directory using the `list_february_folders` command.
- The `ERROR:COMMAND LIST_PROJECTS NOT FOUND` error will be resolved.
- This change ensures that the application's project listing functionality aligns with the available backend commands and the intended display of local projects.
