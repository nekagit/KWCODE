# ADR 0009: CSV and duration helpers refactor

## Status

Accepted. Implemented 2025-02-18 (night shift refactor).

## Context

Multiple download CSV modules in `src/lib/` duplicated the same logic:

- **CSV escaping**: RFC 4180-style `escapeCsvField` (wrap in double-quotes when value contains comma, newline, or double-quote; double internal quotes) was defined identically in `download-all-prompts-csv.ts`, `download-all-run-history-csv.ts`, `download-run-as-csv.ts`, and `download-my-ideas-csv.ts`.
- **Duration formatting**: `formatDurationMs` (milliseconds to human-readable "45s" or "2:34") was duplicated in `download-all-run-history-csv.ts` and `download-run-as-csv.ts`.

This made it harder to change escaping or duration display in one place and increased the risk of drift.

## Decision

- **Shared CSV helper**  
  New module `src/lib/csv-helpers.ts` with:
  - `escapeCsvField(value: string): string` — single implementation for all CSV export modules.

- **Duration in run-helpers**  
  Extend `src/lib/run-helpers.ts` with:
  - `formatDurationMs(ms: number | undefined): string` — returns `""` for undefined/negative; otherwise same human-readable format as before (rounded seconds for &lt;60s, m:ss for 60s+). Keeps run-related formatting in one place and preserves existing behaviour (e.g. rounding for sub-60s).

- **Call sites**  
  The four CSV download libs import from `csv-helpers` and (where applicable) `run-helpers` instead of defining local `escapeCsvField` or `formatDurationMs`. Behaviour and CSV output are unchanged.

## Consequences

- One place to fix or extend CSV escaping (e.g. edge cases, encoding).
- Run duration display (including in CSV exports) is consistent and maintained in `run-helpers`.
- New CSV export features can reuse `escapeCsvField` without copying code.
- Existing tests and UI behaviour remain the same; refactor is behaviour-preserving.
