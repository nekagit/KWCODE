1. Context
    Project cards in the UI were appearing without titles, as the `listProjects` function in `src/lib/api-projects.ts`, when running in Tauri, was returning only folder paths via `list_february_folders` instead of full `Project` objects.

2. Decision
    The `listProjects` function in `src/lib/api-projects.ts` was modified to transform the array of folder paths returned by `list_february_folders` into an array of `Project` objects. Each `Project` object now has its `id` set to the full path and its `name` derived from the folder name.

3. Status
    Completed.

4. Consequences
    Project cards in the UI will now display correctly with their respective names. This ensures that the projects are properly represented in the interface, improving user experience.