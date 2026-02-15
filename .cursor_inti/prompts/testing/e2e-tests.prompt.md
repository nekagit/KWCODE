# Prompt: E2E tests

Use when adding or expanding end-to-end tests (browser/Playwright).

## Context

- E2E stack: see `.cursor/setup/testing.md` (e.g. Playwright).
- Target: (user flow to test, e.g. login, create item).

## Instructions

1. Write one or more E2E tests for the critical user flow.
2. Use page objects or helpers if the project has them; avoid brittle selectors.
3. Ensure tests run in CI (headless); document how to run locally.
4. Add to `docs/guides/testing.md` or setup if needed.

## Output

- New or updated E2E tests.
