## 0019-resolve-tauri-api-module-not-found

### Status
Accepted

### Context
A build error (`Module not found: Can't resolve '@tauri-apps/api/dialog'`) occurred when building the Next.js application integrated with Tauri. This error typically arises when the Tauri API is imported in a context where it's not available, such as during Next.js's server-side rendering or static build process.

### Decision
To resolve the `Module not found` error, the `src/lib/tauri.ts` file was modified to dynamically import the `@tauri-apps/api/dialog` module. This ensures that the Tauri API is only loaded when the application is running within a Tauri desktop environment, as indicated by the presence of `window.__TAURI__`.

Specifically, the `showOpenDirectoryDialog` function was updated to include a conditional check for `window.__TAURI__` and use a dynamic `import()` statement for `@tauri-apps/api/dialog`.

### Consequences
This change prevents Webpack from attempting to resolve the `@tauri-apps/api/dialog` module during a non-Tauri build, thereby resolving the build error. The native file browsing functionality will now correctly operate when the application is run within the Tauri desktop environment, while gracefully falling back to a mock path (and a warning) in other contexts.
