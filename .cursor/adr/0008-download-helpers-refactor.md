# ADR 0008: Shared download helpers refactor

## Status

Accepted. Implemented 2025-02-18 (night shift refactor).

## Context

Multiple `download-*` and `export-*` modules in `src/lib/` duplicated the same logic:

- Sanitizing a string for use in filenames (replace unsafe chars, limit length, fallback when empty).
- Building a timestamp segment for filenames (YYYY-MM-DD-HHmm).
- Triggering a browser download (create Blob, object URL, temporary anchor click, revoke).

This made it harder to change behaviour or fix bugs in one place and increased the risk of drift.

## Decision

- **Shared module**  
  All download-related helpers live in `src/lib/download-helpers.ts`:
  - `safeFilenameSegment(text, maxLengthOrFallback?, fallback?)` — sanitize a string for a filename segment; two-arg form `(text, fallback)` or three-arg `(text, maxLength, fallback)`.
  - `safeNameForFile(name, fallback?)` — alias for callers that prefer “name” in their domain.
  - `filenameTimestamp()` — returns `YYYY-MM-DD-HHmm` for consistent filenames.
  - `downloadBlob(blob, filename)` — trigger download for a Blob (no toast; callers handle feedback).
  - `triggerFileDownload(content, filename, mimeType)` — build Blob from string and call `downloadBlob`.

- **Call sites**  
  Download and export libs import from `download-helpers` instead of defining local `safeNameForFile` / `safeTitleForFile` / `safeLabelForFile` or inline blob/link/click/revoke blocks. Behaviour (including toasts and filename shapes) is unchanged.

## Consequences

- One place to fix or extend download behaviour (e.g. sanitization rules, timestamp format).
- New download features can reuse helpers without copying code.
- Existing tests and UI behaviour remain the same; refactor is behaviour-preserving.
