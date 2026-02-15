# Testing strategy

Reusable best practices for coverage, test layout, mocking, and E2E.

## Coverage requirements

- Critical paths (auth, core CRUD, payments if any): aim for high coverage (e.g. 80%+).
- Utilities and pure functions: high coverage.
- UI components: focus on behavior; use Testing Library.

## Test organization

- **Unit:** Next to module (`*.test.ts`) or in `__tests__/`; mock external deps.
- **Integration:** `*.integration.test.ts` or under `tests/integration/`; use test DB or mocks.
- **E2E:** Under `e2e/` or `tests/e2e/`; one file per flow or feature.

## Mocking strategies

- **API:** MSW (Mock Service Worker) or fetch mock in tests.
- **DB:** Test database, transactions, or in-memory SQLite for speed.
- **Time:** Use fake timers where timing matters.

## E2E scenarios

- Cover: login, main CRUD flow, critical navigation, error states.
- Use data-testid or role-based selectors; avoid brittle CSS.
- Run in CI (headless); document local run in `.cursor/setup/testing.md`.
