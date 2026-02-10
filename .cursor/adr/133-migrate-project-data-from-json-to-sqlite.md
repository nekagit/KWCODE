# 133. Migrate Project Data from JSON to SQLite

## Context

Previously, various project-related data (projects list, prompts, designs, ideas, architectures, etc.) were stored and managed using individual JSON files within the `data/` directory. This approach presented several challenges:

*   **Data Consistency**: Maintaining consistency across multiple JSON files, especially when linking entities (e.g., projects to prompts or designs), was prone to errors and difficult to scale.
*   **Data Integrity**: There was no built-in mechanism to enforce data types, relationships, or constraints, leading to potential data corruption.
*   **Complexity in API**: The Next.js API route (`/api/data/route.ts`) and Tauri commands (`src-tauri/src/lib.rs`) had complex logic to read, parse, and sometimes merge data from disparate JSON files.
*   **Performance**: Reading and parsing multiple JSON files for each request could introduce performance overhead, especially with larger datasets.
*   **Development Overhead**: Developers had to manually manage JSON files, and any schema changes required manual updates across multiple files.

## Decision

To address these issues and improve the overall data management of the application, a decision was made to migrate all project-related data from JSON files to a centralized SQLite database. This leverages the existing `rusqlite` and `kv_store` infrastructure already present in the Tauri backend.

The migration involves the following key changes:

1.  **Database Schema Updates (`src-tauri/src/db.rs`)**:
    *   Introduced new dedicated tables for `prompts` and `designs` with defined fields (`id`, `title`, `content`, `created_at`, `updated_at` for prompts; `id`, `name`, `description`, `image_url`, `created_at`, `updated_at` for designs).
    *   The `init_schema` function was updated to create these tables if they don't already exist.

2.  **Database Interaction Functions (`src-tauri/src/db.rs`)**:
    *   Implemented Rust functions (`get_prompts`, `save_prompts`, `get_designs`, `save_designs`) to perform CRUD (Create, Read, Update, Delete) operations on the new `prompts` and `designs` tables. These functions are consistent with existing database interaction patterns (e.g., `get_tickets`, `save_tickets`).

3.  **Refactoring Next.js API Route (`src/app/api/data/route.ts`)**:
    *   The API route was completely refactored to remove all `fs` and `path` imports and logic related to reading JSON files.
    *   It now exclusively uses Tauri `invoke` calls to interact with the Rust backend's database functions, fetching `allProjects`, `activeProjects`, `prompts`, `tickets`, `features`, and `designs` directly from SQLite.
    *   Error handling was improved to return empty arrays for data in case of errors, preventing a stuck loading state in the frontend.

4.  **TypeScript Seeding Files (`data/seed/*.ts`)**:
    *   A new `data/seed/` directory was created, containing `prompts.ts` and `designs.ts`. These files export arrays of `Prompt` and `Design` objects with initial seed data, conforming to the new database schemas.

5.  **Tauri Backend Logic (`src-tauri/src/lib.rs`)**:
    *   The `Prompt` and `Design` structs were defined, replacing the old `PromptItem` struct.
    *   Tauri commands (`get_prompts`, `save_prompts`, `get_designs`, `save_designs`) were implemented to expose the new database interaction functions to the frontend.
    *   The `with_db` function was modified to remove the old `db::migrate_from_json` call and now invokes a `seed_initial_data` function. This seeding logic checks if the tables are empty and, if so, populates them with data from the `data/seed/*.ts` files.
    *   All remnants of JSON file-based project management (e.g., `PROJECTS_JSON`, `projects_path`, `read_projects_json`, `write_projects_json`, `list_projects`, `get_project`, `create_project`, `update_project`, `delete_project`, `read_data_json_array`) were removed.
    *   The `get_features` and `save_features` commands were updated to exclusively use database interactions.
    *   The `save_active_projects` command was updated to remove JSON file writing logic.
    *   The `invoke_handler!` macro was updated to register the new Tauri commands and remove the old, deprecated ones.

6.  **Frontend Adjustments (`src/lib/api-projects.ts`, `src/app/projects/page.tsx`, `src/app/projects/[id]/page.tsx`)**:
    *   The `src/lib/api-projects.ts` file was simplified, removing functions for `listProjects`, `getProject`, `createProject`, `updateProject`, and `deleteProject`. The `getProjectResolved` and `getProjectExport` functions now directly fetch data from the `/api/data` endpoint, which is backed by the SQLite database.
    *   Frontend components `src/app/projects/page.tsx` and `src/app/projects/[id]/page.tsx` (and other related components) are expected to consume data from the unified `/api/data` endpoint, benefiting from the consistent `ResolvedProject` structure.

## Status

Accepted

## Consequences

*   **Improved Data Integrity and Consistency**: Centralizing data in SQLite ensures stronger data integrity through schema enforcement and transactional operations.
*   **Simplified API Logic**: The Next.js API route is now leaner and acts as a direct proxy to the Tauri backend, reducing duplicated data handling logic.
*   **Enhanced Scalability**: The database-driven approach is more scalable and performant for larger datasets compared to reading and parsing multiple JSON files.
*   **Streamlined Development**: Developers now interact with a structured database, which simplifies data access and modification.
*   **Easier Seeding**: Initial data seeding is now integrated directly into the Rust backend, ensuring consistent starting data for development and new installations.

## References

*   `src-tauri/src/db.rs`
*   `src-tauri/src/lib.rs`
*   `src/app/api/data/route.ts`
*   `data/seed/prompts.ts`
*   `data/seed/designs.ts`
*   `src/lib/api-projects.ts`
*   `src/app/projects/page.tsx`
*   `src/app/projects/[id]/page.tsx`
