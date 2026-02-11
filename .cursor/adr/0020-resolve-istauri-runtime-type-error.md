## 0020-resolve-istauri-runtime-type-error

### Status
Accepted

### Context
A `Runtime TypeError` occurred: `(0,_lib_tauri__WEBPACK_IMPORTED_MODULE_1__.isTauri) is not a function`. This error indicated that the `isTauri` function was being imported and called from `src/lib/tauri.ts` in various parts of the application, but it was not actually exported by that module. The previous changes to `src/lib/tauri.ts` only focused on the `showOpenDirectoryDialog` function and did not include a separate `isTauri` export.

### Decision
To resolve the `Runtime TypeError`, a new function named `isTauri` was added and exported from `src/lib/tauri.ts`. This function checks for the presence of `window.__TAURI__` to determine if the application is running within a Tauri environment.

Specifically, the following line was added to `src/lib/tauri.ts`:
```typescript
export const isTauri = (): boolean => typeof window !== "undefined" && !!window.__TAURI__;
```

### Consequences
This change provides the `isTauri` function that other modules in the application expect, resolving the `Runtime TypeError`. The application can now correctly determine if it is running in a Tauri environment, allowing for appropriate conditional logic and preventing further runtime errors related to this missing export.
