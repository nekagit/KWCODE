# Testing Strategy & Standards — KWCode

**Version**: 1.0  
**Last Updated**: 2026-02-13  
**Author**: Principal QA Architect (AI)

---

## Testing Landscape

### Application Architecture

| Aspect | Technology |
|--------|------------|
| **App type** | Web + desktop hybrid (Next.js in browser; Tauri shell for desktop) |
| **Frontend** | React 18, Next.js 16 (App Router), Client Components |
| **Backend** | Next.js API routes (REST), file-based persistence (`data/projects.json`), no database |
| **State** | Zustand (`run-store`), React Context (UI theme, Quick Actions) |
| **Data layer** | File system (read/write in API routes), OpenAI (generate-prompt, generate-ideas, generate-design, generate-architectures, generate-ticket-from-prompt, generate-project-from-idea, generate-prompt-from-kanban) |
| **Validation** | Zod schemas in `src/lib/api-validation.ts`; `parseAndValidate()` for request bodies |
| **Native** | Tauri (`invoke`, `listen`, dialog) via `src/lib/tauri.ts`; no-op in browser |

### Current Testing Infrastructure

| Layer | Tool | Status |
|-------|------|--------|
| **Unit** | — | **Missing.** No Vitest/Jest; no unit tests. |
| **Component** | — | **Missing.** No React Testing Library. |
| **Integration** | — | **Missing.** No API route or data-flow tests. |
| **E2E** | Playwright | **Configured** (`playwright.config.ts`, `testDir: "./e2e"`, baseURL `http://127.0.0.1:4000`). **No specs yet** — `e2e/` has no test files. |
| **Visual / A11y / Perf** | — | Not configured. |

**Coverage**: Effectively **0%** (no unit/component/integration tests; E2E folder empty). **Maturity: immature.** Tests are not blocking CI.

### Critical User Flows (Must Work)

1. **Projects CRUD** — List, create, read, update, delete projects (API: `GET/POST /api/data/projects`, `GET/PATCH/DELETE /api/data/projects/[id]`).
2. **Run store & Tauri** — Load projects/prompts, run script, Implement All, setup prompts, floating terminal (depends on Tauri `invoke` in desktop; no-op in browser).
3. **AI generation** — Generate prompt, ideas, design, architectures, tickets, project-from-idea, prompt-from-kanban (all depend on `OPENAI_API_KEY` and OpenAI API).
4. **Navigation & tabs** — Sidebar, project detail tabs (Setup, Ideas, Design, Architecture, Documentation, Testing, Tickets, Kanban, Files, Git, Database, Run).
5. **Kanban & tickets** — Load/sync Kanban state, ticket creation/update (API + optional Tauri).
6. **Theme & settings** — UI theme (light/dark/ocean/forest/warm/red), persisted in localStorage.

### Testing Challenges

| Challenge | Mitigation |
|-----------|------------|
| **AI (OpenAI)** | Mock `openai.chat.completions.create` with fixed fixtures; test validation and error paths; snapshot UI states. |
| **Tauri** | Mock `invoke`/`listen` in unit/integration; E2E in browser only (no Tauri in E2E unless Tauri-specific suite). |
| **File system in API** | Mock `fs`/`path` or use temp dir in tests; or test against real `data/` in isolated CI. |
| **Real-time / events** | Run store uses Tauri events; mock event payloads in tests. |
| **Complex UI** | Kanban, dialogs, tabs — use component tests (RTL) and E2E for critical paths. |

---

## 1. Testing Philosophy & Principles

### Core Testing Principles

1. **Test Behavior, Not Implementation** — Assert what the user sees and what the contract guarantees (e.g. API response shape, UI text), not internal state or private functions.

2. **Every Bug Gets a Regression Test** — When a bug is fixed, add a test that would have caught it so it does not reappear.

3. **Tests Are Documentation** — Tests show how modules and APIs are intended to be used; keep them readable and focused.

4. **Fast Feedback Loops** — Unit and component tests should run in seconds. E2E can be slower but should be parallelized and kept to critical paths.

5. **Fail Fast, Fail Clearly** — Error messages and test names should make it obvious what failed and under what condition.

6. **Mock at Boundaries** — Mock external dependencies (OpenAI, Tauri `invoke`, file system, fetch) at the boundary. Do not mock the unit under test or internal helpers that are part of the same module.

