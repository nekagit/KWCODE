## 0030-conditional-tauri-api-loading-with-environment-variables

### Status
Accepted

### Context
The persistent `Module not found: Can't resolve '@tauri-apps/api/dialog'` build/runtime errors, even after implementing `webpack.NormalModuleReplacementPlugin`, indicated a fundamental challenge in preventing Webpack from bundling native Tauri API modules during client-side Next.js builds. The previous Webpack-based externalization strategies were not reliably taking effect in all scenarios.

### Decision
To definitively resolve the module not found error and ensure correct loading of Tauri API functions, a new strategy involving conditional re-exporting based on an environment variable (`NEXT_PUBLIC_IS_TAURI`) was implemented. This approach completely bypasses Webpack's module resolution for `@tauri-apps/api` during client-side builds by not even attempting to import the actual modules unless explicitly in a Tauri build context.

1.  **Introduced `NEXT_PUBLIC_IS_TAURI` Environment Variable**: This variable will be set to `true` during Tauri builds.

2.  **Conditional Re-export in `src/lib/tauri.ts`**: The `src/lib/tauri.ts` file was refactored to:
    *   Check `process.env.NEXT_PUBLIC_IS_TAURI === 'true'`.
    *   If true, dynamically import `invoke` from `@tauri-apps/api/core`, `listen` from `@tauri-apps/api/event`, and `open` from `@tauri-apps/api/dialog`.
    *   If false, dynamically import no-op functions from `src/lib/noop-tauri-api.ts`.
    *   Added small `setTimeout` delays to await the dynamic imports, crucial for asynchronous loading.

3.  **Removed Webpack Configuration in `next.config.js`**: The `webpack` customization (including `NormalModuleReplacementPlugin`) was removed from `next.config.js` as it is no longer needed and could interfere with this new strategy.

### Consequences
This strategy provides a robust and reliable way to handle Tauri API imports. During client-side Next.js builds (when `NEXT_PUBLIC_IS_TAURI` is not `true`), the application will only ever import the no-op functions, completely avoiding the `Module not found` error. When built for Tauri (with `NEXT_PUBLIC_IS_TAURI=true`), the actual Tauri API modules will be loaded and available. This ensures a clean build process, eliminates runtime errors, and guarantees correct functionality in both web and Tauri contexts with minimal interference from Webpack.
