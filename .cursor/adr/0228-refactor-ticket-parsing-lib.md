# ADR 0228: Refactor — Extract ticket parsing into lib

## Status

Accepted.

## Context

ProjectTicketsTab contained two pure functions for parsing ticket-shaped JSON from agent stdout: `normalizeTicketParsed` (normalize agent output, including snake_case `feature_name`) and `extractTicketJsonFromStdout` (handle markdown code blocks and extract first JSON object). This logic had no UI or store dependencies and was a good candidate for extraction to improve separation of concerns and testability.

## Decision

- Introduce `src/lib/ticket-parsing.ts` with:
  - `normalizeTicketParsed(parsed)` — normalizes a raw object to `ParsedTicketFromStdout` (title, description, priority, featureName).
  - `extractTicketJsonFromStdout(stdout)` — extracts and normalizes ticket JSON from agent stdout (code blocks, leading text).
  - Exported type `ParsedTicketFromStdout`.
- Add `src/lib/__tests__/ticket-parsing.test.ts` to lock behaviour (empty input, code block, snake_case, invalid JSON, array root).
- ProjectTicketsTab imports `extractTicketJsonFromStdout` from `@/lib/ticket-parsing` and no longer defines the parsing logic locally.

## Consequences

- Ticket parsing is reusable and unit-tested; behaviour unchanged.
- ProjectTicketsTab is shorter and focused on UI; future components that need to parse ticket JSON from stdout can use the same lib.