7. **Test the Contract, Not the Implementation** — For APIs, test request/response and status codes; for components, test accessible behavior and outcomes.

### Testing Pyramid (This Project)

```
        /\
       /  \      ← E2E (10%): Critical user flows (projects, run, nav, key tabs)
      /    \
     /------\    ← Integration (30%): API routes, run store + mocks, parseAndValidate
    /--------\
   /----------\  ← Unit (60%): Pure functions (utils, run-helpers), Zod schemas, hooks
  /------------\
```

**Rationale**: KWCode has substantial business logic in lib (validation, run-helpers, utils), file-backed API routes, and a single main store. Unit tests give the most value for pure logic and schemas; integration tests cover API and store behavior; E2E covers the few critical paths (project CRUD, navigation, run flow) without covering every UI detail in the browser.

### Coverage Targets

| Layer | Coverage Target | Rationale |
|-------|-----------------|-----------|
| **Unit** | 80%+ | Pure functions, `utils`, `run-helpers`, Zod schemas in `api-validation.ts` |
| **Integration** | 70%+ | API routes (projects, prompts, generate-*), store actions with mocked Tauri/API |
| **E2E** | Critical paths only | Projects list/create, project detail, navigation, run (if feasible in browser) |
| **Overall** | 75%+ | Minimum for production-readiness |

### Definition of “Tested”

A feature is **tested** when:

- [ ] All acceptance criteria have corresponding tests (unit, integration, or E2E as appropriate).
- [ ] Tests pass locally and in CI.
- [ ] Code coverage meets targets for the affected layer(s).
- [ ] Edge cases are covered: empty data, error responses, loading states.
- [ ] Accessibility: automated (axe) where applicable; manual check for critical flows.
- [ ] No regressions: new tests exist for any fixed bugs.

---

## 2. Testing Stack & Tools

### Stack Matrix

| Layer | Tool | Config | Purpose | Commands |
|-------|------|--------|---------|----------|
| **Unit** | Vitest | `vitest.config.ts` | Pure functions, utils, run-helpers, Zod | `npm run test`, `npm run test:unit` |
| **Component** | Vitest + React Testing Library | `vitest.config.ts` | React components in isolation | `npm run test:unit` (same) |
| **Integration** | Vitest + mocks | `vitest.config.ts` | API route handlers, store with mocked Tauri/fetch | `npm run test:integration` |
| **E2E** | Playwright | `playwright.config.ts` | Full user flows in browser | `npm run test:e2e`, `npm run test:e2e:ui` |
| **Visual** | Playwright screenshots | Playwright config | UI regression | `npm run test:visual` (optional) |
| **Accessibility** | jest-axe / @axe-core/playwright | — | WCAG 2.1 AA | `npm run test:a11y` (optional) |
| **Security** | npm audit | — | Dependency vulnerabilities | `npm audit` |

### A. Installation (Unit + Component)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### B. Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "test/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "e2e", ".next"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "test/", "e2e/", "**/*.d.ts"],
    },
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### C. Setup File

```typescript
// test/setup.ts
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
```

### D. Package Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --exclude '**/e2e/**'",
    "test:integration": "vitest run --config vitest.config.ts -t integration",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### E. “Hello World” Unit Test

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from "vitest";
import { formatDate, humanizeAgentId, getApiErrorMessage } from "./utils";

