# ADR 0005: Remove unused API routes

## Status

Accepted

## Context

A review of `src/app/api` showed several route handlers that are never called from the application: no `fetch()` or equivalent usage in components, lib, or pages. Keeping unused routes increases maintenance surface and can cause confusion about which endpoints are part of the contract.

## Decision

Remove the following API route files (and their route handlers):

| Route | Reason |
|-------|--------|
| `check-openai/route.ts` | Documented in .cursor setup only; no UI calls it |
| `generate-prompt-from-kanban/route.ts` | Documented but no component calls it |
| `generate-design/route.ts` | Documented but no component calls it |
| `data/february-repos-overview/route.ts` | Comment in code says "load from" this API but no code fetches it |
| `data/architectures/route.ts` | CRUD never called; architectures read via project resolve only |
| `data/architectures/[id]/route.ts` | Same |
| `data/designs/route.ts` | CRUD never called; designs read via project resolve only |
| `data/designs/[id]/route.ts` | Same |

Designs and architectures continue to be read via `/api/data/projects/[id]` (resolve) and written by `generate-architectures`, `generate-project-from-idea`, and `seed-template` using the same JSON files.

## Consequences

- **Cleaner API surface:** Only routes that are actually used remain.
- **Docs may be stale:** `.cursor/setup` and agent docs that reference the removed endpoints (e.g. check-openai, generate-prompt-from-kanban, generate-design) should be updated separately if those features are reintroduced.
- **Reintroduction:** If needed later, routes can be re-added from git history or from `.cursor_inti` / docs.

## References

- Audit of `src/app/api` and grep for `/api/` usage in `src/`
- Removed: 8 route files under `src/app/api/`
