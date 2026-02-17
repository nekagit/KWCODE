# PROMPT 02: GENERATE ARCHITECTURE.MD

Copy this prompt into Cursor with Opus 4.6 to generate `.cursor/1. project/architecture.md`

**Note:** Adapt directory trees and examples to the actual project (e.g. admin-dashboard-starter: `src/lib/db.ts`, no auth folder until added).

---

You are a Principal Software Architect with 20+ years of experience designing scalable, maintainable systems. You've led architecture for systems at FAANG companies, unicorn startups, and open-source projects with millions of users. You're an expert in Clean Architecture, Domain-Driven Design, SOLID principles, and modern full-stack patterns.

## YOUR TASK

Generate a **comprehensive, production-ready `architecture.md`** file that will serve as the single source of truth for ALL structural, data-flow, integration, and technical decisions in this project.

## PROJECT CONTEXT ANALYSIS

**FIRST, deeply analyze the current project:**

1. **Scan the codebase structure** - Identify:
   - Framework & runtime (Next.js, Vite, Remix, SvelteKit, vanilla Node, etc.)
   - Frontend architecture (Server Components, SPA, SSR, Static)
   - Backend architecture (API routes, serverless functions, BFF, microservices, monolith)
   - Database(s) and ORM/query builder (Prisma, Drizzle, raw SQL, none)
   - State management (Zustand, Redux, Jotai, Context, none)
   - Data fetching (tRPC, REST, GraphQL, direct DB access)
   - Authentication/authorization approach (NextAuth, Supabase, custom, none)
   - File structure philosophy (feature-sliced, domain-driven, flat, MVC-like)

2. **Identify the architectural style** - What pattern(s) does this follow?
   - Layered (presentation → business logic → data access)
   - Clean/Hexagonal (ports & adapters)
   - Modular monolith (feature-based modules)
   - Microservices-adjacent (serverless functions)
   - JAMstack (static + APIs)
   - Full-stack framework conventions (Next.js App Router, Remix loaders/actions)

3. **Map the data flow** - How does data move through the system?
   - Client → Server (API calls, Server Actions, tRPC)
   - Server → Database (ORM, query builder, raw SQL)
   - Client state (local state, global state, URL state, server state cache)
   - Real-time updates (WebSockets, polling, SSE, none)

4. **Identify integration points** - What external systems are involved?
   - Third-party APIs (payment, email, AI, etc.)
   - Native bindings (Tauri, Electron, Capacitor)
   - Cloud services (storage, queues, CDN)
   - Authentication providers (OAuth, SAML)

**OUTPUT this analysis in a brief section at the top of architecture.md as "Architecture Analysis"**

---

## REQUIRED SECTIONS

Generate an architecture.md with the following structure. Be EXHAUSTIVE, SPECIFIC, and OPINIONATED.

### 1. ARCHITECTURE OVERVIEW

**A. Architectural Style**

State the primary architectural pattern(s) used:
- Layered Architecture
- Clean Architecture / Hexagonal
- Modular Monolith
- Feature-Sliced Design
- Domain-Driven Design (DDD)
- Micro-frontends
- Event-Driven Architecture
- CQRS (Command Query Responsibility Segregation)
- Or a hybrid (explain the combination)

**B. High-Level System Diagram**

Provide an ASCII diagram showing:
- Client (Browser)
- Frontend Layer (React, Vue, etc.)
- API Layer (REST, GraphQL, tRPC)
- Business Logic Layer
- Data Access Layer
- Database(s)
- External Services
- Native Shell (if applicable: Tauri, Electron)

Example:
```
┌─────────────────────────────────────────────────────────────┐
│                         BROWSER                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React Components (UI Layer)                │ │
│  │  - Pages, Layouts, Components                           │ │
│  │  - Client State (Zustand, Context)                      │ │
│  └───────────────────┬─────────────────────────────────────┘ │
│                      │ API Calls / Server Actions           │
└──────────────────────┼──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    NEXT.JS SERVER                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            API Routes / Server Actions                  │ │
│  │  - Validation (Zod)                                     │ │
│  │  - Business Logic                                       │ │
│  │  - Data Access Layer                                    │ │
│  └───────────────────┬─────────────────────────────────────┘ │
│                      │                                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              External Integrations                      │ │
│  │  - OpenAI API                                           │ │
│  │  - Email Service                                        │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┼──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    DATA LAYER                                │
│  - PostgreSQL / SQLite / JSON Files                          │
│  - File System Storage                                       │
└──────────────────────────────────────────────────────────────┘
```

