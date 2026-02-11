# Architecture Decision Record: Resolving Tauri/Next.js Development Issues

## 1. Context

During the initial setup and execution of the `tauri dev` command, several issues were encountered that prevented the application from running correctly. These issues included:

- **Module Not Found Error:** `ProjectCheckboxListItem` could not be resolved in `src/components/molecules/TabAndContentSections/ProjectsTabContent.tsx`.
- **Port Already In Use Error:** The development server failed to start because port 4000 was already in use.
- **`styled-jsx` Module Not Found Error:** Next.js failed to find the `styled-jsx/package.json` module.
- **Turbopack/Webpack Conflict:** The build process encountered an error indicating a conflict between Turbopack (default in Next.js 16) and an existing Webpack configuration, despite no explicit Turbopack configuration.

## 2. Decision

To address these issues and ensure the successful launch of the Tauri/Next.js development environment, the following decisions were made:

1.  **Correct `ProjectCheckboxListItem` Import Path:** The import path for `ProjectCheckboxListItem` was corrected to `src/components/atoms/list-items/ProjectCheckboxListItem.tsx`.
2.  **Terminate Process on Port 4000:** The process occupying port 4000 was identified and terminated to free up the port for the development server.
3.  **Install `styled-jsx`:** The missing `styled-jsx` package was installed using `npm install styled-jsx`.
4.  **Clean `node_modules` and Reinstall Dependencies:** A clean reinstall of `npm` dependencies was performed by removing `node_modules` and `package-lock.json`, and then running `npm install`. This was preceded by killing all `node` processes to ensure the `node_modules` directory could be completely removed.
5.  **Explicitly Configure Webpack in `next.config.js`:** A `next.config.js` file was created with `webpack: true` to explicitly tell Next.js to use Webpack instead of the default Turbopack, resolving the conflict.
6.  **Explicitly Enable Webpack in `package.json` Dev Script:** The `dev` script in `package.json` was modified to include the `--webpack` flag, further reinforcing the use of Webpack.

## 3. Consequences

-   **Positive:** The Tauri/Next.js application now starts successfully in development mode, allowing for further development and testing.
-   **Positive:** The explicit configuration of Webpack ensures compatibility with existing project configurations that may not yet be compatible with Turbopack.
-   **Negative:** The Rust compiler still shows warnings about unused functions. While these do not prevent the application from running, they indicate areas for potential code cleanup in the future.
-   **Neutral:** The use of `npm cache clean --force` was necessary to resolve dependency corruption but should be used judiciously in other contexts.

## 4. Alternatives Considered

-   **Migrating to Turbopack:** While migrating to Turbopack might offer performance benefits in the long run, the immediate goal was to get the development server running with minimal changes. Explicitly configuring Webpack provided a quicker resolution.
-   **Ignoring `styled-jsx` error:** This was not a viable option as it prevented the Next.js server from starting.
-   **Manually searching for and killing the process:** This was the chosen approach for resolving the port conflict, as there wasn't an immediate programmatic way to handle it within the existing scripts. Ideally, a more robust solution for port management could be explored in the future if this issue recurs frequently.
