# ADR 096: Next.js vendor-chunks/@floating-ui.js missing – fix and type safety

## Status
Accepted

## Context
Runtime error when loading the app (e.g. project details page):

```
Error: Cannot find module './vendor-chunks/@floating-ui.js'
Require stack: .next/server/webpack-runtime.js → .next/server/app/projects/[id]/page.js → ...
```

- The app uses Radix UI (Tooltip, Popover, etc.), which depend on `@floating-ui`.
- Next.js 15 emits server-side vendor chunks under `.next/server/vendor-chunks/`.
- The page bundle listed `vendor-chunks/@floating-ui` as a dependency, but that file was missing from a previous (stale or partial) build.

## Decision
1. **Fix the missing chunk**: Treat as a stale/corrupted build cache. Remove `.next` and rebuild so webpack regenerates all server vendor chunks, including `@floating-ui`.
2. **Harden analysis prompt types**: In `src/lib/analysis-prompt.ts`, avoid using `opts.ticketsMdContent` in a template literal when TypeScript cannot narrow it; use `(opts.ticketsMdContent ?? "").trim()` so the build type-check passes.

## Consequences
- Deleting `.next` and running `npm run dev` or `npm run build` resolves the floating-ui error.
- One type error in `analysis-prompt.ts` was fixed so builds can proceed past type-check.
- If the project uses `output: "export"`, API routes require `export const dynamic = "force-dynamic"` (or similar) where applicable; that remains a separate configuration concern.
