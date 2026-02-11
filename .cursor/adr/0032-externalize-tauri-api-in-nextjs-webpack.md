# 0032-externalize-tauri-api-in-nextjs-webpack.md

## Title
Externalize Tauri API in Next.js Webpack Configuration

## Status
Accepted

## Context
When running the Next.js application in development mode with Tauri, a "Module not found: Can't resolve '@tauri-apps/api/dialog'" error occurred. This issue arose because Webpack, during the Next.js client-side build process, was attempting to bundle the `@tauri-apps/api` modules, even though they are designed to be dynamically loaded and are only available within the Tauri environment.

The `src/lib/tauri.ts` file conditionally imports these modules based on the `NEXT_PUBLIC_IS_TAURI` environment variable, with a fallback to `src/lib/noop-tauri-api.ts` for non-Tauri builds. However, Webpack's default behavior still tried to resolve and bundle these modules, leading to the error.

## Decision
To resolve the "Module not found" error, the `@tauri-apps/api` modules are externalized in the `next.config.js` Webpack configuration. This ensures that Webpack treats these modules as external dependencies, preventing them from being bundled with the client-side code.

The `next.config.js` file is modified to include a custom Webpack configuration that pushes specific `@tauri-apps/api/*` modules into the `config.externals` array when the build is for the server-side (to prevent bundling in the client-side code). This ensures that these modules are resolved at runtime in the Tauri environment rather than during the build process.

## Consequences
- **Resolution of Module Not Found Error**: The primary consequence is the elimination of the "Module not found: Can't resolve '@tauri-apps/api/dialog'" error, allowing the application to build and run correctly in the Tauri development environment.
- **Correct Module Resolution**: Ensures that `@tauri-apps/api` modules are correctly resolved and loaded only when the application is running within the Tauri context.
- **No Impact on Non-Tauri Builds**: The `!isServer` condition in the Webpack configuration ensures that this externalization only applies to the client-side build, thus not affecting standard Next.js web builds.
- **Maintainability**: Centralizing this configuration in `next.config.js` improves the maintainability of the project's build process, making it explicit how Tauri API modules are handled.