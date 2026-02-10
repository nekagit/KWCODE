# ADR 113: API authentication when deployed beyond localhost

## Status
Accepted

## Context
- Ticket #4: Document or add API authentication for /api/* when deployed beyond localhost.
- The app uses Next.js API routes in dev; Tauri production uses static export (no API). When the dev server is run with -H 0.0.0.0 or deployed for team access, routes are exposed without auth.

## Decision

1. **Middleware-based API auth**
   - Created `src/middleware.ts` that runs on `/api/:path*`.
   - When `API_SECRET` env var is set, require `Authorization: Bearer <API_SECRET>` or `X-API-Key: <API_SECRET>`.
   - When `API_SECRET` is not set, allow all requests (local dev).

2. **Documentation**
   - When deploying the Next dev server for network/team access: set `API_SECRET` in `.env.local` and have clients pass it via header. For browser clients, use a server-side proxy or avoid exposing the secret (e.g. run behind a reverse proxy that adds the header).

## Consequences
- Local dev: no change (API_SECRET not set).
- Deployed with API_SECRET: unauthenticated requests get 401.
- Tauri production build (output: export): no API routes, middleware N/A.