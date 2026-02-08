/**
 * Test best practices and phases for the Testing page.
 * Full narrative is in .cursor/test-best-practices.md.
 */

export const TEST_BEST_PRACTICES_LIST: string[] = [
  "One logical assertion per test when possible; name tests by behavior, not implementation.",
  "Arrange–Act–Assert (AAA): set up, perform action, assert outcome.",
  "Independent tests: no shared mutable state; tests can run in any order.",
  "Fast feedback: unit tests should be fast; slow tests in integration/e2e.",
  "Avoid testing implementation details: test behavior and contracts.",
  "Prefer public API and user-facing behavior over internal functions.",
  "Use test doubles (mocks, stubs) for external deps in unit tests.",
  "Cover edge cases: empty input, null/undefined, boundaries, errors.",
  "Clear naming: e.g. it('does X when Y') or describe('ComponentName').",
  "E2E: few stable flows; prefer data-testid, roles, visible text for selectors.",
  "Static: ESLint and TypeScript in CI; use coverage as a signal, not only a target.",
  "Review AI-generated tests for meaningful assertions and project style.",
];

export interface TestPhase {
  id: string;
  phase: "static" | "unit" | "integration" | "e2e";
  name: string;
  description: string;
  icon: "static" | "unit" | "integration" | "e2e";
}

export const TEST_PHASES: TestPhase[] = [
  {
    id: "static",
    phase: "static",
    name: "Static analysis",
    description:
      "Lint, typecheck, format (ESLint, TypeScript, Prettier). Run first in CI; fast feedback.",
    icon: "static",
  },
  {
    id: "unit",
    phase: "unit",
    name: "Unit tests",
    description:
      "Run unit tests; no I/O. Fail fast. High coverage on core logic.",
    icon: "unit",
  },
  {
    id: "integration",
    phase: "integration",
    name: "Integration tests",
    description:
      "Tests that hit DB, API, or other services in a controlled test env. Often in CI only.",
    icon: "integration",
  },
  {
    id: "e2e",
    phase: "e2e",
    name: "E2E tests",
    description:
      "Full user flows (Playwright, Cypress). Run on deploy or nightly; optional per-PR.",
    icon: "e2e",
  },
];
