## 0022-fix-duplicate-istauri-declaration

### Status
Accepted

### Context
A build error (`Module parse failed: Identifier 'isTauri' has already been declared`) occurred due to a duplicate declaration of the `isTauri` function in `src/lib/tauri.ts`. This was likely caused by an unintentional repeated insertion during a previous modification.

### Decision
To resolve the `Identifier 'isTauri' has already been declared` build error, the redundant declaration of the `isTauri` function in `src/lib/tauri.ts` was removed.

Specifically, the second instance of the following line was removed from `src/lib/tauri.ts`:
```typescript
export const isTauri = (): boolean => typeof window !== "undefined" && !!window.__TAURI__;
```

### Consequences
This change eliminates the duplicate declaration, allowing the module to parse correctly and resolving the build error. The `isTauri` function remains properly defined and exported, ensuring that other modules can continue to use it as intended to check for the Tauri environment.