describe("formatDate", () => {
  it("formats ISO date to short date and time", () => {
    const result = formatDate("2024-02-12T10:00:00Z");
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it("returns original string for invalid date", () => {
    const result = formatDate("not-a-date");
    expect(result).toBe("not-a-date");
  });
});

describe("humanizeAgentId", () => {
  it("converts kebab-case to Title Case", () => {
    expect(humanizeAgentId("frontend-dev")).toBe("Frontend Dev");
  });
});
```

---

## 3. Test Organization & Naming Conventions

### Directory Structure

- **Co-located** for unit and component tests:
  - `src/lib/utils.ts` → `src/lib/utils.test.ts`
  - `src/lib/api-validation.ts` → `src/lib/api-validation.test.ts`
  - `src/components/atoms/forms/SomeForm.tsx` → `src/components/atoms/forms/SomeForm.test.tsx`
- **Separate** for E2E and shared test utilities:
  - `e2e/` — Playwright specs (e.g. `e2e/projects.spec.ts`, `e2e/run.spec.ts`)
  - `e2e/page-objects/` — Page Object Model classes
  - `test/` — Setup (`test/setup.ts`), fixtures, shared mocks

```
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   └── button.test.tsx
│   └── molecules/
│       └── FormsAndDialogs/
│           ├── NewProjectForm.tsx
│           └── NewProjectForm.test.tsx
├── lib/
│   ├── utils.ts
│   ├── utils.test.ts
│   ├── api-validation.ts
│   └── api-validation.test.ts
├── store/
│   ├── run-store.ts
│   └── run-store.test.ts   # with Tauri/API mocks
e2e/
├── projects.spec.ts
├── navigation.spec.ts
├── page-objects/
│   ├── ProjectsPage.ts
│   └── AppShell.ts
test/
├── setup.ts
├── fixtures/
│   └── projects.json
└── mocks/
    └── openai.ts
```

### File Naming

| Test Type | Suffix | Example |
|-----------|--------|---------|
| Unit | `.test.ts` | `utils.test.ts` |
| Component | `.test.tsx` | `Button.test.tsx` |
| Integration | `.test.ts` | `api-projects.test.ts` (or tag with `integration`) |
| E2E | `.spec.ts` | `projects.spec.ts` |

### Test Naming Convention

```typescript
describe("ModuleNameOrComponentName", () => {
  it("should [expected behavior] when [condition]", () => {
    // Arrange, Act, Assert
  });
});
```

Examples:

```typescript
describe("createProjectSchema", () => {
  it("should accept valid project with name only", () => {});
  it("should reject empty name", () => {});
  it("should allow optional ideaIds and ticketIds", () => {});
});

describe("NewProjectForm", () => {
  it("should submit with name and optional description", () => {});
  it("should show validation error when name is empty", () => {});
});
```

### Test Tags (Vitest)

Use `describe.concurrent` or a naming convention for smoke/regression:

```typescript
// @smoke — critical path
describe("GET /api/data/projects", () => {
  it("returns list of projects", () => {});
});

// @regression — bug fix
describe("parseAndValidate", () => {
  it("returns 400 with path and message for invalid body", () => {});
});
```

Playwright tags:

```typescript
test("create project", { tag: "@smoke" }, async ({ page }) => {});
```

Run by tag:

```bash
npx playwright test --grep @smoke
```

---

## 4. Unit Testing Standards

### What to Unit Test

- Pure functions: `utils.ts` (`cn`, `humanizeAgentId`, `getApiErrorMessage`, `formatDate`, `normalizePath`, `scatter`).
- Business logic: `run-helpers.ts`, `todos-kanban.ts`, `analysis-prompt.ts`.
- Zod schemas: all schemas in `api-validation.ts` (e.g. `createProjectSchema`, `generateIdeasSchema`, `parseAndValidate`).
- Type guards / predicates (if any).

### What Not to Unit Test

- Third-party libraries (React, Next.js, Zod internals, Radix).
- Trivial getters/setters.
- Full UI rendering (use component tests for that).

### Mocking Rules

- **Mock at boundaries**: `invoke` (Tauri), `fetch`, `openai`, `fs`/`path` in API tests.
- **Do not mock** the function or module under test.

```typescript
// ✅ GOOD: Mock external API / Tauri
vi.mock("@/lib/tauri", () => ({
  invoke: vi.fn().mockResolvedValue({ projects: [] }),
  isTauri: false,
}));

// ❌ BAD: Mock the unit under test
vi.mock("@/lib/utils", () => ({ formatDate: vi.fn() })); // Don't mock what you're testing
```

### Test Patterns

#### A. Testing Zod Schemas

```typescript
// src/lib/api-validation.test.ts
import { describe, it, expect } from "vitest";
import {
  createProjectSchema,
  generateIdeasSchema,
  parseAndValidate,
} from "./api-validation";

describe("createProjectSchema", () => {
  it("should accept valid project with name only", () => {
    const result = createProjectSchema.safeParse({ name: "My Project" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("My Project");
      expect(result.data.promptIds).toEqual([]);
    }
  });

  it("should reject empty name", () => {
    const result = createProjectSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["name"]);
    }
  });

  it("should allow optional ideaIds and ticketIds", () => {
    const result = createProjectSchema.safeParse({
      name: "P",
      ideaIds: [1, 2],
      ticketIds: ["t1"],
    });
    expect(result.success).toBe(true);
  });
});

describe("parseAndValidate", () => {
  it("should return 400 for invalid JSON body", async () => {
    const req = new Request("http://localhost/api", {
      method: "POST",
      body: "not json",
    });
    const out = await parseAndValidate(req, createProjectSchema);
    expect(out.success).toBe(false);
    if (!out.success) {
      expect(out.response.status).toBe(400);
    }
  });
});
```

#### B. Testing Pure Utils

```typescript
// src/lib/utils.test.ts
import { describe, it, expect, vi } from "vitest";
import { getApiErrorMessage } from "./utils";

describe("getApiErrorMessage", () => {
  it("should return error message from JSON body", async () => {
    const res = new Response(JSON.stringify({ error: "Bad request" }), {
      status: 400,
    });
    expect(await getApiErrorMessage(res)).toBe("Bad request");
  });

  it("should return friendly message for 500 Internal Server Error", async () => {
    const res = new Response("Internal Server Error", { status: 500 });
    expect(await getApiErrorMessage(res)).not.toBe("Internal Server Error");
    expect(await getApiErrorMessage(res)).toContain("error");
  });
});
```

#### C. Testing Zustand Store (with Tauri mocked)

```typescript
// src/store/run-store.test.ts
import { renderHook, act } from "@testing-library/react";
import { useRunStore } from "./run-store";

vi.mock("@/lib/tauri", () => ({
  invoke: vi.fn(),
  isTauri: false,
}));

describe("run-store", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useRunStore.getState());
    result.current.setError(null);
    result.current.setLoading(false);
    // Reset other state as needed
  });

  it("should set active projects and allow toggle", async () => {
    const { result } = renderHook(() => useRunStore());
    await act(async () => {
      result.current.setActiveProjects(["p1", "p2"]);
    });
    expect(result.current.activeProjects).toEqual(["p1", "p2"]);
    await act(async () => {
      result.current.toggleProject("p1");
    });
    expect(result.current.activeProjects).toEqual(["p2"]);
  });
});
```

#### D. Testing Custom Hooks

```typescript
// hooks/use-projects.test.ts (if such a hook exists)
import { renderHook, waitFor } from "@testing-library/react";
import { useProjects } from "./use-projects";

