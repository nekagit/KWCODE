# ADR 077: Clear API error messages instead of "Internal Server Error"

## Status

Accepted.

## Context

When API routes returned HTTP 500, the client sometimes showed the generic "Internal Server Error" (HTTP status text) or raw JSON bodies like `{"error":"Failed to load data"}`. This made debugging and user feedback unclear.

## Decision

- **`src/lib/utils.ts`**: Add `getApiErrorMessage(res: Response)` that parses the response body and returns a user-facing string: prefer `error` or `detail` from JSON, else trimmed body, else for 500 use "Server error loading data", else `statusText` or "Request failed". This avoids showing raw JSON or the generic "Internal Server Error".
- **Run store**: When `/api/data` is not ok, use `getApiErrorMessage(res)` for the thrown `Error` message so the run UI shows a clear message.
- **Run page**: When loading features via `/api/data` fails (browser mode), call `setError(await getApiErrorMessage(res.clone()))` so the alert shows the API error instead of failing silently.
- **`/api/data` route**: Validate that `DATA_DIR` exists and is a directory before reading; return JSON `{ error: "..." }` with a clear message (e.g. "Data directory not found: ..."). Keep a single catch that always returns `NextResponse.json({ error: message }, { status: 500 })` and log the exception for debugging.

## Consequences

- Users see actionable messages (e.g. "Data directory not found", "Server error loading data") instead of "Internal Server Error" or raw JSON.
- Run page no longer silently ignores `/api/data` failures in browser mode.
- Other pages that use `res.text()` or `res.statusText` on API errors could be updated to use `getApiErrorMessage` for consistency in a follow-up.
