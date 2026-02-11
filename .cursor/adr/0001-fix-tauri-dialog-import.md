# 0001-fix-tauri-dialog-import

## Status
Accepted

## Context
The application was failing to build in Tauri due to a `Module not found` error for `@tauri-apps/api/dialog`. The existing import statement `import("@tauri-apps/api/dialog").then(module => tauriOpen = module.open);` was incorrect.

## Decision
The import statement in `src/lib/tauri.ts` has been updated to `import { open } from "@tauri-apps/api/dialog"; tauriOpen = open;`.

## Consequences
This change correctly imports the `open` function from the `@tauri-apps/api/dialog` module, resolving the build error and allowing the Tauri application to function as expected.