# Test best practices

Reference for the Testing page and for AI-assisted test generation.

## General

- **One logical assertion per test** when possible; name tests by behavior, not implementation.
- **Arrange–Act–Assert** (AAA): set up, perform action, assert outcome.
- **Independent tests**: no shared mutable state; tests can run in any order.
- **Fast feedback**: unit tests should be fast; slow tests in integration/e2e.
- **Avoid testing implementation details**: test behavior and contracts, not internals.

## Unit tests

- Prefer **public API** and **user-facing behavior** over internal functions.
- Use **test doubles** (mocks, stubs, fakes) for external deps; don’t hit real DB/network in unit tests.
- **Edge cases**: empty input, null/undefined, boundaries, errors.
- **Naming**: `it('does X when Y')` or `describe('ComponentName')` with clear `it()` descriptions.

## Integration tests

- Test **real integrations** (DB, API, queue) in a controlled environment (test DB, mocks at boundary).
- **Setup/teardown**: clean state before and after; use transactions or test containers when possible.
- **Flakiness**: avoid timing-dependent assertions; use explicit waits or polling where needed.

## E2E tests

- **Few, stable flows**: critical user journeys only; keep suite small and maintainable.
- **Stable selectors**: prefer `data-testid`, roles, and visible text; avoid brittle CSS.
- **Isolation**: each test should be runnable alone; avoid depending on other tests’ state.
- **Environment**: dedicated test env and data; no production.

## Static analysis & tooling

- **Linting**: ESLint (and TypeScript) in CI; fix before merge.
- **Coverage**: use line/branch coverage as a signal, not a target; focus on important paths.
- **Mutation testing**: optional; helps check that tests actually catch defects.

## AI-generated tests

- **Review generated tests**: ensure they assert meaningful behavior and match project style.
- **Templates**: use project-specific templates (framework, naming, patterns) for consistency.
- **Iterate**: treat first generation as a draft; refine names, cases, and structure.

## Phases (automation)

1. **Static**: lint, typecheck, format (e.g. pre-commit or CI first step).
2. **Unit**: run unit tests; fail fast.
3. **Integration**: run integration tests (often in CI only).
4. **E2E**: run E2E on deploy or nightly; optional per-PR.
5. **Coverage**: collect and report; optionally enforce minimums on critical modules.
