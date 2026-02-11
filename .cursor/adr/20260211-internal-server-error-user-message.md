# ADR 20260211: Normalize "Internal Server Error" in API error display

## Status

Accepted.

## Context

When an API route returns 500 (e.g. uncaught exception, or explicit `NextResponse.json(..., { status: 500 })`), Next.js or the runtime can return a body with the generic message "Internal Server Error". The frontend uses `getApiErrorMessage(res)` to derive a user-visible string from the response. If that string is "Internal Server Error", the UI shows it verbatim, which is technical and unhelpful for users.

## Decision

- In `src/lib/utils.ts`, `getApiErrorMessage`:
  - When the parsed JSON `error` or `detail` is exactly `"Internal Server Error"`, return the same friendly message used for other 500s: **"Server error loading data"**.
  - When the response body is non-JSON and the trimmed text is exactly `"Internal Server Error"`, return **"Server error loading data"**.
- Keep returning specific error messages from API routes when they provide a custom `error` or `detail` (e.g. "Failed to list project folders"); only the generic phrase is normalized.

## Consequences

- Users never see the raw "Internal Server Error" string in the app.
- One consistent, user-friendly message for generic 500s without losing specific API error messages when present.