vi.mock("@/lib/api-projects", () => ({
  fetchProjects: vi.fn().mockResolvedValue([{ id: "1", name: "Test" }]),
}));

describe("useProjects", () => {
  it("should fetch projects on mount", async () => {
    const { result } = renderHook(() => useProjects());
    await waitFor(() => {
      expect(result.current.projects).toHaveLength(1);
    });
    expect(result.current.projects[0].name).toBe("Test");
  });
});
```

---

## 5. Component Testing Standards

### Query Priority (React Testing Library)

1. `getByRole` — Preferred (accessibility).
2. `getByLabelText` — Forms.
3. `getByText` — Content.
4. `getByTestId` — Last resort; use `data-testid` sparingly.

### Test Pattern for Components

```typescript
// src/components/ui/button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  it("should render with children", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole("button", { name: "Click Me" })).toBeInTheDocument();
  });

  it("should call onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

### Forms

```typescript
describe("NewProjectForm", () => {
  it("should submit with name and optional description", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<NewProjectForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/name/i), "My Project");
    await user.click(screen.getByRole("button", { name: /create|submit/i }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: "My Project" }));
  });

  it("should show validation error when name is empty", async () => {
    const user = userEvent.setup();
    render(<NewProjectForm onSubmit={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /create|submit/i }));
    expect(screen.getByText(/name|required/i)).toBeInTheDocument();
  });
});
```

### Loading / Error / Empty States

```typescript
describe("ProjectList", () => {
  it("should show loading state", () => {
    render(<ProjectList projects={[]} isLoading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should show error message", () => {
    render(<ProjectList projects={[]} error="Failed to load" />);
    expect(screen.getByText("Failed to load")).toBeInTheDocument();
  });

  it("should show empty state when no projects", () => {
    render(<ProjectList projects={[]} />);
    expect(screen.getByText(/no projects|empty/i)).toBeInTheDocument();
  });
});
```

---

## 6. E2E Testing Standards (Playwright)

### Critical User Flows to Cover

1. **Navigation** — Sidebar links, project list → project detail.
2. **Projects** — List projects, create project, open project, delete project (if implemented).
3. **Project detail tabs** — Switch between Setup, Ideas, Design, etc., and see content.
4. **Run (browser)** — Load run page, see projects/prompts (no Tauri), or stub run behavior.

### Page Object Model (POM)

```typescript
// e2e/page-objects/ProjectsPage.ts
import { Page, Locator } from "@playwright/test";

export class ProjectsPage {
  readonly page: Page;
  readonly createButton: Locator;
  readonly projectCards: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createButton = page.getByRole("button", { name: /new project|create/i });
    this.projectCards = page.locator("[data-testid='project-card']");
    this.searchInput = page.getByPlaceholder(/search/i);
  }

  async goto() {
    await this.page.goto("/projects");
  }

  async createProject(name: string) {
    await this.createButton.click();
    await this.page.getByLabel(/name/i).fill(name);
    await this.page.getByRole("button", { name: /create|save/i }).click();
  }

  async getProjectCount() {
    return await this.projectCards.count();
  }
}
```

### Using POM in Specs

```typescript
// e2e/projects.spec.ts
import { test, expect } from "@playwright/test";
import { ProjectsPage } from "./page-objects/ProjectsPage";

test.describe("Projects", () => {
  test("should list projects and open project detail", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.goto();
    await expect(page).toHaveURL(/\/projects/);
    const count = await projectsPage.getProjectCount();
    if (count > 0) {
      await projectsPage.projectCards.first().click();
      await expect(page).toHaveURL(/\/projects\/[^/]+/);
    }
  });

  test("should create new project", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.goto();
    await projectsPage.createProject("E2E Test Project");
    await expect(page.getByText("E2E Test Project")).toBeVisible();
  });
});
```

### Fixtures (Auth / Test Data)

```typescript
// e2e/fixtures/auth.ts
import { test as base } from "@playwright/test";

export const test = base.extend({
  // Add authenticated page or test project if auth is introduced later
});
```

### API Mocking in E2E

```typescript
test("should show error when projects API fails", async ({ page }) => {
  await page.route("**/api/data/projects**", (route) =>
    route.fulfill({ status: 500, body: JSON.stringify({ error: "Server error" }) })
  );
  await page.goto("/projects");
  await expect(page.getByText(/error|failed/i)).toBeVisible();
});
```

### Visual Regression (Optional)

```typescript
test("projects page matches screenshot", async ({ page }) => {
  await page.goto("/projects");
  await page.waitForSelector("[data-testid='project-card'], [data-testid='empty-state']", {
    timeout: 5000,
  });
  await expect(page).toHaveScreenshot("projects-page.png", {
    threshold: 0.2,
    maxDiffPixels: 100,
  });
});
```

Update baselines: `npx playwright test --update-snapshots`.

### Cross-Browser (Optional)

In `playwright.config.ts`:

```typescript
projects: [
  { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  { name: "webkit", use: { ...devices["Desktop Safari"] } },
],
```

---

## 7. API Route Testing

Test Next.js App Router route handlers with Vitest and mocks. Use the same `parseAndValidate` and schema patterns as in the codebase.

### Example: GET/POST /api/data/projects

```typescript
// src/app/api/data/projects/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";

vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    statSync: vi.fn(() => ({ isDirectory: () => true })),
  },
}));
vi.mock("path", () => ({
  default: {
    join: (...args: string[]) => args.join("/"),
    cwd: () => "/tmp",
  },
}));

describe("GET /api/data/projects", () => {
  beforeEach(() => {
    vi.mocked(require("fs").default.readFileSync).mockReturnValue(
      JSON.stringify([{ id: "1", name: "Test Project" }])
    );
    vi.mocked(require("fs").default.existsSync).mockReturnValue(true);
  });

  it("should return list of projects", async () => {
    const request = new NextRequest("http://localhost:3000/api/data/projects");
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].name).toBe("Test Project");
  });
});

describe("POST /api/data/projects", () => {
  it("should create project with valid body", async () => {
    const body = { name: "New Project", description: "Desc" };
    const request = new NextRequest("http://localhost:3000/api/data/projects", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.name).toBe("New Project");
    expect(data.id).toBeDefined();
  });

  it("should return 400 for invalid body", async () => {
    const request = new NextRequest("http://localhost:3000/api/data/projects", {
      method: "POST",
      body: JSON.stringify({ name: "" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

---

## 8. Tauri / Native Testing

KWCode uses Tauri for desktop. In unit/integration tests, Tauri must be mocked.

### Mocking Tauri in Tests

```typescript
// test/mocks/tauri.ts or in test file
vi.mock("@/lib/tauri", () => ({
  invoke: vi.fn(),
  isTauri: false,
  listen: vi.fn().mockResolvedValue(() => {}),
}));
```

### Testing Code That Calls `invoke`

```typescript
import { invoke } from "@/lib/tauri";
import { vi } from "vitest";

vi.mock("@/lib/tauri");
const mockInvoke = vi.mocked(invoke);

it("should call invoke with correct command", async () => {
  mockInvoke.mockResolvedValue({ projects: ["p1"] });
  const result = await loadProjectsFromTauri();
  expect(mockInvoke).toHaveBeenCalledWith("get_projects");
  expect(result).toEqual(["p1"]);
});
```

### Rust Unit Tests (Tauri Backend)

If the Tauri side has Rust commands, add Rust tests:

```rust
// src-tauri/src/commands.rs (or equivalent)
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_projects() {
        let result = get_projects();
        assert!(result.is_ok());
    }
}
```

Run: `cargo test` in `src-tauri/`.

---

## 9. Testing AI Features

### Challenge

OpenAI responses are non-deterministic. Tests should not call the real API.

### Strategy

- Mock `openai.chat.completions.create` with fixed JSON responses.
- Test request validation (Zod) and error handling (missing key, invalid JSON from model).
- Snapshot or assert UI states (loading, success, error) in component tests.

### Mock OpenAI

```typescript
// test/mocks/openai.ts
import { vi } from "vitest";

