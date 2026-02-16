# PROMPT 05: GENERATE TESTING.MD

Copy this prompt into Cursor with Opus 4.6 to generate `.cursor/setup/testing.md`

---

You are a principal QA architect and test engineering lead with 15+ years of experience designing comprehensive testing strategies for complex applications at companies like Netflix, Airbnb, Stripe, and Vercel. You're an expert in all testing paradigms: unit, integration, E2E, visual regression, accessibility, performance, and security testing.

## YOUR TASK

Generate a **comprehensive, production-grade `testing.md`** file that serves as the definitive testing strategy, standards, patterns, and playbook for this project. This document must be actionable, specific, and enforceable.

## PROJECT CONTEXT ANALYSIS

**FIRST, deeply analyze the project's testing landscape:**

1. **Identify the Application Architecture**
   - What type of app? (Web, desktop hybrid, mobile, API-only)
   - Frontend framework (React, Vue, Svelte, vanilla JS)
   - Backend (Next.js routes, Express, serverless, Tauri)
   - State management (Zustand, Redux, Context, none)
   - Data layer (Database, API, file system, all three)

2. **Assess Current Testing Infrastructure**
   - What test runners exist? (Vitest, Jest, Playwright, Cypress)
   - What's the test coverage? (<30% = immature, 30-70% = emerging, >70% = mature)
   - Are tests passing? (All green = healthy, many red = technical debt)
   - What's missing? (E2E, integration, accessibility, performance)

3. **Identify Critical User Flows**
   - What MUST work? (Auth, data CRUD, payment, critical features)
   - What breaks most often? (Prioritize test coverage here)
   - What has external dependencies? (APIs, databases, third-party services)

4. **Map Testing Challenges**
   - AI features (mocking LLM responses)
   - Native bindings (Tauri, Electron)
   - Real-time features (WebSockets, SSE)
   - File uploads/downloads
   - Complex UI interactions (drag-drop, infinite scroll)

**OUTPUT this analysis in a brief section at the top of testing.md as "Testing Landscape"**

---

## REQUIRED SECTIONS

Generate a testing.md with the following structure. Be EXHAUSTIVE, SPECIFIC, and OPINIONATED.

### 1. TESTING PHILOSOPHY & PRINCIPLES

**Core Testing Principles (5-7 principles)**

1. **[Principle Name]** - [One-sentence rationale]
   - Example: "Test Behavior, Not Implementation" - Tests should verify what users see, not internal state

2. **[Principle]** - [Rationale]
3. **[Principle]** - [Rationale]
4. **[Principle]** - [Rationale]
5. **[Principle]** - [Rationale]

**Suggested Principles**:
- "Every Bug Gets a Regression Test" (prevent recurring bugs)
- "Tests Are Documentation" (they show how code should be used)
- "Fast Feedback Loops" (tests should run in seconds, not minutes)
- "Fail Fast, Fail Clearly" (errors should be obvious and actionable)
- "Mock at Boundaries" (mock external deps, not internal logic)
- "Test the Contract, Not the Implementation" (interface stability)

**Testing Pyramid/Trophy**

Define which shape this project follows:

```
        /\
       /  \      ← E2E (10%): Critical user flows
      /    \
     /------\    ← Integration (30%): Module interactions
    /--------\
   /----------\  ← Unit (60%): Pure functions, utils, hooks
  /------------\
```

OR

```
     /------\   ← E2E (20%): More E2E for UI-heavy apps
    /--------\
   /----------\  ← Integration (50%): Most tests here
  /----    ----\ ← Unit (30%): Less unit for simple logic
```

**Explain the ratio for THIS project** (why this distribution?)

**Coverage Targets**

| Layer | Coverage Target | Rationale |
|-------|-----------------|-----------|
| **Unit** | 80%+ | Pure functions, business logic, utilities |
| **Integration** | 70%+ | Component interactions, API routes |
| **E2E** | Critical paths | Auth flow, CRUD operations, key features |
| **Overall** | 75%+ | Minimum for production-readiness |

