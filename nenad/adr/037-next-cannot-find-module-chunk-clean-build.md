# ADR 037: Next.js "Cannot find module './1989.js'" – clean build fix

## Status

Accepted.

## Context

When running the Next.js dev server or loading app pages (e.g. `/ideas`), the server can throw:

```text
Error: Cannot find module './1989.js'
Require stack:
- .next/server/webpack-runtime.js
- .next/server/app/page.js
...
```

The numeric file (e.g. `1989.js`) is a webpack chunk. Chunks are emitted under `.next/server/chunks/` (e.g. `.next/server/chunks/1989.js`), but the server-side webpack runtime resolves `require("./" + chunkId + ".js")` relative to `.next/server/`, so it looks for `.next/server/1989.js` and fails. This usually happens when the `.next` build cache is stale or inconsistent (e.g. after config or dependency changes, or an interrupted build).

## Decision

1. **Primary fix**: Delete the `.next` directory and restart the dev server so Next.js does a full rebuild. This restores a consistent layout and resolves the missing chunk error.
2. **If port is in use**: Stop the process using the dev port (e.g. 4000) before starting `npm run dev` again.
3. **Type fix**: In `src/app/projects/[id]/page.tsx`, ensure `setDesignIds` and `setArchitectureIds` always receive `string[]` by using `?? []` when passing optional `ResolvedProject` fields, so the build type-check passes.

## Consequences

- Developers should run `rm -rf .next` (or equivalent) and restart the dev server when they see "Cannot find module './NNNN.js'" from the webpack runtime.
- Project build succeeds after the type fix for `designIds` / `architectureIds` in the project detail page.