export const mockOpenAIResponse = (content: string) => ({
  id: "chatcmpl-123",
  object: "chat.completion",
  created: Date.now(),
  model: "gpt-4o-mini",
  choices: [
    {
      index: 0,
      message: { role: "assistant", content },
      finish_reason: "stop",
    },
  ],
});

vi.mock("openai", () => ({
  default: class OpenAI {
    chat = {
      completions: {
        create: vi.fn().mockResolvedValue(
          mockOpenAIResponse(JSON.stringify({ title: "Generated", content: "Prompt content" }))
        ),
      },
    };
  },
}));
```

### Test Generate Endpoint (with mock)

```typescript
// src/app/api/generate-prompt/route.test.ts
import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

vi.mock("openai", () => ({
  default: class OpenAI {
    chat = {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({ title: "Test", content: "Prompt body" }),
              },
            },
          ],
        }),
      },
    };
  },
}));

describe("POST /api/generate-prompt", () => {
  it("should return 500 when OPENAI_API_KEY is not set", async () => {
    const orig = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    const req = new NextRequest("http://localhost/api/generate-prompt", {
      method: "POST",
      body: JSON.stringify({ description: "A button" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
    process.env.OPENAI_API_KEY = orig;
  });

  it("should return 400 for invalid body", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    const req = new NextRequest("http://localhost/api/generate-prompt", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
```

### Snapshot for AI UI

```typescript
describe("PromptGenerationCard", () => {
  it("should match snapshot in loading state", () => {
    const { container } = render(<PromptGenerationCard isLoading />);
    expect(container).toMatchSnapshot();
  });
});
```

---

## 10. Accessibility Testing

### Automated (jest-axe with Vitest)

```bash
npm install -D jest-axe
```

```typescript
// src/components/ui/button.test.tsx
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Button } from "./button";

expect.extend(toHaveNoViolations);

describe("Button a11y", () => {
  it("should have no violations", async () => {
    const { container } = render(<Button>Click</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Playwright (axe-core)

```bash
npm install -D @axe-core/playwright
```

```typescript
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("projects page has no a11y violations", async ({ page }) => {
  await page.goto("/projects");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

### Manual Checklist

- [ ] Keyboard: Tab, Enter, Space for all interactive elements.
- [ ] Focus: Visible focus ring on focusable elements.
- [ ] Screen reader: Test with VoiceOver (macOS) or NVDA (Windows).
- [ ] Contrast: WCAG AA (4.5:1 normal text, 3:1 large text).
- [ ] Images: Descriptive `alt` text.
- [ ] Forms: Labels for all inputs.
- [ ] Headings: Logical hierarchy (h1 → h2 → h3).
- [ ] ARIA: Correct roles, labels, and states where needed.

---

## 11. Performance Testing

### Lighthouse CI (Optional)

```json
// .lighthouserc.json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "url": ["http://127.0.0.1:4000", "http://127.0.0.1:4000/projects"]
    },
    "assert": {
      "assertions": {
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    }
  }
}
```

```bash
npm run build && npm run start
npx lhci autorun
```

### Bundle Size

Monitor `.next` output size; add a simple check or budget in CI if needed.

---

## 12. CI/CD Integration

### Pipeline Stages (Example: GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Tests
on: [pull_request, push]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run lint

  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run test:unit -- --coverage
      # - uses: codecov/codecov-action@v4

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Parallelization and Retries

- `playwright.config.ts`: `workers: process.env.CI ? 2 : 4`, `retries: process.env.CI ? 2 : 0`.
- Vitest: default parallelism; use `--no-file-parallelism` only if needed.

### Flaky Tests

- Retry E2E in CI (e.g. 2 retries).
- Quarantine: mark flaky tests with `.skip` and an issue; fix or stabilize.
- Prefer `waitFor` and stable selectors (roles, testids) over fixed timeouts.

---

## 13. Testing Anti-Patterns (Avoid These)

1. **Testing implementation details**  
   ❌ Asserting `component.state.count`.  
   ✅ Assert visible outcome (e.g. "Count: 1" on screen).

2. **Sleeping instead of waiting**  
   ❌ `await new Promise(r => setTimeout(r, 1000))`.  
   ✅ `await waitFor(() => expect(screen.getByText('Loaded')).toBeInTheDocument())`.

3. **Shared mutable state**  
   ❌ Global `let user` reused across tests.  
   ✅ Fresh data per test in `beforeEach` or inside the test.

4. **Over-mocking**  
   ❌ Mocking internal helpers of the module under test.  
   ✅ Mock only boundaries (API, Tauri, fs, OpenAI).

5. **Testing third-party libraries**  
   ❌ Testing that React or Zod work.  
   ✅ Test your code that uses them.

6. **No assertions**  
   ❌ `render(<Component />)` with no `expect`.  
   ✅ Always assert at least one outcome.

7. **Too many assertions in one test**  
   ❌ One test that checks 10 unrelated things.  
   ✅ One behavior per test; split into focused tests.

8. **Not cleaning up**  
   ❌ Leaving store or globals dirty.  
   ✅ `afterEach(cleanup)`, reset store in `beforeEach` where needed.

9. **Brittle selectors**  
   ❌ `getByText('Submit')` (breaks on copy change).  
   ✅ `getByRole('button', { name: /submit/i })` or stable `data-testid`.

10. **Ignoring accessibility in tests**  
    ❌ Only `data-testid` for everything.  
    ✅ Prefer `getByRole`, `getByLabelText` so tests reflect a11y.

11. **E2E depending on real OpenAI / Tauri**  
    ❌ Calling real API or Tauri in E2E.  
    ✅ Stub network and run E2E in browser only; test Tauri in unit/integration with mocks.

12. **Skipping tests without reason**  
    ❌ `it.skip` with no comment.  
    ✅ `it.skip('OAuth not configured in test env', () => {})`.

13. **Hardcoded environment**  
    ❌ Assuming `OPENAI_API_KEY` is set in tests.  
    ✅ Mock or unset in test and assert error path.

14. **Testing through the UI when a unit test suffices**  
    ❌ E2E only for a pure validation rule.  
    ✅ Unit test the schema; use E2E for full user flows.

15. **Unstable or missing selectors**  
    ❌ Relying on class names or DOM order.  
    ✅ Use `data-testid` only where necessary; prefer roles and labels.

---

## Appendix: Quick Reference

### Test Commands

```bash
npm test                 # Vitest (watch)
npm run test:unit        # Unit/component once
npm run test:integration # Integration tests
npm run test:coverage    # With coverage
npm run test:e2e         # Playwright
npm run test:e2e:ui      # Playwright UI
```

### Coverage Reports

- HTML: `coverage/index.html` (after `npm run test:coverage`).
- CI: Add Codecov or similar to upload `coverage/`.

### Key Files

| Purpose | Path |
|---------|------|
| Vitest config | `vitest.config.ts` |
| Test setup | `test/setup.ts` |
| Playwright config | `playwright.config.ts` |
| E2E specs | `e2e/*.spec.ts` |
| Zod validation | `src/lib/api-validation.ts` |
| Run store | `src/store/run-store.ts` |
| Tauri bridge | `src/lib/tauri.ts` |

---

*This testing strategy is a living playbook. Update it as new patterns and tools are adopted.*