**Definition of Tested**

A feature is "tested" when:
- [ ] All acceptance criteria have corresponding tests
- [ ] Tests pass locally and in CI
- [ ] Code coverage meets targets (per layer)
- [ ] Edge cases are covered (empty, error, loading states)
- [ ] Accessibility tests pass (automated + manual)
- [ ] Performance benchmarks pass (if applicable)

---

### 2. TESTING STACK & TOOLS

Provide a complete testing stack matrix:

| Layer | Tool | Config File | Purpose | Commands |
|-------|------|-------------|---------|----------|
| **Unit** | Vitest / Jest | `vitest.config.ts` | Test pure functions, utilities, hooks | `npm test`, `npm run test:watch` |
| **Component** | Vitest + Testing Library | `vitest.config.ts` | Test React components in isolation | `npm run test:unit` |
| **Integration** | Vitest + Supertest / MSW | `vitest.config.ts` | Test API routes, data flows | `npm run test:integration` |
| **E2E** | Playwright / Cypress | `playwright.config.ts` | Test full user flows in browser | `npm run test:e2e` |
| **Visual Regression** | Playwright screenshots | Playwright config | Catch unintended UI changes | `npm run test:visual` |
| **Accessibility** | axe-playwright / jest-axe | N/A | WCAG 2.1 AA compliance | `npm run test:a11y` |
| **Performance** | Lighthouse CI | `.lighthouserc.json` | Core Web Vitals, bundle size | `npm run test:perf` |
| **Security** | npm audit, Snyk | N/A | Dependency vulnerabilities | `npm audit`, `snyk test` |

**For Each Tool, Provide:**

#### A. Installation
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

#### B. Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test/'],
    },
  },
})
```

#### C. Setup File
```typescript
// test/setup.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
```

#### D. "Hello World" Test
```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatDate } from './utils'

describe('formatDate', () => {
  it('formats ISO date to human-readable', () => {
    const result = formatDate('2024-02-12T10:00:00Z')
    expect(result).toBe('Feb 12, 2024')
  })
})
```

---

### 3. TEST ORGANIZATION & NAMING CONVENTIONS

**Directory Structure**

Define where tests live:

**Option A: Co-located** (preferred for component/unit tests)
```
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx  ← Co-located with component
├── lib/
│   ├── utils.ts
│   └── utils.test.ts    ← Co-located with module
```

**Option B: Separate `/tests` or `/__tests__` folder** (for E2E, integration)
```
tests/
├── e2e/
│   ├── auth.spec.ts
│   ├── projects.spec.ts
│   └── page-objects/
├── integration/
│   ├── api/
│   │   └── projects.test.ts
│   └── db/
└── fixtures/
    └── sample-data.json
```

**Recommendation**: Co-locate unit/component tests, separate E2E tests.

---

**File Naming Conventions**

| Test Type | Suffix | Example |
|-----------|--------|---------|
| Unit | `.test.ts` | `utils.test.ts` |
| Component | `.test.tsx` | `Button.test.tsx` |
| Integration | `.test.ts` | `api-projects.test.ts` |
| E2E | `.spec.ts` or `.e2e.ts` | `auth.spec.ts`, `auth.e2e.ts` |

**Test Naming Convention**

```typescript
describe('ComponentName / FunctionName', () => {
  it('should [expected behavior] when [condition]', () => {
    // Arrange, Act, Assert
  })
})
```

**Examples**:
```typescript
describe('Button', () => {
  it('should call onClick handler when clicked', () => {})
  it('should be disabled when loading prop is true', () => {})
  it('should display spinner when loading', () => {})
})

describe('formatDate', () => {
  it('should format ISO date to readable string', () => {})
  it('should return "Invalid Date" for malformed input', () => {})
  it('should handle timezone offsets correctly', () => {})
})
```

---

**Test Categorization (Tags/Annotations)**

Use comments or test metadata to categorize tests:

```typescript
// @smoke - Critical tests that must always pass
// @regression - Tests for known bugs (prevent recurrence)
// @slow - Tests that take >5 seconds
// @skip - Temporarily skipped (with reason)

