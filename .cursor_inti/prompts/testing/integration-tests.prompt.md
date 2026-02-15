# Prompt: Integration tests

Use when adding or expanding integration tests (API + DB or multi-module).

## Context

- Test stack: see `.cursor/setup/testing.md` (e.g. Vitest + Supertest, test DB).
- Target: (API route or flow to test).

## Instructions

1. Use test database or mocks for DB; avoid touching production.
2. Test full request/response and status codes; assert on response shape.
3. Clean up state after tests (transactions or truncate).
4. Run suite and ensure no regressions.

## Output

- New or updated integration tests.
