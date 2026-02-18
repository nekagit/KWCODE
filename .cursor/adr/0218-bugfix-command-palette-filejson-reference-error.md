# ADR 0218: Bugfix — Command palette FileJson ReferenceError

## Status
Accepted (bugfix).

## Context
In Next.js 16 (Webpack), the app threw a console `ReferenceError: Can't find variable: FileJson`. The `CommandPalette` component imports `FileJson` from `lucide-react` and uses it in the `actionEntries` useMemo for several JSON-related actions (e.g. "Download app info as JSON", "Copy keyboard shortcuts as JSON"). The icon is exported by `lucide-react` and all imports were correct.

## Root cause
With Next.js/Webpack code-splitting and `lucide-react`'s barrel export (`lucide-react` main entry re-exports many icons from `./icons/file-json.js`). In some chunk/load orders, the `FileJson` binding was not in scope when the code that references it ran (e.g. when building or executing the `actionEntries` array), leading to "Can't find variable: FileJson" at runtime.

## Decision
- In `CommandPalette.tsx`, stop importing `FileJson` from the main `lucide-react` barrel.
- Import `FileJson` via the icon subpath so it is in the same module graph and not subject to the same chunking/tree-shaking behavior:
  - `import { default as FileJson } from "lucide-react/dist/esm/icons/file-json";`
- All other components that use `FileJson` continue to import from `"lucide-react"`; the fix was applied only where the error was observed (command palette).

## Consequences
- Command palette JSON actions render the FileJson icon correctly and no longer throw.
- One component uses a lucide-react internal path; if the package changes its `dist` layout, this import may need updating.
- No change to other components or to public API.