describe('Auth Flow', () => {
  it.concurrent('should login with valid credentials', () => {}) // @smoke
  it.skip('should handle OAuth redirect', () => {}) // @skip: OAuth not configured in test env
})
```

**Playwright Tags**:
```typescript
test('create project', { tag: '@smoke' }, async ({ page }) => {})
```

Run specific tags:
```bash
npx playwright test --grep @smoke
```

---

### 4. UNIT TESTING STANDARDS

**What to Unit Test**:
- ✅ Pure functions (input → output, no side effects)
- ✅ Utility functions (formatters, validators, parsers)
- ✅ Business logic (calculations, transformations)
- ✅ Zod schemas (validation rules)
- ✅ Custom React hooks (with `renderHook`)
- ✅ Type guards, predicates

**What NOT to Unit Test**:
- ❌ Third-party libraries (trust they're tested)
- ❌ Framework internals (React, Next.js)
- ❌ Trivial getters/setters
- ❌ UI rendering (use component tests)

---

**Mocking Rules**

**Mock at Boundaries** (external dependencies):
```typescript
// ✅ GOOD: Mock external API
vi.mock('@/lib/api', () => ({
  fetchProjects: vi.fn().mockResolvedValue([{ id: '1', name: 'Test' }])
}))

// ❌ BAD: Mock internal function being tested
vi.mock('@/lib/utils', () => ({
  helperFunction: vi.fn() // Don't mock what you're testing!
}))
```

**Never Mock the Unit Under Test** (defeats the purpose of testing)

---

**Test Patterns for Common Scenarios**

#### A. Testing Zustand Stores

```typescript
// store/auth-store.test.ts
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from './auth-store'

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isLoading: false })
  })

  it('should log in user', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    await act(async () => {
      await result.current.login('user@example.com', 'password')
    })
    
    expect(result.current.user).toEqual({ email: 'user@example.com' })
    expect(result.current.isLoading).toBe(false)
  })

  it('should set error on login failure', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    await act(async () => {
      await result.current.login('invalid@example.com', 'wrong')
    })
    
    expect(result.current.user).toBeNull()
    expect(result.current.error).toBe('Invalid credentials')
  })
})
```

#### B. Testing Zod Schemas

```typescript
// lib/validations/project.test.ts
import { describe, it, expect } from 'vitest'
import { projectSchema } from './project'

