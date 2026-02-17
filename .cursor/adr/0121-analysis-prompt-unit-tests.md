# ADR 0121: analysis-prompt — unit tests

## Status

Accepted.

## Context

- `src/lib/analysis-prompt.ts` exports prompt builders used by the run/worker flow: analysis prompts (design, architecture), Kanban context block, ticket prompt block, and combiners (`combinePromptRecordWithKanban`, `combineTicketPromptWithUserPrompt`).
- The module had no unit tests; changes to wording or structure could regress Implement All / night shift behaviour or Kanban/ticket parsing expectations.

## Decision

- Add `src/lib/__tests__/analysis-prompt.test.ts` with Vitest tests for:
  - `ANALYSIS_PROMPT_FILENAME` and `ANALYSIS_PROMPT` content.
  - `buildDesignAnalysisPromptRecord`: project name, .cursor/design.md, linked design names (present vs empty).
  - `buildArchitectureAnalysisPromptRecord`: project name, .cursor/architecture.md, linked architecture names (present vs empty).
  - `buildKanbanContextBlock`: empty tickets (no-tickets message); tickets by priority P0–P3; done vs open; feature name in line; skipped priority sections.
  - `combinePromptRecordWithKanban`: empty user prompt returns kanban only; with content adds separator; trims user prompt.
  - `buildTicketPromptBlock`: number, title, priority, feature; empty feature → "—"; description section (present/omitted); agents line; agent instructions section (present/omitted).
  - `combineTicketPromptWithUserPrompt`: empty user prompt returns ticket block only; with content adds separator.
- No change to `analysis-prompt.ts`; tests only.

## Consequences

- Regressions in prompt builders are caught by Vitest.
- Aligns with night-shift preference for improving tests and extending coverage for lib code used by run/worker.

## References

- `src/lib/analysis-prompt.ts` — implementation
- `src/lib/__tests__/analysis-prompt.test.ts` — new tests
