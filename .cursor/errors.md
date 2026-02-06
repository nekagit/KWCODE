# Errors and recommendations

## Error

| # | Message | Location | Recommendation |
|---|--------|----------|----------------|
| 1 | No test suite; refactors and regressions are untested. | Project root | Add Jest or Vitest + React Testing Library; add Playwright for E2E; start with `src/lib/` and `src/store/run-store.ts`. |
| 2 | Generate and data API routes have no authentication; unsafe if deployed. | `src/app/api/` | Add auth (e.g. API key or session) for any deployment beyond localhost; document “local only” in README if not deploying. |

## Warning

| # | Message | Location | Recommendation |
|---|--------|----------|----------------|
| 1 | Home page is a very large single component (~1100 lines); hard to maintain and test. | `src/app/page.tsx` | Split into smaller components or hooks (e.g. TicketBoard, FeatureList, DataTab, AllDataTab); keep page as composition. |
| 2 | Duplicate Tauri/browser data paths (JSON vs SQLite) and fallbacks; easy to diverge behavior. | `src/store/run-store.ts`, `src/app/page.tsx`, `/api/data/route.ts` | Document the two modes clearly; consider a small “data adapter” layer so UI talks to one interface. |
| 3 | No request validation on API routes; invalid body can cause unhandled errors. | e.g. `src/app/api/generate-tickets/route.ts`, other generate routes | Validate body with Zod (or similar) and return 400 with message on failure. |
| 4 | OPENAI_API_KEY required for AI features; no in-app warning when missing. | Generate routes | Check key at start of generate handlers; return 503 or 400 with “OPENAI_API_KEY not set” and surface in UI (e.g. toast or banner). |

## Info

| # | Message | Location | Recommendation |
|---|--------|----------|----------------|
| 1 | `dangerouslySetInnerHTML` used for critical CSS in layout; ensure content is static. | `src/app/layout.tsx` | Keep template static (no user input); if content becomes dynamic, switch to a safe approach. |
| 2 | Some state (e.g. tickets, features on home) is duplicated between page state and run store. | `src/app/page.tsx` | Prefer single source (e.g. load tickets/features once and pass down or keep in store) to avoid sync bugs. |
| 3 | Tailwind content paths include `src/pages` but app uses App Router only; redundant. | `tailwind.config.ts` | Remove `./src/pages/**/*` from `content` if no pages under `src/pages`. |
