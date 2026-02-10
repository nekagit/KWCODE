# 131. Robust Data Loading for API

## Context

The application was getting stuck in a perpetual loading state because the data loading API (`src/app/api/data/route.ts`) was designed to return a 500 error if the `data` directory or the expected JSON files within it were missing or malformed. This prevented the frontend from rendering any content, even an empty state, leading to a poor user experience during initial setup or in scenarios where data files were not yet present.

## Decision

To improve the robustness and user experience, the data loading API has been modified to handle missing `data` directory and JSON files more gracefully.

The changes include:
1.  **Removal of explicit `noDataDir` check**: The `if (noDataDir)` block that returned a 500 status when the `data` directory was not found has been removed.
2.  **Graceful handling of missing JSON files**: The `readJson` function, when unable to find or parse a JSON file, now returns `null`. This `null` value is then coalesced to an empty array (`[]`) using the nullish coalescing operator (`??`). This ensures that even if individual data files are missing, the API still returns a valid (though empty) data structure.
3.  **Comprehensive error handling in `catch` block**: The `catch` block now returns a full data structure with empty arrays for all data fields, along with the error message. This prevents a complete API failure and allows the frontend to receive a consistent response, enabling it to render an empty state or display a user-friendly error message.
4.  **Initial setup of `data` directory and files**: A `data` directory and empty JSON files (`all_projects.json`, `cursor_projects.json`, `tickets.json`, `features.json`, `prompts-export.json`) are now created during the initial setup to ensure the API has a valid structure to read from, even if empty.

## Status

Accepted

## Consequences

*   **Improved User Experience**: The application will no longer get stuck in a loading state due to missing data files. Users will see an empty state or a gracefully handled error message, allowing them to interact with other parts of the application or understand what needs to be configured.
*   **Increased API Resilience**: The data API is now more robust against missing or malformed data files, reducing the likelihood of server-side errors.
*   **Easier Development Setup**: Developers no longer need to manually create the `data` directory and JSON files to get the application running, simplifying the initial setup process.
*   **Consistent API Response**: The API consistently returns a defined data structure, even in error scenarios, which simplifies frontend data handling logic.

## References

*   `src/app/api/data/route.ts`
*   `data/all_projects.json`
*   `data/cursor_projects.json`
*   `data/tickets.json`
*   `data/features.json`
*   `data/prompts-export.json`