describe('projectSchema', () => {
  it('should validate valid project data', () => {
    const valid = { name: 'Test Project', status: 'active' }
    const result = projectSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('should reject empty name', () => {
    const invalid = { name: '', status: 'active' }
    const result = projectSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(['name'])
  })

  it('should reject invalid status', () => {
    const invalid = { name: 'Test', status: 'invalid' }
    const result = projectSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})
```

#### C. Testing Custom Hooks

```typescript
// hooks/use-projects.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useProjects } from './use-projects'

vi.mock('@/lib/api', () => ({
  fetchProjects: vi.fn().mockResolvedValue([{ id: '1', name: 'Test' }])
}))

describe('useProjects', () => {
  it('should fetch projects on mount', async () => {
    const { result } = renderHook(() => useProjects())
    
    expect(result.current.isLoading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(result.current.projects).toHaveLength(1)
    expect(result.current.projects[0].name).toBe('Test')
  })

  it('should set error on fetch failure', async () => {
    const { fetchProjects } = await import('@/lib/api')
    vi.mocked(fetchProjects).mockRejectedValueOnce(new Error('Network error'))
    
    const { result } = renderHook(() => useProjects())
    
    await waitFor(() => {
      expect(result.current.error).toBe('Network error')
    })
  })
})
```

---

### 5. COMPONENT TESTING STANDARDS

**Use React Testing Library** (query priority):

1. `getByRole` — Accessible queries (preferred)
2. `getByLabelText` — Form elements
3. `getByText` — Text content
4. `getByTestId` — Last resort (use `data-testid`)

**Testing Philosophy**: Test what the USER sees, not internal state.

---

**Test Pattern for Components**

```typescript
// components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('should render with children', () => {
    render(<Button>Click Me</Button>)
    expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should show loading spinner when loading', () => {
    render(<Button loading>Click</Button>)
    expect(screen.getByRole('status')).toBeInTheDocument() // Spinner with role="status"
  })
})
```

---

**Testing Patterns for Common Scenarios**

#### A. Testing Forms

```typescript
describe('LoginForm', () => {
  it('should submit form with valid data', async () => {
    const handleSubmit = vi.fn()
    render(<LoginForm onSubmit={handleSubmit} />)
    
    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Log In' }))
    
    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123'
    })
  })

  it('should show validation errors for invalid input', async () => {
    render(<LoginForm onSubmit={vi.fn()} />)
    
    await userEvent.click(screen.getByRole('button', { name: 'Log In' }))
    
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })
})
```

#### B. Testing Dialogs

```typescript
describe('DeleteProjectDialog', () => {
  it('should open dialog when trigger is clicked', async () => {
    render(<DeleteProjectDialog projectId="123" />)
    
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
  })

  it('should close dialog when cancel is clicked', async () => {
    render(<DeleteProjectDialog projectId="123" />)
    
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should call onDelete when confirmed', async () => {
    const handleDelete = vi.fn()
    render(<DeleteProjectDialog projectId="123" onDelete={handleDelete} />)
    
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    
    expect(handleDelete).toHaveBeenCalledWith('123')
  })
})
```

#### C. Testing Data Display (Loading, Error, Empty States)

```typescript
describe('ProjectList', () => {
  it('should show loading spinner when loading', () => {
    render(<ProjectList projects={[]} isLoading={true} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('should show error message when error occurs', () => {
    render(<ProjectList projects={[]} error="Failed to load" />)
    expect(screen.getByText('Failed to load')).toBeInTheDocument()
  })

  it('should show empty state when no projects', () => {
    render(<ProjectList projects={[]} />)
    expect(screen.getByText(/no projects found/i)).toBeInTheDocument()
  })

  it('should render project cards when projects exist', () => {
    const projects = [{ id: '1', name: 'Project 1' }, { id: '2', name: 'Project 2' }]
    render(<ProjectList projects={projects} />)
    
    expect(screen.getByText('Project 1')).toBeInTheDocument()
    expect(screen.getByText('Project 2')).toBeInTheDocument()
  })
})
```

#### D. Testing Theme-Dependent Components

```typescript
describe('ThemeToggle', () => {
  it('should render correctly in light mode', () => {
    render(<ThemeToggle theme="light" />)
    expect(screen.getByRole('button', { name: /dark mode/i })).toBeInTheDocument()
  })

  it('should render correctly in dark mode', () => {
    render(<ThemeToggle theme="dark" />)
    expect(screen.getByRole('button', { name: /light mode/i })).toBeInTheDocument()
  })

  it('should toggle theme when clicked', async () => {
    const handleToggle = vi.fn()
    render(<ThemeToggle theme="light" onToggle={handleToggle} />)
    
    await userEvent.click(screen.getByRole('button'))
    
    expect(handleToggle).toHaveBeenCalledWith('dark')
  })
})
```

---

### 6. E2E TESTING STANDARDS (PLAYWRIGHT)

**Define Critical User Flows**

These MUST have E2E tests:

1. **Authentication Flow** (register, login, logout, forgot password)
2. **Core CRUD Operations** (create, read, update, delete primary entities)
3. **Critical Business Logic** (payment processing, order fulfillment)
4. **Navigation** (sidebar, tabs, breadcrumbs, back button)
5. **Settings/Configuration** (theme, preferences, API keys)

---

**Page Object Model (POM)**

Encapsulate page interactions in classes:

```typescript
// tests/page-objects/ProjectsPage.ts
import { Page, Locator } from '@playwright/test'

export class ProjectsPage {
  readonly page: Page
  readonly createButton: Locator
  readonly projectCards: Locator
  readonly searchInput: Locator

  constructor(page: Page) {
    this.page = page
    this.createButton = page.getByRole('button', { name: 'Create Project' })
    this.projectCards = page.locator('[data-testid="project-card"]')
    this.searchInput = page.getByPlaceholder('Search projects')
  }

  async goto() {
    await this.page.goto('/projects')
  }

  async createProject(name: string) {
    await this.createButton.click()
    await this.page.getByLabel('Project Name').fill(name)
    await this.page.getByRole('button', { name: 'Create' }).click()
  }

  async searchProjects(query: string) {
    await this.searchInput.fill(query)
    await this.searchInput.press('Enter')
  }

  async getProjectCount() {
    return await this.projectCards.count()
  }
}
```

**Using POM in Tests**:
```typescript
// tests/e2e/projects.spec.ts
import { test, expect } from '@playwright/test'
import { ProjectsPage } from '../page-objects/ProjectsPage'

test.describe('Projects', () => {
  test('should create new project', async ({ page }) => {
    const projectsPage = new ProjectsPage(page)
    await projectsPage.goto()
    
    await projectsPage.createProject('My Test Project')
    
    expect(await projectsPage.getProjectCount()).toBe(1)
    expect(page.getByText('My Test Project')).toBeVisible()
  })

  test('should search projects', async ({ page }) => {
    const projectsPage = new ProjectsPage(page)
    await projectsPage.goto()
    
    await projectsPage.searchProjects('Test')
    
    expect(await projectsPage.getProjectCount()).toBeGreaterThan(0)
  })
})
```

---

**Fixture Strategy (Test Data Setup)**

```typescript
// tests/fixtures/projects.ts
import { test as base } from '@playwright/test'

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Setup: Log in before each test
    await page.goto('/login')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password')
    await page.getByRole('button', { name: 'Log In' }).click()
    await page.waitForURL('/dashboard')
    
    await use(page)
    
    // Teardown: Log out after test
    await page.getByRole('button', { name: 'Log Out' }).click()
  },

  testProject: async ({ page }, use) => {
    // Create a test project
    await page.goto('/projects')
    await page.getByRole('button', { name: 'Create Project' }).click()
    await page.getByLabel('Name').fill('Test Project')
    await page.getByRole('button', { name: 'Create' }).click()
    
    const projectId = await page.locator('[data-project-id]').first().getAttribute('data-project-id')
    
    await use(projectId)
    
    // Cleanup: Delete test project
    await page.goto(`/projects/${projectId}`)
    await page.getByRole('button', { name: 'Delete' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()
  },
})
```

**Using Fixtures**:
```typescript
test('should edit project', async ({ authenticatedPage, testProject }) => {
  await authenticatedPage.goto(`/projects/${testProject}`)
  await authenticatedPage.getByRole('button', { name: 'Edit' }).click()
  await authenticatedPage.getByLabel('Name').fill('Updated Project')
  await authenticatedPage.getByRole('button', { name: 'Save' }).click()
  
  expect(authenticatedPage.getByText('Updated Project')).toBeVisible()
})
```

---

**API Mocking (Intercept Network Requests)**

```typescript
test('should handle API error gracefully', async ({ page }) => {
  // Mock API to return error
  await page.route('**/api/projects', (route) => {
    route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    })
  })
  
  await page.goto('/projects')
  
  expect(page.getByText(/failed to load/i)).toBeVisible()
  expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
})
```

---

**Screenshot Testing (Visual Regression)**

```typescript
test('should match screenshot', async ({ page }) => {
  await page.goto('/projects')
  
  // Wait for content to load
  await page.waitForSelector('[data-testid="project-card"]')
  
  // Take screenshot and compare
  await expect(page).toHaveScreenshot('projects-page.png', {
    threshold: 0.2, // 20% diff tolerance
    maxDiffPixels: 100,
  })
})
```

**Baseline Update**:
```bash
npx playwright test --update-snapshots
```

---

**Cross-Browser Testing**

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
})
```