**C. Guiding Architectural Principles**

List 5-7 core principles that drive architectural decisions:

1. **[Principle Name]** - [One-sentence explanation]
   - Example: "Single Source of Truth per Domain" - Each data entity has one canonical location
   
2. **[Principle]** - [Explanation]
3. **[Principle]** - [Explanation]
4. **[Principle]** - [Explanation]
5. **[Principle]** - [Explanation]

**D. Architectural Categories**

Tag the architecture with applicable categories:
- [ ] REST API
- [ ] GraphQL
- [ ] tRPC
- [ ] Serverless
- [ ] Monolithic
- [ ] Microservices
- [ ] Event-Driven
- [ ] CQRS
- [ ] Domain-Driven Design
- [ ] Clean Architecture
- [ ] Layered Architecture
- [ ] Modular Architecture
- [ ] Feature-Sliced Design
- [ ] Offline-First
- [ ] Real-Time

---

### 2. DIRECTORY STRUCTURE & MODULE BOUNDARIES

**A. Complete Directory Tree**

Document the full `src/` directory (or equivalent) with purpose annotations:

```
src/
├── app/                          # Next.js App Router pages & API routes
│   ├── (auth)/                  # Auth route group
│   │   ├── login/              # Login page
│   │   └── register/           # Register page
│   ├── (dashboard)/            # Dashboard route group
│   │   ├── layout.tsx          # Dashboard layout
│   │   ├── page.tsx            # Dashboard home
│   │   └── [project]/          # Dynamic project routes
│   ├── api/                    # API routes
│   │   ├── auth/               # Auth endpoints
│   │   ├── projects/           # Project CRUD
│   │   └── webhooks/           # Webhook handlers
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/                  # React components
│   ├── ui/                     # Atomic UI components (shadcn/ui)
│   ├── atoms/                  # Simple, reusable atoms
│   ├── molecules/              # Compound components
│   ├── organisms/              # Complex, feature-rich components
│   └── shared/                 # Shared utility components
├── lib/                        # Utility functions & core logic
│   ├── api/                    # API client helpers
│   ├── auth/                   # Authentication utilities
│   ├── db/                     # Database client & queries
│   ├── utils/                  # General utilities
│   └── validations/            # Zod schemas
├── types/                      # TypeScript type definitions
│   ├── api.ts                  # API request/response types
│   ├── database.ts             # Database model types
│   └── index.ts                # Barrel exports
├── store/                      # Global state management (Zustand)
│   ├── auth-store.ts
│   ├── ui-store.ts
│   └── index.ts
├── hooks/                      # Custom React hooks
│   ├── use-auth.ts
│   ├── use-projects.ts
│   └── index.ts
├── context/                    # React Context providers
│   └── theme-provider.tsx
├── constants/                  # App constants & configuration
│   ├── routes.ts
│   └── config.ts
└── middleware.ts               # Next.js middleware (auth, etc.)
```

**For each major folder, document:**
- Purpose
- What goes here
- What does NOT go here
- Import restrictions

**B. Module Boundaries & Dependency Rules**

Define the dependency graph:

```
UI Layer (components/)
    ↓ CAN import
Hooks Layer (hooks/)
    ↓ CAN import
Business Logic Layer (lib/)
    ↓ CAN import
Types Layer (types/)
    ↓ CAN import
Constants Layer (constants/)

❌ FORBIDDEN:
- types/ importing from components/
- lib/ importing from components/
- hooks/ importing from app/
- Circular dependencies between features
```

**Enforcement:**
- Use ESLint `import/no-restricted-paths` to enforce
- Document exceptions explicitly

**C. Naming Conventions**

**Files:**
- Pages: `kebab-case` (Next.js convention: `my-page/page.tsx`)
- Components: `PascalCase.tsx` (`Button.tsx`, `ProjectCard.tsx`)
- Utilities: `kebab-case.ts` (`format-date.ts`, `calculate-total.ts`)
- Types: `kebab-case.ts` (`user.ts`, `api-response.ts`)
- Constants: `SCREAMING_SNAKE_CASE.ts` or `kebab-case.ts`

