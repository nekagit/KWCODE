## 0026-simplify-tauri-api-integration-for-always-tauri-app

### Status
Accepted

### Context
Despite previous attempts to resolve build and runtime errors related to Tauri API imports (including dynamic imports and `isTauri` checks), issues persisted, such as `TAURIINVOKE IS NOT A FUNCTION`. This indicated that the conditional loading strategy was still problematic in the context of an application that is *always* expected to run within a Tauri window. The complexity introduced by dynamic imports and environment checks was counterproductive for a purely Tauri application.

### Decision
To simplify and stabilize the Tauri API integration, all `isTauri` checks and dynamic import logic were removed from `src/lib/tauri.ts`. Instead, the Tauri API functions (`invoke`, `listen`, `open`) are now directly imported and re-exported.

Specifically, `src/lib/tauri.ts` was refactored to:

1.  Directly import `invoke` from `@tauri-apps/api/core`, `listen` from `@tauri-apps/api/event`, and `open` from `@tauri-apps/api/dialog`.
2.  Re-export these imported functions directly as `invoke`, `listen`, and `showOpenDirectoryDialog` (for the dialog functionality).

```typescript
import { invoke as tauriInvoke } from "@tauri-apps/api/core";
import { listen as tauriListen } from "@tauri-apps/api/event";
import { open as tauriOpen } from "@tauri-apps/api/dialog";

export const invoke = tauriInvoke;
export const listen = tauriListen;

export const showOpenDirectoryDialog = async (): Promise<string | undefined> => {
  // ... direct usage of tauriOpen ...
};
```

### Consequences
This simplification ensures that the Tauri API functions are always directly available when the application runs, eliminating the build and runtime errors caused by conditional loading and dynamic imports. The code is now cleaner and more robust for an application that exclusively targets the Tauri environment. This directly addresses the `TAURIINVOKE IS NOT A FUNCTION` error by making `invoke` directly available.