Run specific browser:
```bash
npx playwright test --project=firefox
```

---

### 7. API ROUTE TESTING

**Test Next.js App Router API Routes** with Vitest + Node mocks:

```typescript
// app/api/projects/route.test.ts
import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from './route'

vi.mock('@/lib/db', () => ({
  getProjects: vi.fn().mockResolvedValue([{ id: '1', name: 'Test' }]),
  createProject: vi.fn().mockResolvedValue({ id: '2', name: 'New Project' }),
}))

describe('GET /api/projects', () => {
  it('should return list of projects', async () => {
    const request = new NextRequest('http://localhost:3000/api/projects')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(1)
  })
})

describe('POST /api/projects', () => {
  it('should create new project with valid data', async () => {
    const body = { name: 'New Project', status: 'active' }
    const request = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data.name).toBe('New Project')
  })

  it('should return 400 for invalid data', async () => {
    const body = { name: '' } // Invalid: empty name
    const request = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })
})
```

---

### 8. [IF APPLICABLE] TAURI / NATIVE TESTING

*Only include if project has native bindings (Tauri, Electron)*

**Rust Unit Tests for Tauri Commands**:

```rust
// src-tauri/src/commands.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_projects() {
        let result = get_projects();
        assert!(result.is_ok());
        assert!(result.unwrap().len() > 0);
    }

    #[test]
    fn test_create_project() {
        let project = Project {
            id: "test".to_string(),
            name: "Test Project".to_string(),
        };
        let result = create_project(project);
        assert!(result.is_ok());
    }
}
```

