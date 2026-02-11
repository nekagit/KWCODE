# 0003-remove-unused-tauri-commands-and-db-functions

## Status

Accepted

## Context

During a recent refactoring and code audit, several unused functions were identified in the Tauri backend, specifically in `src-tauri/src/lib.rs` and `src-tauri/src/db.rs`. These functions were flagged by the Rust compiler with "function is never used" warnings.

### Unused Functions Identified:

- `src-tauri/src/lib.rs`:
    - `get_project_resolved`: This function was intended to retrieve project details, but its implementation returned dummy data and was not integrated into any active workflows.
    - `list_data_files`: This function was meant to list data files but was not called anywhere in the application logic.

- `src-tauri/src/db.rs`:
    - `migrate_from_json`: This function was designed for data migration from JSON files to the database, but this migration path is no longer in use or necessary.
    - `set_data_dir`: This function was used to set the data directory path in the database, but the mechanism for managing the data directory has been updated, rendering this function obsolete.

These unused functions contribute to code bloat, increase the cognitive load for developers, and can potentially introduce maintenance overhead without providing any active utility to the application.

## Decision

The decision is to remove the identified unused functions from the codebase. This includes:

1.  **Removing function definitions and their `#[tauri::command]` attributes** from `src-tauri/src/lib.rs`.
2.  **Removing function definitions** from `src-tauri/src/db.rs`.
3.  **Removing references to these functions** from the `tauri::generate_handler!` macro in `src-tauri/src/lib.rs`.

## Consequences

-   **Improved Code Health**: Removal of dead code reduces overall code size, making the codebase cleaner, easier to understand, and less prone to errors.
-   **Reduced Build Times**: Fewer lines of code and functions can lead to slightly faster compilation times, especially in larger projects.
-   **Reduced Cognitive Load**: Developers will no longer encounter unused code, which can be a distraction and lead to confusion during development and debugging.
-   **No Functional Impact**: Since the removed functions were not actively used, their removal will not impact any existing application features or user workflows.
-   **Elimination of Compiler Warnings**: The Rust compiler warnings regarding unused functions will be resolved, contributing to a cleaner build output.

This decision aligns with best practices for code maintenance and aims to keep the codebase lean and efficient.