**Functions:**
- Components: `PascalCase` (`Button`, `ProjectCard`)
- Hooks: `camelCase` starting with `use` (`useAuth`, `useProjects`)
- Utilities: `camelCase` (`formatDate`, `calculateTotal`)
- API routes: `camelCase` handlers (`GET`, `POST`, etc.)

**Variables:**
- `camelCase` for local variables
- `PascalCase` for React components
- `SCREAMING_SNAKE_CASE` for true constants (`API_BASE_URL`)

**Types:**
- Interfaces: `PascalCase` (`User`, `ProjectData`)
- Type aliases: `PascalCase` (`ApiResponse`, `ProjectStatus`)
- Generics: Single capital letter or descriptive (`T`, `TData`, `TError`)

---

### 3. DATA FLOW & STATE ARCHITECTURE

**A. Data Sources**

List ALL data sources in the application:

1. **Server-Side Data** (fetched from backend)
   - API: REST endpoints (`/api/*`)
   - Server Actions (Next.js `'use server'`)
   - tRPC procedures
   - GraphQL queries

2. **Client-Side Data** (managed in frontend)
   - Global state: Zustand stores
   - React Context: Theme, auth session
   - Local state: `useState`, `useReducer`
   - URL state: Query params, route params

3. **Persistent Data** (survives page reload)
   - Database: PostgreSQL / SQLite / Supabase
   - File system: JSON files, uploads
   - Browser storage: localStorage, sessionStorage, IndexedDB
   - Cookies: Session, preferences

4. **External Data** (third-party APIs)
   - AI APIs (OpenAI, Anthropic)
   - Payment APIs (Stripe)
   - Email APIs (Resend, SendGrid)

**B. State Management Strategy**

Define the state management architecture:

**Global State (Zustand):**
```typescript
// store/auth-store.ts
interface AuthState {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  // Implementation
}))
```

**When to use Zustand:**
- Cross-cutting concerns (auth, theme, notifications)
- Frequently accessed data (current user, app config)
- Data shared across many components (not just parent-child)

**When to use React Context:**
- Theme provider (light/dark mode)
- Rarely changing data (feature flags)
- Provider pattern for dependency injection

**When to use local state:**
- Form data (before submission)
- UI state (open/closed, selected tab)
- Temporary data (search query, filters)

**When to use URL state:**
- Shareable state (filters, pagination, selected item)
- Back button behavior (navigation history)

**C. Data Fetching Strategy**

Define when to use each fetching method:

**Server Components (Next.js):**
```tsx
// app/projects/page.tsx
export default async function ProjectsPage() {
  const projects = await db.project.findMany() // Direct DB access
  return <ProjectList projects={projects} />
}
```

Use for:
- Initial page data
- SEO-critical content
- Data that doesn't change per-user

**Client-Side Fetching:**
```tsx
// components/ProjectList.tsx
'use client'
const { data, isLoading, error } = useSWR('/api/projects', fetcher)
```

Use for:
- User-specific data
- Data that updates frequently
- Paginated/infinite scroll data
- Data after user interaction

**Server Actions (Next.js):**
```tsx
'use server'
export async function createProject(formData: FormData) {
  // Validate, create, revalidate
}
```

Use for:
- Form submissions
- Mutations (create, update, delete)
- Actions that need server-side validation

**D. Caching & Revalidation**

Document the caching strategy:

**Next.js Caching:**
- `fetch()` requests: cached by default, use `cache: 'no-store'` for dynamic
- Server Components: cached per-build, use `revalidate` for ISR
- Client components: use SWR or React Query for cache management

**Cache Invalidation:**
- After mutations: `revalidatePath()` or `revalidateTag()`
- Manual: Zustand store updates
- Automatic: SWR revalidation on focus/reconnect

**E. Optimistic Updates**

If applicable, document the pattern:

```typescript
const { mutate } = useSWRMutation('/api/projects', updateProject)

const handleUpdate = async (data) => {
  // Optimistically update UI
  mutate(async () => {
    await fetch('/api/projects', { method: 'PUT', body: JSON.stringify(data) })
    return data
  }, {
    optimisticData: data,
    rollbackOnError: true,
  })
}
```