**Integration Testing (Frontend ↔ Tauri IPC)**:

```typescript
// tests/tauri/ipc.test.ts
import { invoke } from '@tauri-apps/api/tauri'
import { describe, it, expect } from 'vitest'

describe('Tauri IPC', () => {
  it('should invoke get_projects command', async () => {
    const projects = await invoke('get_projects')
    expect(Array.isArray(projects)).toBe(true)
  })

  it('should create project via Tauri command', async () => {
    const project = { name: 'Test Project' }
    const result = await invoke('create_project', { project })
    expect(result).toHaveProperty('id')
  })
})
```

---

### 9. TESTING AI FEATURES

**Challenge**: AI responses are non-deterministic.

**Strategy**: Mock AI API responses with realistic fixtures.

---

**Mock OpenAI API**:

```typescript
// tests/mocks/openai.ts
import { vi } from 'vitest'

export const mockOpenAIResponse = (content: string) => {
  return {
    id: 'chatcmpl-123',
    object: 'chat.completion',
    created: Date.now(),
    model: 'gpt-4',
    choices: [{
      index: 0,
      message: { role: 'assistant', content },
      finish_reason: 'stop',
    }],
  }
}

vi.mock('openai', () => ({
  default: class OpenAI {
    chat = {
      completions: {
        create: vi.fn().mockResolvedValue(mockOpenAIResponse('Test response'))
      }
    }
  }
}))
```

**Test AI Generation Endpoint**:

```typescript
describe('POST /api/generate-prompt', () => {
  it('should generate prompt from input', async () => {
    const request = new NextRequest('http://localhost:3000/api/generate-prompt', {
      method: 'POST',
      body: JSON.stringify({ input: 'Create a button component' }),
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.data).toContain('Test response')
  })
})
```

**Snapshot Testing for AI UI**:

```typescript
describe('PromptGenerationCard', () => {
  it('should match snapshot in loading state', () => {
    const { container } = render(<PromptGenerationCard isLoading={true} />)
    expect(container).toMatchSnapshot()
  })

  it('should match snapshot with generated content', () => {
    const { container } = render(
      <PromptGenerationCard content="Generated prompt content" />
    )
    expect(container).toMatchSnapshot()
  })
})
```

---

### 10. ACCESSIBILITY TESTING

**Automated Accessibility Tests** (axe-core integration):

```typescript
// tests/a11y/button.test.tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Button } from '@/components/ui/button'

expect.extend(toHaveNoViolations)

describe('Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click Me</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should be accessible when disabled', async () => {
    const { container } = render(<Button disabled>Click Me</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

**Playwright Accessibility Tests**:

```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('should pass accessibility audit', async ({ page }) => {
  await page.goto('/projects')
  
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  
  expect(accessibilityScanResults.violations).toEqual([])
})
```

---

**Manual Accessibility Checklist**:

- [ ] **Keyboard Navigation**: All interactive elements accessible via Tab, Enter, Space
- [ ] **Focus Indicators**: Visible focus ring on all focusable elements
- [ ] **Screen Reader**: Test with VoiceOver (Mac), NVDA (Windows), or JAWS
- [ ] **Color Contrast**: All text meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
- [ ] **Alt Text**: All images have descriptive alt text
- [ ] **Form Labels**: All inputs have associated labels
- [ ] **Headings**: Proper heading hierarchy (h1 → h2 → h3, no skipping)
- [ ] **ARIA**: Correct ARIA roles, labels, and states

---

### 11. PERFORMANCE TESTING

**Lighthouse CI Integration**:

```yaml
# .lighthouserc.json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "url": ["http://localhost:3000", "http://localhost:3000/projects"]
    },
    "assert": {
      "assertions": {
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }]
      }
    }
  }
}
```

**Run Lighthouse**:
```bash
npm run build
npm run start
npx lhci autorun
```

---

**Bundle Size Monitoring**:

```typescript
// tests/bundle-size.test.ts
import { readFileSync } from 'fs'
import { describe, it, expect } from 'vitest'

describe('Bundle Size', () => {
  it('should not exceed size budget', () => {
    const stats = JSON.parse(readFileSync('.next/build-manifest.json', 'utf-8'))
    const totalSize = Object.values(stats.pages).flat().reduce((acc, file) => {
      const size = statSync(`.next/${file}`).size
      return acc + size
    }, 0)
    
    const MB = totalSize / 1024 / 1024
    expect(MB).toBeLessThan(2) // Max 2MB initial bundle
  })
})
```

---

### 12. CI/CD INTEGRATION

**Test Pipeline Stages**:

```yaml
# .github/workflows/test.yml
name: Tests
on: [pull_request, push]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  visual:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:visual
```

---

**Parallelization Strategy**:

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 2 : 4, // Fewer workers in CI
  retries: process.env.CI ? 2 : 0, // Retry flaky tests in CI
  fullyParallel: true,
})
```

---

**Flaky Test Management**:

- **Retry policy**: Retry up to 2 times in CI
- **Quarantine**: Mark flaky tests with `.skip` and file an issue
- **Root cause**: Investigate timing issues, race conditions

---

### 13. TESTING ANTI-PATTERNS (AVOID THESE)

List 12-15 anti-patterns with examples:

#### 1. Testing Implementation Details
❌ **BAD**:
```typescript
it('should update state variable', () => {
  expect(component.state.count).toBe(1)
})
```
✅ **GOOD**:
```typescript
it('should display updated count', () => {
  expect(screen.getByText('Count: 1')).toBeInTheDocument()
})
```

#### 2. Sleeping Instead of Waiting
❌ **BAD**:
```typescript
await new Promise(resolve => setTimeout(resolve, 1000))
```
✅ **GOOD**:
```typescript
await waitFor(() => expect(screen.getByText('Loaded')).toBeInTheDocument())
```

