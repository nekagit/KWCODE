# ADR 0119: api-validation unit tests

## Context

Night shift picked "improving tests" as the next valuable task. There were no TODO/FIXME in `src/`, and `run-helpers` / `utils` already had strong coverage. The API validation layer (`src/lib/api-validation.ts`) had no unit tests: it defines Zod schemas and `parseAndValidate` used by API routes.

## Decision

- Added `src/lib/__tests__/api-validation.test.ts` with:
  - **generatePromptRecordSchema**: valid body, optional promptOnly, reject empty/missing description.
  - **generateIdeasSchema**: valid topic with defaults, custom count, reject empty topic and count out of range.
  - **createProjectSchema**: minimal (name only), full optional fields, reject empty name and runPort out of range.
  - **parseAndValidate**: success when body is valid JSON and passes schema; failure with 400 for invalid JSON; failure with 400 when JSON is valid but fails schema (error message contains field path).

## Consequences

- API validation behavior is documented and regression-protected for key schemas and for `parseAndValidate`.
- One concrete task per night shift; no scope creep (other schemas can be covered in later runs).
- Before considering done, run from repo root: `npm run verify` (test, build, lint).