---

### 4. API DESIGN & CONVENTIONS

**A. API Endpoint Structure**

Document the RESTful conventions:

```
GET    /api/projects          → List all projects
POST   /api/projects          → Create new project
GET    /api/projects/:id      → Get single project
PUT    /api/projects/:id      → Update project
PATCH  /api/projects/:id      → Partial update
DELETE /api/projects/:id      → Delete project

GET    /api/projects/:id/tasks → List project tasks (nested resource)
```

**B. Request/Response Envelope**

Standard format for all API responses:

**Success Response:**
```typescript
{
  success: true,
  data: T,
  meta?: {
    page: number,
    perPage: number,
    total: number
  }
}
```

**Error Response:**
```typescript
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED' | ...,
    message: 'Human-readable error message',
    details?: Record<string, string[]> // Field-level errors
  }
}
```

**C. HTTP Status Codes**

Standardize status code usage:

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200  | OK | Successful GET, PUT, PATCH |
| 201  | Created | Successful POST |
| 204  | No Content | Successful DELETE |
| 400  | Bad Request | Validation error, malformed request |
| 401  | Unauthorized | Missing/invalid auth token |
| 403  | Forbidden | Authenticated but not authorized |
| 404  | Not Found | Resource doesn't exist |
| 409  | Conflict | Duplicate resource, constraint violation |
| 422  | Unprocessable | Semantic validation error |
| 429  | Too Many Requests | Rate limit exceeded |
| 500  | Internal Server Error | Unexpected server error |
| 503  | Service Unavailable | Dependency down (DB, external API) |

**D. Validation (Zod)**

All API inputs must be validated:

```typescript
// lib/validations/project.ts
import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  status: z.enum(['active', 'archived']).default('active'),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
```

**API Route Pattern:**
```typescript
// app/api/projects/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  
  // Validate
  const result = createProjectSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', details: result.error.flatten() } },
      { status: 400 }
    )
  }
  
  // Process
  const project = await createProject(result.data)
  
  return NextResponse.json({ success: true, data: project }, { status: 201 })
}
```

**E. Error Handling Conventions**

**Server-Side:**
- Always wrap async operations in try-catch
- Log errors with structured logging
- Return safe error messages (don't leak internals)
- Use custom error classes for different error types

```typescript
class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`)
    this.name = 'NotFoundError'
  }
}
```

**Client-Side:**
- Use error boundaries for component-level errors
- Toast notifications for user-facing errors
- Retry logic for transient failures
- Sentry/logging for production errors

---

### 5. [IF APPLICABLE] NATIVE INTEGRATION ARCHITECTURE

*Only include this section if the project has native bindings (Tauri, Electron, Capacitor, React Native)*

**A. Dual-Backend Strategy**

Document how the app works in both browser and native modes:

```typescript
// lib/utils/env.ts
export const isTauri = () => {
  return typeof window !== 'undefined' && '__TAURI__' in window
}

// Data access abstraction
export async function getProjects() {
  if (isTauri()) {
    return invoke('get_projects') // Tauri command
  } else {
    return fetch('/api/projects').then(r => r.json()) // Browser API
  }
}
```

**B. Tauri Commands** (or Electron IPC patterns)

List all native commands:

```rust
// src-tauri/src/main.rs
#[tauri::command]
fn get_projects(db: State<Database>) -> Result<Vec<Project>, String> {
  // Implementation
}

#[tauri::command]
fn run_shell_script(script_path: String) -> Result<String, String> {
  // Implementation
}
```

Frontend invocation:
```typescript
import { invoke } from '@tauri-apps/api/tauri'

const projects = await invoke<Project[]>('get_projects')
```

**C. Event System**

If using event-based communication:

```rust
// Rust: emit event
window.emit("project-created", payload)?;
```

```typescript
// Frontend: listen
import { listen } from '@tauri-apps/api/event'

