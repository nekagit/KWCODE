/**
 * Test generation templates for the Testing page.
 * Used as AI prompts / templates for generating unit tests, e2e, integration, etc.
 */

export interface TestTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: "unit" | "integration" | "e2e" | "static" | "snapshot" | "other";
}

export const TEST_TEMPLATE_CATEGORIES: Record<TestTemplate["category"], string> = {
  unit: "Unit",
  integration: "Integration",
  e2e: "E2E",
  static: "Static analysis",
  snapshot: "Snapshot",
  other: "Other",
};

export const TEST_TEMPLATES: TestTemplate[] = [
  {
    id: "unit-react",
    name: "React component unit tests",
    description: "Generate unit tests for a React component using React Testing Library.",
    prompt:
      "Write unit tests for this React component using React Testing Library. Test: (1) rendering and key props, (2) user interactions (clicks, input), (3) accessibility (roles, labels). Use describe/it, avoid testing implementation details. Prefer getByRole and userEvent.",
    category: "unit",
  },
  {
    id: "unit-node",
    name: "Node/TS function unit tests",
    description: "Generate unit tests for a pure function or module (Vitest/Jest).",
    prompt:
      "Write unit tests for this function/module. Cover: (1) happy path, (2) edge cases and invalid inputs, (3) error paths. Use describe/it, clear test names. Mock external deps. Prefer Vitest or Jest.",
    category: "unit",
  },
  {
    id: "integration-api",
    name: "API route integration tests",
    description: "Generate integration tests for an API route or handler.",
    prompt:
      "Write integration tests for this API route/handler. Test: (1) success responses and status codes, (2) request validation (missing/invalid body, query), (3) auth/headers when applicable. Use the framework's test client (e.g. Next.js, Express).",
    category: "integration",
  },
  {
    id: "e2e-playwright",
    name: "E2E test (Playwright)",
    description: "Generate an end-to-end test scenario with Playwright.",
    prompt:
      "Write a Playwright E2E test for this user flow. Include: (1) page goto and wait for load, (2) locators using role/text/label, (3) assertions for visible state and navigation. One test per file or scenario; keep tests independent.",
    category: "e2e",
  },
  {
    id: "e2e-cypress",
    name: "E2E test (Cypress)",
    description: "Generate an end-to-end test scenario with Cypress.",
    prompt:
      "Write a Cypress E2E test for this user flow. Use cy.get with data-cy or role-based selectors, cy.intercept for API if needed. Assert on DOM and URL. One describe block per feature.",
    category: "e2e",
  },
  {
    id: "static-eslint",
    name: "ESLint test rules",
    description: "Add or extend ESLint rules and tests for custom rules.",
    prompt:
      "Suggest ESLint rule tests (ruleTester or flat rule tests) for this custom rule. Cover valid and invalid cases; test fixers if the rule is fixable.",
    category: "static",
  },
  {
    id: "snapshot-component",
    name: "Component snapshot test",
    description: "Generate a snapshot test for a React component (use sparingly).",
    prompt:
      "Write a snapshot test for this component. Use it only for stable, presentational output. Prefer toMatchSnapshot with a meaningful description. Prefer React Testing Library render.",
    category: "snapshot",
  },
  {
    id: "coverage-gaps",
    name: "Coverage gap analysis prompt",
    description: "Prompt to ask AI to suggest tests for uncovered code.",
    prompt:
      "Given this coverage report (or file list) and the codebase, suggest concrete test cases or files to add tests for, to improve line/branch coverage. Prioritize critical paths and public APIs.",
    category: "other",
  },
];
