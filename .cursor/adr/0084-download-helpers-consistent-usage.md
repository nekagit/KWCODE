# ADR 0084: Consistent use of download-helpers across all download/export modules

## Status

Accepted. Implemented 2025-02-18 (night shift refactor).

## Context

ADR 0008 introduced `src/lib/download-helpers.ts` with `safeFilenameSegment`, `safeNameForFile`, `filenameTimestamp`, `downloadBlob`, and `triggerFileDownload`. Some download/export modules were refactored to use it; others still contained inline logic for building the filename timestamp (e.g. `now.toISOString().slice(0, 10)` + `toTimeString().slice(0, 5).replace(":", "")`) and for triggering the download (createObjectURL → anchor → click → revokeObjectURL). Inconsistent usage made the codebase harder to maintain and left duplicated logic in place.

## Decision

- **Use helpers everywhere**  
  All modules that export or download files (run history, prompts, ideas, design, architecture, tech stack, keyboard shortcuts, cursor prompts, project export, etc.) now:
  - Use `filenameTimestamp()` for any `YYYY-MM-DD-HHmm` filename suffix.
  - Use `downloadBlob(blob, filename)` or `triggerFileDownload(content, filename, mimeType)` for the browser download; no inline createObjectURL/anchor/revoke blocks.
  - Use `safeFilenameSegment` or `safeNameForFile` for any user-derived filename segment (already in place where applicable).

- **No new APIs**  
  This was a refactor only: same public function signatures, same filenames and toasts; only internal implementation was unified.

## Consequences

- Single place for timestamp format and download mechanics; future changes (e.g. timezone or filename format) are done in `download-helpers` only.
- All download/export code follows the same pattern, easing onboarding and code review.
- Behaviour and tests unchanged; refactor is behaviour-preserving.