listen<ProjectPayload>('project-created', (event) => {
  // Handle event
})
```

**D. Capabilities & Permissions**

Document the Tauri capabilities configured:

```json
// src-tauri/capabilities/default.json
{
  "permissions": [
    "path:default",
    "fs:read-all",
    "fs:write-all",
    "shell:allow-execute"
  ]
}
```

**E. Anti-Patterns**

❌ **DON'T:**
- Mix Tauri and API calls in the same flow (choose one path)
- Use synchronous IPC (blocks UI thread)
- Access file system from frontend in browser mode (will crash)

✅ **DO:**
- Abstract platform differences behind a common interface
- Use async IPC exclusively
- Feature-detect before using native APIs

---

### 6. COMPONENT ARCHITECTURE

**A. Atomic Design Hierarchy**

Define the component tier system:

**`ui/` (Atoms)** - Smallest, unstyled building blocks
- `button.tsx`, `input.tsx`, `label.tsx`, `card.tsx`
- Headless UI components (Radix UI primitives)
- No business logic, just UI primitives
- Styling via Tailwind + CVA (class-variance-authority)

**`atoms/` (Atoms with Context)** - Simple, single-purpose components
- `StatusBadge`, `Avatar`, `IconButton`, `Tooltip`
- Can use `ui/` components
- Single responsibility, highly reusable
- Example: `<StatusBadge status="active" />`

**`molecules/` (Compound Components)** - Combinations of atoms
- `FormField` (label + input + error message)
- `SearchBar` (input + icon + button)
- `CardHeader` (title + subtitle + actions)
- 2-5 atoms combined, one clear purpose

**`organisms/` (Feature-Rich Components)** - Complex, self-contained features
- `ProjectCard` (entire card with all interactions)
- `TaskTable` (table + pagination + sorting + filtering)
- `UserProfileHeader` (avatar + name + stats + actions)
- Can include business logic, API calls, local state

**`shared/` (Cross-Cutting Components)** - Utilities used everywhere
- `ErrorBoundary`, `LoadingSpinner`, `EmptyState`, `Providers`
- Not purely UI, more functional

**B. Component File Pattern**

Single-export pattern:

```tsx
// components/organisms/ProjectCard.tsx
interface ProjectCardProps {
  project: Project
  onDelete: (id: string) => void
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  // Implementation
}

// No default export, named export only
```

**C. Client vs. Server Components**

Define when to use `'use client'`:

**Server Components (default in Next.js):**
- Data fetching components
- Static content
- No interactivity (no event handlers)
- SEO-important content

**Client Components (`'use client'`):**
- Any component with `useState`, `useEffect`, event handlers
- Any component using Zustand, Context (except ThemeProvider)
- Third-party libraries that require browser APIs
- Interactive UI (buttons with onClick, forms with onChange)

**Rule:** Keep `'use client'` as low in the tree as possible.

**D. Props Pattern**

**Prefer explicit props over spreading:**
```tsx
// ✅ GOOD
<Button variant="primary" size="lg" onClick={handleClick} />

// ❌ BAD
<Button {...buttonProps} />
```

**Use discriminated unions for variants:**
```tsx
type ButtonProps = 
  | { variant: 'primary', size: 'sm' | 'lg', onClick: () => void }
  | { variant: 'link', href: string }
```

**E. Component Composition Patterns**

**Compound Components:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Project Name</CardTitle>
  </CardHeader>
  <CardContent>
    ...
  </CardContent>
</Card>
```

**Render Props (when needed):**
```tsx
<DataTable
  data={projects}
  renderRow={(project) => <ProjectRow project={project} />}
/>
```

**Slots (children pattern):**
```tsx
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>Title</DialogHeader>
    <DialogBody>Content</DialogBody>
  </DialogContent>
</Dialog>
```

---

### 7. TYPE SYSTEM & VALIDATION

**A. Type Organization**

```
types/
├── index.ts              # Barrel exports
├── database.ts           # Database model types (from Prisma, Drizzle)
├── api.ts                # API request/response types
├── ui.ts                 # UI-specific types (table columns, form fields)
└── utils.ts              # Utility types (generic helpers)
```

**B. Zod ↔ TypeScript Derivation**

Always derive TypeScript types from Zod schemas (single source of truth):

```typescript
// lib/validations/project.ts
import { z } from 'zod'

export const projectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  status: z.enum(['active', 'archived']),
  createdAt: z.date(),
})

export type Project = z.infer<typeof projectSchema>
```

**C. Shared vs. Domain-Specific Types**

