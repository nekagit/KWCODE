## 0024-resolve-tauri-invoke-runtime-type-error

### Status
Accepted

### Context
A `Runtime TypeError` occurred: `(0,_LIB_TAURI__WEBPACK_IMPORTED_MODULE_0__.INVOKE) IS NOT A FUNCTION`. This error indicated that the `invoke` function was being imported and called from `src/lib/tauri.ts` in various parts of the application (e.g., `src/lib/api-projects.ts`, `src/store/run-store.ts`) but was not exported by that module. Previous changes addressed `isTauri` and `listen`, but `invoke` was still missing.

### Decision
To resolve the `Runtime TypeError`, a new function named `invoke` was added and exported from `src/lib/tauri.ts`. This function dynamically imports the `invoke` function from `@tauri-apps/api/core` when the application is running in a Tauri environment. A warning and a rejected promise are provided as a fallback for non-Tauri environments to prevent runtime errors during development or non-Tauri builds.

Specifically, the `invoke` function was added to `src/lib/tauri.ts`:
```typescript
export const invoke = async <T>(cmd: string, args?: Record<string, unknown>): Promise<T> => {
  if (!isTauri()) {
    console.warn(`Tauri 'invoke' API not available. Command: ${cmd}`);
    return Promise.reject(new Error(`Tauri 'invoke' API not available. Command: ${cmd}`));
  }

  try {
    const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
    return tauriInvoke(cmd, args);
  } catch (error) {
    console.error(`Error dynamically importing Tauri 'invoke' for command ${cmd}:`, error);
    return Promise.reject(error);
  }
};
```

### Consequences
This change provides the `invoke` function that other modules in the application expect, resolving the `Runtime TypeError`. The application can now correctly execute Tauri commands when running in a Tauri environment, while gracefully handling scenarios outside of Tauri without breaking the application. This ensures full functionality for interacting with the Tauri backend.
