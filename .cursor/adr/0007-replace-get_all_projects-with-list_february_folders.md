# 0007-replace-get_all_projects-with-list_february_folders

## Status

Accepted

## Context

The frontend application was attempting to invoke a Tauri command named `LIST_PROJECTS` which does not exist in the backend (`src-tauri/src/lib.rs`). This resulted in an error: `ERROR:COMMAND LIST_PROJECTS NOT FOUND`.

Upon investigation, it was determined that the `src-tauri/src/lib.rs` file provides two relevant commands for listing projects:
- `get_all_projects`: This command retrieves all projects from the database.
- `list_february_folders`: This command lists all subdirectories of the parent of the project root (specifically, the "February" folder), which is intended for displaying local projects.

The `src/store/run-store.ts` was calling `get_all_projects` to populate the `allProjects` state. However, the error message indicates a call to `LIST_PROJECTS`, suggesting a potential mismatch or a misunderstanding of the intended functionality. Given the context of displaying local projects in the UI, `list_february_folders` seems to be the more appropriate command for populating the list of available projects for the user to select from.

## Decision

Replace the invocation of `get_all_projects` with `list_february_folders` in `src/store/run-store.ts`.

Specifically, the line:
```typescript
invoke<string[]>("get_all_projects"),
```
was changed to:
```typescript
invoke<string[]>("list_february_folders"),
```

## Consequences

- The frontend will now correctly retrieve the list of local project folders from the "February" directory using the `list_february_folders` command.
- The `ERROR:COMMAND LIST_PROJECTS NOT FOUND` error will be resolved.
- The `allProjects` state in the `run-store` will be populated with the paths returned by `list_february_folders`.
- This change ensures that the application's project listing functionality aligns with the available backend commands and the intended display of local projects.