**Shared Types (types/index.ts):**
```typescript
export type ApiResponse<T> = {
  success: true
  data: T
} | {
  success: false
  error: ApiError
}

export type PaginatedList<T> = {
  items: T[]
  page: number
  perPage: number
  total: number
}

export type EntityId = string // UUID or custom type
```

**Domain Types (types/project.ts):**
```typescript
export interface Project {
  id: EntityId
  name: string
  description: string | null
  status: ProjectStatus
  createdAt: Date
  updatedAt: Date
}

export type ProjectStatus = 'active' | 'archived' | 'deleted'

export type CreateProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateProjectInput = Partial<CreateProjectInput>
```

**D. Generic Patterns**

```typescript
// types/utils.ts
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type ID<T = string> = T

export type AsyncResult<T, E = Error> = 
  | { ok: true; data: T }
  | { ok: false; error: E }

export type NonEmptyArray<T> = [T, ...T[]]
```

---

### 8. ERROR HANDLING & RESILIENCE

**A. Error Boundary Hierarchy**

```tsx
// app/layout.tsx - Global error boundary
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary fallback={<GlobalErrorPage />}>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}

// app/dashboard/layout.tsx - Route-level boundary
export default function DashboardLayout({ children }) {
  return (
    <ErrorBoundary fallback={<DashboardErrorPage />}>
      {children}
    </ErrorBoundary>
  )
}

// components/organisms/ProjectCard.tsx - Component-level boundary
export function ProjectCard({ project }) {
  return (
    <ErrorBoundary fallback={<div>Failed to load project</div>}>
      <ProjectCardContent project={project} />
    </ErrorBoundary>
  )
}
```

**B. Error Propagation Strategy**

**API Errors → UI:**
```typescript
// API route throws
throw new NotFoundError('Project', id)

// Caught by global handler
catch (error) {
  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: error.message } }, { status: 404 })
  }
}

// Client receives
const response = await fetch('/api/projects/123')
if (!response.ok) {
  const { error } = await response.json()
  toast.error(error.message) // User sees: "Project not found"
}
```

**C. Retry & Fallback Strategies**

**Transient Errors (Retry):**
```typescript
async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url)
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
    }
  }
}
```

**Graceful Degradation:**
```tsx
function ProjectList() {
  const { data, error } = useSWR('/api/projects')
  
  if (error) return <div>Failed to load. <button onClick={refetch}>Retry</button></div>
  if (!data) return <LoadingSpinner />
  if (data.length === 0) return <EmptyState />
  
  return <div>{data.map(project => <ProjectCard key={project.id} project={project} />)}</div>
}
```

**D. Logging & Monitoring**

**Development:**
```typescript
console.error('[API Error]', error)
```

**Production:**
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.captureException(error, {
  tags: { feature: 'projects' },
  extra: { userId, projectId },
})
```

---

### 9. PERFORMANCE & OPTIMIZATION

**A. Bundle Splitting Strategy**

**Route-Based Code Splitting (Next.js):**
- Automatic per-page bundles
- Dynamic imports for heavy components:

```tsx
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false, // Disable SSR if not needed
})
```

**Component Lazy Loading:**
```tsx
const AdminPanel = lazy(() => import('./AdminPanel'))

<Suspense fallback={<LoadingSpinner />}>
  {isAdmin && <AdminPanel />}
</Suspense>
```

**B. Memoization Conventions**

**React.memo for Expensive Components:**
```tsx
export const ProjectCard = React.memo(({ project }) => {
  // Expensive rendering
}, (prevProps, nextProps) => {
  return prevProps.project.id === nextProps.project.id // Custom comparison
})
```

**useMemo for Expensive Computations:**
```tsx
const sortedProjects = useMemo(() => {
  return projects.sort((a, b) => a.name.localeCompare(b.name))
}, [projects])
```

**useCallback for Stable References:**
```tsx
const handleDelete = useCallback((id: string) => {
  deleteProject(id)
}, [deleteProject])

<ProjectCard onDelete={handleDelete} /> // Prevents re-render
```

**C. Image Optimization**

```tsx
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={630}
  priority // Above-the-fold images
  placeholder="blur" // Low-quality placeholder
