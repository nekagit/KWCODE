# ADR 0058: Internal Server Error – API resilience and diagnostics

## Status
Accepted

## Context
Users sometimes see a generic "Internal Server Error" when using the app. This can come from (1) API routes throwing before returning a response, (2) file/DB paths resolved incorrectly when the server runs with a different `process.cwd()`, or (3) the client displaying `response.statusText` for 500 responses. Without a clear error message or logs, debugging is difficult.

## Decision
- **`/api/data` route**: Resolve all file paths with `process.cwd()` via a `resolveCursorPath(relativePath)` helper so reads from `.cursor/`, `.cursor/7. planner/tickets.md`, etc. are explicit and work regardless of how the Next server is started. Use `path.join(process.cwd(), relativePath)` for every file read.
- **`/api/data` on error**: When the GET handler catches an error, return `NextResponse.json(..., { status: 500 })` with the same payload (empty arrays + `error: message`) so the client receives a proper 500 with a JSON body containing the error message for debugging.
- **`getDb()` (lib/db)**: Wrap `mkdirSync` and `new Database(dbPath)` in try/catch and rethrow with a clear message including the path (e.g. "Database: cannot open /path/to/data/app.db: ...") so API routes that catch and return 500 can forward a useful message.
- **Error boundary (error.tsx)**: When `error.message === "Internal Server Error"` or the error has a Next.js digest, show an extra hint: "Check the terminal where npm run dev is running for the actual error."

## Consequences
- API data route is robust against cwd differences and returns a consistent JSON error body on failure.
- Database init failures produce actionable error messages in logs and in API responses.
- Users who see the generic "Internal Server Error" in the UI get guidance to check the dev server terminal for the real cause.
