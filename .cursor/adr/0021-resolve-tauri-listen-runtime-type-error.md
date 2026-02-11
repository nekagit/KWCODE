## 0021-resolve-tauri-listen-runtime-type-error

### Status
Accepted

### Context
A `Runtime TypeError` occurred: `(0,_lib_tauri__WEBPACK_IMPORTED_MODULE_1__.listen) is not a function`. This error indicated that the `listen` function was being imported and called from `src/lib/tauri.ts` (specifically in `src/store/run-store-hydration.tsx`) but was not exported by that module. The previous changes to `src/lib/tauri.ts` addressed the `isTauri` function but did not include `listen`.

### Decision
To resolve the `Runtime TypeError`, a new function named `listen` was added and exported from `src/lib/tauri.ts`. This function dynamically imports the `listen` function from `@tauri-apps/api/event` when the application is running in a Tauri environment. A warning and a no-op function are provided as a fallback for non-Tauri environments to prevent runtime errors during development or non-Tauri builds.

Specifically, the `listen` function was added to `src/lib/tauri.ts`:
```typescript
export const listen = async <T>(event: string, handler: (event: { payload: T }) => void): Promise<() => void> => {
  if (!isTauri()) {
    console.warn(`Tauri 'listen' API not available. Event: ${event}`);
    return Promise.resolve(() => {});
  }

  try {
    const { listen: tauriListen } = await import("@tauri-apps/api/event");
    return tauriListen(event, handler);
  } catch (error) {
    console.error(`Error dynamically importing Tauri 'listen' for event ${event}:`, error);
    return Promise.resolve(() => {});
  }
};
```

### Consequences
This change provides the `listen` function that `src/store/run-store-hydration.tsx` and other modules expect, resolving the `Runtime TypeError`. The application can now correctly subscribe to Tauri events when running in a Tauri environment, while gracefully handling scenarios outside of Tauri without breaking the application.
