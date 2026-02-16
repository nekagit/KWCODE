# Prompt: Initialize testing

Use when setting up the testing stack (unit, integration, E2E) for this project.

## Context

- Testing choices: see `.cursor/project/TECH-STACK.md` and `.cursor/setup/testing.md` if present.
- Prefer Vitest for unit; Playwright for E2E unless project already uses Jest/Cypress.

## Instructions

1. Add test runner and config (Vitest/Jest, Playwright).
2. Add at least one smoke test for frontend and one for backend.
3. Document strategy in `.cursor/setup/testing.md`: what to test, where tests live, how to run.
4. Ensure `npm run test` (or equivalent) runs.

## Output

- Test config and example tests.
- Updated `.cursor/setup/testing.md`.
