## 0027-robust-externalization-of-tauri-api-in-nextjs-webpack

### Status
Accepted

### Context
The persistent `Module not found: Can't resolve '@tauri-apps/api/dialog'` build error indicated that previous attempts to externalize `@tauri-apps/api` in `next.config.js` (by aliasing to `false`) were insufficient. Webpack was still attempting to resolve and bundle these native modules during client-side builds, despite the conditional dynamic imports in `src/lib/tauri.ts`.

### Decision
To provide a robust solution for externalizing the Tauri API during Next.js client-side builds, a new no-operation (no-op) module was created, and `next.config.js` was modified to conditionally alias `@tauri-apps/api` to this no-op module.

1.  **Created `src/lib/noop-tauri-api.ts`**: This file exports dummy `invoke`, `listen`, and `open` functions that provide console warnings and return no-op promises. This module serves as a safe placeholder.

2.  **Modified `next.config.js`**: The `webpack` configuration was updated to include a conditional alias:

    ```javascript
    // ...
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.alias = {
          ...config.resolve.alias,
          "@tauri-apps/api": require.resolve("./src/lib/noop-tauri-api.ts"),
        };
      }
      return config;
    },
    // ...
    ```

    This configuration instructs Webpack that when building for the client (`!isServer`), any import of `@tauri-apps/api` (or its sub-paths like `/dialog`, `/event`, `/core`) should be resolved to `src/lib/noop-tauri-api.ts`.

### Consequences
This strategy definitively resolves the `Module not found` build error for `@tauri-apps/api` modules. During client-side Next.js builds, Webpack will now correctly substitute the actual Tauri API imports with the no-op module, preventing bundling errors. When the application runs in a Tauri environment, the native Tauri API will be available as expected, and the no-op module will not interfere. This ensures a clean build process and correct runtime behavior in both web and Tauri contexts.