#### 3. Shared Mutable Test State
❌ **BAD**:
```typescript
let user: User // Shared across tests
beforeEach(() => { user = createUser() })
```
✅ **GOOD**:
```typescript
beforeEach(() => {
  const user = createUser() // Fresh for each test
})
```

#### 4. Over-Mocking
❌ **BAD**: Mocking everything, including internal functions
✅ **GOOD**: Mock only external dependencies (API, DB, timers)

#### 5. Testing Third-Party Libraries
❌ **BAD**: Testing that React hooks work correctly
✅ **GOOD**: Trust the library, test YOUR code that uses it

#### 6. No Assertions
❌ **BAD**:
```typescript
it('should render', () => {
  render(<Component />)
  // No assertion!
})
```
✅ **GOOD**:
```typescript
it('should render title', () => {
  render(<Component />)
  expect(screen.getByText('Title')).toBeInTheDocument()
})
```

#### 7. Too Many Assertions in One Test
❌ **BAD**: One test that checks 10 different things
✅ **GOOD**: Split into focused tests (one behavior per test)

#### 8. Not Cleaning Up After Tests
❌ **BAD**: Leaving global state polluted
✅ **GOOD**: Use `afterEach(cleanup)` or `beforeEach(reset)`

#### 9. Brittle Selectors
❌ **BAD**: `getByText('Submit')` (breaks if text changes)
✅ **GOOD**: `getByRole('button', { name: /submit/i })`

#### 10. Ignoring Accessibility in Tests
❌ **BAD**: Using `data-testid` for everything
✅ **GOOD**: Using accessible queries (`getByRole`, `getByLabelText`)

---

## FORMATTING REQUIREMENTS

1. Use markdown with headers (##, ###, ####)
2. Provide complete, runnable code examples (TypeScript, Rust)
3. Use tables for tool comparisons, test matrices
4. Use blockquotes for warnings: `> ⚠️ Warning: ...`
5. Be SPECIFIC and ACTIONABLE (no vague "test thoroughly")
6. Target 900-1200 lines (comprehensive reference)

---

## FINAL OUTPUT STRUCTURE

```markdown
# Testing Strategy & Standards — [Project Name]

**Version**: 1.0  
**Last Updated**: [Date]  
**Author**: Principal QA Architect (AI)

---

## Testing Landscape

[Brief analysis of current testing state]

---

## 1. Testing Philosophy & Principles

[Content]

---

## 2. Testing Stack & Tools

[Complete tool matrix with installation, config, examples]

---

## 3. Test Organization & Naming Conventions

[Content]

---

## 4. Unit Testing Standards

[Content with patterns for Zustand, Zod, hooks]

---

## 5. Component Testing Standards

[Content with React Testing Library patterns]

---

## 6. E2E Testing Standards (Playwright)

[Content with POM, fixtures, mocking, screenshots]

---

## 7. API Route Testing

[Content for Next.js API routes]

---

## 8. [If Applicable] Tauri / Native Testing

[Content for Rust + IPC tests]

---

## 9. Testing AI Features

[Content for mocking LLMs, snapshot testing]

---

## 10. Accessibility Testing

[Content for axe-core, manual checklist]

---

## 11. Performance Testing

[Content for Lighthouse, bundle size]

---

## 12. CI/CD Integration

[Content for test pipeline, parallelization, flaky tests]

---

## 13. Testing Anti-Patterns

[12-15 anti-patterns with examples]

---

## Appendix: Quick Reference

### Test Commands
```bash
npm test               # Run all tests
npm run test:unit      # Unit tests only
npm run test:e2e       # E2E tests
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage
```

### Coverage Reports
- HTML: `coverage/index.html`
- Terminal: `npm run test:coverage`
- CI: Uploaded to Codecov

---

*This testing strategy is a living playbook. Update it as new patterns emerge.*
```

---

## FINAL INSTRUCTION

Generate the complete `testing.md` file in .cursor/setup NOW. Be comprehensive, provide complete code examples, and make it the definitive testing reference for this project.