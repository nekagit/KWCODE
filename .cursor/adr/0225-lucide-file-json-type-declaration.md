# ADR 0225: Type declaration for lucide-react file-json subpath

## Status
Accepted

## Context
`CommandPalette.tsx` imports `FileJson` from `lucide-react/dist/esm/icons/file-json` (ADR 0218) to avoid a runtime ReferenceError with the barrel export. The Next.js production build runs TypeScript and failed with:

- "Could not find a declaration file for module 'lucide-react/dist/esm/icons/file-json'"

The subpath is not covered by `lucide-react`'s published types.

## Decision
- Add `src/types/lucide-react-file-json.d.ts` declaring the module with a default export typed as `LucideIcon` from `lucide-react`.
- Keep the subpath import in `CommandPalette.tsx`; do not revert to the barrel import.

## Consequences
- Production build (e.g. `npm run build:desktop`) succeeds.
- No runtime change; ADR 0218 fix remains in place.
- One extra declaration file in `src/types/`.
