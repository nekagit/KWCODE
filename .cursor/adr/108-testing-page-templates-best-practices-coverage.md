# ADR 108: Testing page – templates, best practices, phases, coverage dashboard

## Status

Accepted.

## Context

Users need a dedicated place for test-related workflows: AI-assisted test generation, test best practices, a clear view of testing phases (static, automation), and a test coverage dashboard. This supports consistent quality and automation across projects.

## Decision

- **Testing page** at `/testing` with four tabs:
  1. **Templates**: Pre-defined prompts for AI test generation (unit, integration, e2e, static, snapshot). Each template is copyable; an “AI test generation” input uses the existing prompt API to produce a short test plan from a free-text description.
  2. **Best practices**: Curated list of test best practices (AAA, independence, naming, E2E selectors, etc.) plus a “My test practices” text area persisted in `localStorage` for project-specific rules.
  3. **Phases**: Ordered steps—Static analysis, Unit tests, Integration tests, E2E tests—with short descriptions to guide automation and CI ordering.
  4. **Coverage**: Dashboard placeholder showing Lines, Branches, Functions, Statements with progress bars and targets (e.g. 80%). Real data to be wired later from coverage tool output (e.g. `coverage/coverage-summary.json` or an API).
- **Data and docs**:
  - `src/data/test-templates.ts`: `TEST_TEMPLATES`, `TEST_TEMPLATE_CATEGORIES` (unit, integration, e2e, static, snapshot, other).
  - `src/data/test-best-practices.ts`: `TEST_BEST_PRACTICES_LIST`, `TEST_PHASES` (static, unit, integration, e2e).
  - `.cursor/test-best-practices.md`: Narrative reference for test best practices (and AI context).
- **Navigation**: “Testing” in main sidebar (icon: TestTube2), after Architecture.

## Consequences

- Single place for test templates, best practices, phases, and coverage.
- AI test generation reuses existing `/api/generate-prompt`; no new generate API required for initial release.
- Coverage dashboard is placeholder until a coverage source (file or API) is integrated.
- My test practices are client-only (localStorage); no backend storage for this feature initially.