/>
```

**D. Database Query Optimization**

- Use database indexes on frequently queried columns
- Use `select` to fetch only needed fields (avoid `SELECT *`)
- Use pagination for large lists (`LIMIT` / `OFFSET` or cursor-based)
- Use database-level filtering (don't fetch everything then filter in JS)

```typescript
// ❌ BAD
const allProjects = await db.project.findMany()
const activeProjects = allProjects.filter(p => p.status === 'active')

// ✅ GOOD
const activeProjects = await db.project.findMany({
  where: { status: 'active' },
  select: { id: true, name: true, status: true },
})
```

---

### 10. SECURITY CONSIDERATIONS

**A. Input Sanitization**

- **ALWAYS validate with Zod** on the server (never trust client)
- **Sanitize HTML** if rendering user content (use DOMPurify)
- **Parameterized queries** (ORM handles this, never string concatenation)

**B. Authentication & Authorization**

```typescript
// middleware.ts - Protect routes
export function middleware(request: NextRequest) {
  const session = await getSession(request)
  
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect('/login')
  }
  
  return NextResponse.next()
}
```

**API Route Protection:**
```typescript
export async function GET(request: Request) {
  const session = await getServerSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Check permissions
  if (!session.user.roles.includes('admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // Proceed
}
```

**C. Content Security Policy (CSP)**

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
]
```

**D. Environment Variables**

- **NEVER expose secrets to client** (no `NEXT_PUBLIC_` for API keys)
- **Use `.env.local`** for local secrets (gitignored)
- **Validate env vars on startup** (use Zod or t3-env)

```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
```

---

### 11. SCALABILITY & EXTENSION PATTERNS

**A. Adding a New Data Entity**

Step-by-step guide:

1. **Define Type & Schema**
   ```typescript
   // types/task.ts
   export interface Task { ... }
   
   // lib/validations/task.ts
   export const taskSchema = z.object({ ... })
   ```

2. **Create Database Migration** (if using DB)
   ```bash
   npx prisma migrate dev --name add_task_model
   ```

3. **Add API Routes**
   ```typescript
   // app/api/tasks/route.ts
   export async function GET() { ... }
   export async function POST() { ... }
   ```

4. **Create UI Components**
   ```tsx
   // components/organisms/TaskCard.tsx
   export function TaskCard({ task }) { ... }
   ```

5. **Add to Navigation**
   ```tsx
   // components/Sidebar.tsx
   <NavLink href="/tasks">Tasks</NavLink>
   ```

**B. Adding a New Page**

1. Create route folder: `app/my-feature/page.tsx`
2. Create layout if needed: `app/my-feature/layout.tsx`
3. Add page component with data fetching
4. Update navigation/sidebar
5. Add to sitemap/robots.txt if public

**C. Adding a New AI Generation Endpoint**

1. **Create Prompt Template**
   ```typescript
   // lib/prompts/generate-task.ts
   export const generateTaskPrompt = (input: string) => `Generate a task from: ${input}`
   ```

2. **Create API Route**
   ```typescript
   // app/api/generate-task/route.ts
   export async function POST(request: Request) {
     const { input } = await request.json()
     const prompt = generateTaskPrompt(input)
     const completion = await openai.chat.completions.create({ ... })
     return NextResponse.json({ data: completion.choices[0].message.content })
   }
   ```

3. **Add UI Trigger**
   ```tsx
   async function handleGenerate() {
     const response = await fetch('/api/generate-task', { ... })
     const { data } = await response.json()
     setGeneratedTask(data)
   }
   ```

**D. Adding a New Zustand Store Slice**

```typescript
// store/feature-store.ts
interface FeatureState {
  items: Item[]
  addItem: (item: Item) => void
}

export const useFeatureStore = create<FeatureState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}))
```

**Usage with Subscriptions:**
```tsx
const items = useFeatureStore((state) => state.items)
const addItem = useFeatureStore((state) => state.addItem)
```

---

### 12. ANTI-PATTERNS (FORBIDDEN)

List 12-15 anti-patterns with rationale:

#### 1. Business Logic in Page Components
❌ **BAD**: `app/projects/page.tsx` contains complex data transformations
✅ **GOOD**: Extract to `lib/projects/transform-project-data.ts`

#### 2. Global Mutable State Outside Stores
❌ **BAD**: `let currentUser: User | null = null` in a module
✅ **GOOD**: Use Zustand store or Context

#### 3. Fetch in useEffect Without Cleanup
❌ **BAD**:
```tsx
useEffect(() => {
  fetch('/api/data').then(data => setState(data))
}, [])
```
✅ **GOOD**: Use SWR, React Query, or add AbortController cleanup

#### 4. Prop Drilling Beyond 3 Levels
❌ **BAD**: Passing `user` through 5 component layers
✅ **GOOD**: Use Context or Zustand

#### 5. Using `any` Type
❌ **BAD**: `const data: any = await fetch(...)`
✅ **GOOD**: Define proper types or use `unknown` + type guards

#### 6. Mixing Concerns in Components
❌ **BAD**: A component that fetches data, transforms it, renders UI, and handles routing
✅ **GOOD**: Separate: data hook + transform function + presentational component

#### 7. Not Validating API Inputs
❌ **BAD**: Directly using `request.body` in API routes
✅ **GOOD**: Validate with Zod schema first

#### 8. Importing Server Code in Client Components
❌ **BAD**: `import { db } from '@/lib/db'` in a `'use client'` file
✅ **GOOD**: Fetch via API route or Server Action

#### 9. Hardcoded URLs/Config
❌ **BAD**: `fetch('https://api.example.com/...')`
✅ **GOOD**: Use environment variables (`env.API_URL`)

#### 10. No Error Handling
❌ **BAD**: `await fetch(...)` with no try-catch or `.catch()`
✅ **GOOD**: Wrap in try-catch, show error UI

#### 11. Mutating Props
❌ **BAD**: `props.data.push(newItem)`
✅ **GOOD**: Immutable updates (`[...data, newItem]`)

#### 12. Over-Abstracting Prematurely
❌ **BAD**: Creating a generic `useFetch` hook for one use case
✅ **GOOD**: Use SWR/React Query, only abstract when pattern repeats 3+ times

---

### 13. ARCHITECTURAL DECISION RECORDS (ADRs)

Provide a summary table of key decisions:

| Decision | Date | Rationale | Alternatives Considered |
|----------|------|-----------|-------------------------|
| **Why Next.js over Vite?** | 2024-01 | Need SSR + API routes in one framework | Vite (no SSR), Remix (less mature ecosystem) |
| **Why Zustand over Redux?** | 2024-01 | Simpler API, less boilerplate, better DX | Redux (too verbose), Context (performance issues) |
| **Why Tailwind over CSS-in-JS?** | 2024-01 | Better performance, no runtime, huge ecosystem | styled-components (runtime cost), CSS Modules (verbose) |
| **Why Zod for Validation?** | 2024-02 | Type-safe, composable, great DX | Yup (no TS inference), Joi (Node-focused) |
| **Why shadcn/ui over MUI?** | 2024-02 | Copy-paste control, Tailwind integration | MUI (too opinionated), Chakra (different design lang) |

---

## FORMATTING REQUIREMENTS

1. Use markdown headers (##, ###, ####)
2. Use tables for comparisons, decision records, matrices
3. Use code blocks with language tags (typescript, tsx, bash, json, rust)
4. Use blockquotes for warnings: `> ⚠️ Critical: ...`
5. Use ASCII diagrams for system architecture
6. Provide complete, runnable code examples (no pseudo-code)
7. Cross-reference sections where relevant
8. Target 600-1000 lines (comprehensive, reference-grade)

---

## FINAL OUTPUT STRUCTURE

```markdown
# Architecture — [Project Name]

**Version**: 1.0  
**Last Updated**: [Date]  
**Author**: Principal Software Architect (AI)

---

## Architecture Analysis

[Brief analysis of current project architecture]

---

## 1. Architecture Overview

[Content]

---

## 2. Directory Structure & Module Boundaries

[Content]

---

[Continue through all 13 sections...]

---

## Appendix: Quick Reference

### Common Patterns Cheat Sheet
[Quick lookup for common patterns]

### Import Path Aliases
[Configured path aliases]

---

*This architecture document is a living reference. Update it as the system evolves.*
```

---

## FINAL INSTRUCTION

Generate the complete `architecture.md` in .cursor/1. project NOW. Be exhaustive, specific, and opinionated. Reference the actual codebase where possible. Make it the definitive architectural reference for this project.