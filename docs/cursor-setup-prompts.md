# Cursor Setup Prompts — KWCode

> **Purpose**: Copy-paste each prompt below into a new Cursor chat (with Opus 4.6) to generate the corresponding `.cursor/setup/*.md` file.
> Each prompt is self-contained and references the project context it needs.
>
> **Project**: KWCode — AI-powered development workflow & prompt orchestration app
> **Stack**: Next.js 16 (App Router) · Tailwind CSS 3 · shadcn/ui · Radix UI · Zustand · Tauri v2 · TypeScript · Lucide Icons

---

## Table of Contents

1. [Prompt 1 — `design.md`](#prompt-1--designmd)
2. [Prompt 2 — `architecture.md`](#prompt-2--architecturemd)
3. [Prompt 3 — `ideas.md`](#prompt-3--ideasmd)
4. [Prompt 4 — `documentation.md`](#prompt-4--documentationmd)
5. [Prompt 5 — `testing.md`](#prompt-5--testingmd)

---

## Prompt 1 — `design.md`

> **Output file**: `.cursor/setup/design.md`

```markdown
You are a world-class UI/UX Design Systems Architect. Your task is to produce the definitive `design.md` file that will live inside `.cursor/setup/design.md` and serve as the single source of truth for every visual and interaction decision in this project.

## Project Context

This is **KWCode**, an AI-powered developer workflow desktop application built with:

- **Framework**: Next.js 16 (App Router) with Tauri v2 native shell
- **Styling**: Tailwind CSS 3.4 with CSS custom properties (HSL-based tokens in `globals.css`)
- **Component Library**: shadcn/ui (CVA + `cn()` utility) with Radix UI primitives
- **Icons**: Lucide React
- **State**: Zustand (global run state) + React local state
- **Template**: Dashboard / control panel — sidebar + content layout, tabbed views, Kanban boards, CRUD dialogs, markdown preview panels

The app manages AI prompts, project tickets, features, Kanban boards, design documents, architecture specs, and automated prompt-running workflows. It has light/dark mode + themed variants (ocean, forest, warm, red).

## Requirements for the `design.md` output

Write a comprehensive, actionable design system document covering ALL of the following sections. Be exhaustive, opinionated, and specific — never vague. Use the best modern design principles from 2025-2026 (Apple HIG, Material 3, Linear, Vercel, Raycast aesthetic).

### 1. Design Philosophy & Principles
- State 5-7 core design principles (e.g., "Clarity over decoration", "Progressive disclosure", "Consistent density")
- For each principle, give a one-sentence rationale and one concrete example of how it applies to this app's UI

### 2. Color System
- Define the complete semantic token system: `--background`, `--foreground`, `--card`, `--card-foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--ring`, `--radius`, `--success`, `--warning`, `--info`
- Provide HSL values for **light mode** and **dark mode** defaults
- Document the theme variants (ocean, forest, warm, red) — how they override tokens
- State contrast ratio requirements (WCAG 2.1 AA minimum)
- Define a curated palette for data visualization (charts, status indicators, Kanban columns) — at least 8 distinguishable colors

### 3. Typography
- Recommend a primary font stack (prefer Inter or Geist Sans from Google Fonts / Vercel) with system fallbacks
- Recommend a monospace font for code blocks / terminal output (Geist Mono, JetBrains Mono, or Fira Code)
- Define a full type scale: `xs` through `4xl` with exact `font-size` / `line-height` / `letter-spacing` / `font-weight` mappings
- Define heading hierarchy rules (`h1`–`h4`) with when to use each
- Define text color hierarchy: primary text, secondary text, muted/placeholder text, disabled text, link text, destructive text

### 4. Spacing & Layout
- Define the spacing scale (4px base unit: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24)
- Document the app shell layout spec: sidebar width, main content padding, max content width
- Define card padding rules, section spacing rules, and form field spacing rules
- Define responsive breakpoints and how the layout adapts (mobile → tablet → desktop → ultrawide)
- Sidebar behavior: fixed, collapsible, or hidden at each breakpoint

### 5. Component Design Tokens & Patterns
For each of these component categories, define the visual spec (use Tailwind classes):

- **Cards**: default, hover, active, selected, disabled states; border radius, shadow levels, background
- **Buttons**: primary, secondary, outline, ghost, destructive, link — sizes (sm, default, lg) — icon-only variant
- **Inputs**: default, focus, error, disabled; border, ring, placeholder color
- **Badges / Pills**: status colors (success, warning, error, info, neutral); size variants
- **Dialogs / Sheets**: overlay opacity, content width, animation (entry/exit)
- **Tabs**: active indicator style, spacing, border treatment
- **Accordion**: chevron animation, border style, nested depth limits
- **Tables**: header background, row hover, row striping, cell padding
- **Kanban Columns**: column header style, card gap, drag-over state, empty state
- **Toast / Sonner**: positioning, type colors (success, error, info, warning), duration defaults

### 6. Iconography
- Icon size scale: `xs` (12px), `sm` (14px), `default` (16px), `md` (18px), `lg` (20px), `xl` (24px)
- Stroke width convention (default 2, thin 1.5)
- When to use icons alone vs. icon + label
- Lucide icon naming conventions for consistency

### 7. Motion & Animation
- Define easing curves: `ease-default`, `ease-in`, `ease-out`, `ease-spring`
- Define duration scale: `instant` (0ms), `fast` (100ms), `normal` (200ms), `slow` (300ms), `deliberate` (500ms)
- State which interactions get animation (hover, focus, mount/unmount, drag, collapse/expand, page transition)
- Tailwind transition classes to use for each scenario
- Micro-interaction specs: button press scale, card hover lift, sidebar collapse, dialog entry, toast slide

### 8. Dark Mode & Theme Strategy
- How the `data-theme` attribute system works
- Rules for ensuring all custom components respect theme tokens
- Testing checklist: what to verify when adding a new component in both light and dark mode
- Anti-patterns: hardcoded colors, opacity hacks that break in dark mode, unreadable text scenarios

### 9. Accessibility Guidelines
- Minimum touch target: 44×44px for interactive elements
- Focus ring style: `ring-2 ring-ring ring-offset-2`
- Keyboard navigation order expectations
- Screen reader requirements: all interactive elements need accessible labels
- Color-only indicators must always have a secondary signal (icon, text, pattern)

### 10. Design Anti-Patterns (Avoid These)
- List 8-10 specific anti-patterns with ❌/✅ examples
- Examples: inconsistent border radius, mixing shadow depths, orphan text styles, unlabeled icon buttons, etc.

## Formatting Rules
- Use markdown headers, tables, and code blocks (Tailwind classes or CSS)
- Every section must have concrete, copy-paste-ready values — no "choose a nice color"
- Reference `globals.css` custom properties by name where applicable
- Keep the document under 600 lines but no fewer than 300 lines
- Start with a YAML-like metadata block: `# Design System — KWCode` followed by version and last-updated date
```

---

## Prompt 2 — `architecture.md`

> **Output file**: `.cursor/setup/architecture.md`

```markdown
You are a principal-level software architect specializing in modern full-stack TypeScript applications. Your task is to produce the definitive `architecture.md` file for `.cursor/setup/architecture.md` — the single source of truth for every structural, data-flow, and integration decision in this project.

## Project Context

**KWCode** is an AI-powered developer workflow orchestration app:

- **Frontend**: Next.js 16 (App Router), React 18, TypeScript 5.7
- **Styling**: Tailwind CSS 3.4, shadcn/ui, Radix UI primitives
- **State Management**: Zustand (run store) + React state
- **Native Shell**: Tauri v2 (Rust backend, SQLite, shell script spawning)
- **Data Layer (Browser)**: Next.js API routes reading/writing `data/*.json`
- **Data Layer (Tauri)**: Rust `invoke()` commands → SQLite DB + file system
- **AI Integration**: OpenAI API via `openai` npm package, proxied through Next.js API routes
- **Testing**: Playwright E2E
- **Build**: Next.js Webpack, Tauri bundler
- **Icons**: Lucide React
- **Validation**: Zod schemas

The app manages: projects, prompts, tickets (Kanban), features, design docs, architecture specs, ideas, and automated "prompt run" workflows that iterate over projects and execute AI prompts.

## Requirements for the `architecture.md` output

Produce a comprehensive, opinionated architecture document following best practices from 2025-2026 (Domain-Driven Design where appropriate, Clean Architecture principles, SOLID, KISS, DRY). Cover ALL of the following:

### 1. Architecture Overview
- Name the architectural style(s) used: layered, modular-monolith, feature-sliced, hexagonal, etc.
- Provide a high-level ASCII diagram showing: Browser → Next.js → API Routes → Data Layer, and separately Browser → Tauri IPC → Rust Backend → SQLite/FS
- State the guiding architectural principles (max 7): e.g., "Single source of truth per domain", "Environment-agnostic UI layer", "Colocation over separation"
- List the categories the architecture falls into: `rest`, `dry`, `kiss`, `solid`, `modular`, `offline-first`

### 2. Directory Structure & Module Boundaries
- Document the full `src/` directory tree with purpose annotations for every folder
- Define clear module boundaries: what imports what, what is forbidden
- Define the dependency rule: UI → Lib → Types (never reverse)
- State the naming conventions: files, components, hooks, types, API routes, stores

### 3. Data Flow & State Architecture
- Define the 3 data sources: API routes (browser), Tauri invoke (native), local/session storage
- Document the Zustand store architecture: which stores exist, what they own, subscription patterns
- Define the data fetching strategy: when to use RSC, when to use client-side fetch, when to use Zustand hydration
- State how optimistic updates work (if applicable)
- Define the caching strategy: revalidation, SWR-like patterns, or manual invalidation

### 4. API Design & Conventions
- Document the REST API convention: `GET/POST /api/data`, `GET/POST/PUT/DELETE /api/data/{resource}/[id]`
- Document the AI generation API convention: `POST /api/generate-{resource}`
- Define request/response envelope format (success, error, pagination)
- State error handling conventions: HTTP status codes, error body shape, client-side error boundaries
- Define Zod validation patterns for request bodies

### 5. Tauri Integration Architecture
- Document the dual-backend strategy: `isTauri()` branching
- List all Tauri commands and their Rust function signatures (or the pattern to add new ones)
- Define the event system: how Tauri events stream to the frontend
- State the capability/permission model in `tauri.conf.json`
- Anti-patterns: mixing Tauri and API in same flow, synchronous IPC blocking UI

### 6. Component Architecture
- Define the atomic design hierarchy: `ui/` (atoms) → `atoms/` → `molecules/` → `organisms/` → `shared/`
- State when a component belongs in each tier
- Define the component file pattern: single-export, co-located types, co-located styles if needed
- Document the `'use client'` directive strategy: when to use, when RSC is preferred
- State prop drilling limits and when to use context vs. store

### 7. Type System & Validation
- Document the `src/types/` structure: one file per domain entity
- State the Zod ↔ TypeScript type derivation pattern (`z.infer<typeof Schema>`)
- Define shared vs. API-only vs. client-only types
- State generic patterns used (e.g., `ApiResponse<T>`, `PaginatedList<T>`)

### 8. Error Handling & Resilience
- Define the error boundary hierarchy: global → route → component level
- State how API errors propagate to the UI (toast, inline, error page)
- Define retry and fallback strategies
- Define logging conventions (console levels, structured logging for Tauri)

### 9. Performance & Optimization
- State bundle splitting strategy: dynamic imports, route-based code splitting
- Define image/asset optimization approach
- State memoization conventions: `React.memo`, `useMemo`, `useCallback` usage rules
- Define lazy loading patterns for heavy components

### 10. Security Considerations
- State the input sanitization strategy (Zod everywhere)
- Define the CSP (Content Security Policy) approach
- State how API keys are managed (`.env`, server-side only, never exposed to client)
- Define Tauri security: capabilities, allowed commands, IPC validation

### 11. Scalability & Extension Patterns
- **Adding a new data entity**: step-by-step (type → API route → Tauri command → UI)
- **Adding a new page**: step-by-step (route folder → layout → components → navigation entry)
- **Adding a new AI generation endpoint**: step-by-step (prompt template → API route → UI trigger)
- **Adding a new Zustand store slice**: step-by-step plus subscription pattern

### 12. Anti-Patterns (Forbidden)
- List 10+ anti-patterns with brief rationale
- Include: business logic in page components, global mutable state outside stores, fetch in useEffect without cleanup, prop drilling beyond 3 levels, any-type usage, mixing Tauri/API without env checks

### 13. Decision Records (ADR Summary)
- Provide a table of key architectural decisions: decision, date, rationale, alternatives considered
- Examples: "Why Next.js over Vite?", "Why Zustand over Redux?", "Why Tauri over Electron?"

## Formatting Rules
- Use markdown with clear headers, tables, ASCII diagrams, and code blocks
- Provide concrete TypeScript/Rust snippets for patterns (keep short — 5-15 lines each)
- Target 400-700 lines
- Start with `# Architecture — KWCode` followed by version and last-updated
```

---

## Prompt 3 — `ideas.md`

> **Output file**: `.cursor/setup/ideas.md`

```markdown
You are a visionary AI product strategist and senior developer who specializes in developer tools, AI-augmented workflows, and cutting-edge UX. Your task is to produce the `ideas.md` file for `.cursor/setup/ideas.md` — a living document of prioritized ideas, innovations, and R&D explorations for this project.

## Project Context

**KWCode** is a desktop + web AI-powered developer workflow tool that:

- Manages projects, prompts, tickets (Kanban), features, design docs, architecture specs
- Runs automated AI prompt workflows across multiple projects (prompt orchestration)
- Has a `.cursor` folder management system with agents (frontend-dev, backend-dev, devops, QA, solution-architect, requirements-engineer)
- Built with: Next.js 16, Tauri v2, Zustand, shadcn/ui, Tailwind CSS, OpenAI API
- Supports light/dark/themed modes, Kanban boards, markdown preview, file trees
- Has a "Run" system that executes shell scripts, streams logs, tracks timing

The app's mission is to be the **ultimate AI-powered development cockpit** — where a developer or team manages their entire workflow from ideation to deployment, with AI assisting at every stage.

## Requirements for the `ideas.md` output

Produce a structured, inspiring, and technically feasible ideas document. Organize into the following sections:

### 1. Vision Statement
- A 3-5 sentence north-star vision for what KWCode becomes in 12-18 months
- The key differentiator vs. existing tools (Cursor, Windsurf, Copilot Workspace, Bolt, etc.)

### 2. Tier 1 — High-Impact, Near-Term Ideas (Next 1-3 Months)
List 8-12 ideas. For each idea:
- **Title**: Clear, catchy name
- **Problem**: What user pain does this solve?
- **Solution**: Concise description of the feature (3-5 sentences)
- **AI Integration**: How does AI enhance this? (specific model, prompt strategy, agent pattern)
- **Effort**: S / M / L estimate
- **Impact**: 🔥🔥🔥 (high) to 🔥 (low)
- **Dependencies**: What needs to exist first?

Suggested idea categories to explore:
- Intelligent prompt chaining (multi-step AI workflows with context passing)
- Real-time collaboration features or session sharing
- Smart ticket generation from code diffs or commit messages
- AI-powered code review agent within the app
- Template marketplace / community prompt sharing
- Voice-to-ticket / voice-to-prompt integration
- Auto-categorization and priority scoring of tickets
- AI-suggested architecture improvements based on codebase analysis
- One-click project scaffolding with best-practice setup files
- Git integration: branch-per-feature automation, PR generation

### 3. Tier 2 — Medium-Term Innovation (3-6 Months)
List 6-8 ideas. Same format as Tier 1 but more ambitious:
- Multi-agent orchestration (agents collaborating: architect → frontend → backend → QA)
- Knowledge graph of project decisions (connecting ADRs, tickets, features, code)
- Predictive analytics: estimate time-to-completion, identify bottleneck features
- Plugin/extension system for custom agents and workflows
- IDE integration (VS Code extension, JetBrains plugin) that syncs with KWCode
- AI-powered retrospective: analyze completed sprints and suggest process improvements
- Natural language project querying ("Show me all tickets that touch authentication")
- Autonomous background agent: continuously runs, suggests improvements, opens PRs

### 4. Tier 3 — Moonshot / R&D Explorations (6-12 Months)
List 4-6 visionary ideas:
- Self-improving codebase: AI agent that refactors, optimizes, and documents autonomously
- Live collaborative AI pairing (real-time shared session with AI)
- Cross-project intelligence (learnings from one project inform another)
- Visual programming / flow-based prompt authoring
- Deployment pipeline integration (push to production from KWCode)
- AI-generated test suites from feature specs

### 5. Technical R&D Explorations
List 4-6 technical deep-dives:
- **Local LLM integration**: Running Ollama/llama.cpp models via Tauri for offline AI
- **WebSocket streaming**: Real-time token streaming for AI responses
- **Vector embeddings**: Semantic search over project knowledge base
- **CRDT-based collaboration**: Conflict-free real-time editing of shared project data
- **Wasm plugins**: User-extensible transforms and validators running in browser sandbox
- **MCP (Model Context Protocol)**: Integrating MCP servers for richer AI tool use

### 6. UX Innovation Ideas
List 5-7 UX-specific innovations:
- Command palette (⌘K) with AI-powered fuzzy search across all entities
- Spatial canvas view: drag projects, features, and tickets onto an infinite canvas
- Timeline view: chronological view of all project activity
- Focus mode: hide everything except current task context
- AI chat sidebar: persistent chat that understands full project context
- Customizable dashboard widgets (drag-and-drop widget layout)
- Gamification: streaks, milestones, productivity scores

### 7. Competitive Analysis Matrix
A comparison table: KWCode vs. Cursor vs. Copilot Workspace vs. Bolt vs. Windsurf vs. Linear
Columns: Feature, KWCode (current), KWCode (planned), Cursor, Copilot Workspace, Linear

### 8. Prioritization Framework
- Describe the scoring model used: Impact × Feasibility × Strategic Alignment
- Provide a ranked backlog of the top 10 ideas across all tiers

## Formatting Rules
- Use emoji for visual scanning (🚀 📊 🧠 ⚡ 🎨 🔧 🌙)
- Use tables for comparison matrices
- Keep each idea description concise but inspiring
- Target 400-600 lines
- Start with `# Ideas & Innovation Roadmap — KWCode`
```

---

## Prompt 4 — `documentation.md`

> **Output file**: `.cursor/setup/documentation.md`

```markdown
You are a senior technical documentation architect who has led documentation strategy at developer-tools companies (Stripe, Vercel, Supabase). Your task is to produce the `documentation.md` file for `.cursor/setup/documentation.md` — the definitive guide on HOW to write, structure, and maintain documentation for this project.

## Project Context

**KWCode** is a Next.js 16 + Tauri v2 desktop application for AI-powered development workflows. The codebase has:

- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — UI components (ui/, atoms/, molecules/, organisms/, shared/)
- `src/lib/` — Utility functions and API helpers
- `src/types/` — TypeScript type definitions
- `src/store/` — Zustand stores
- `src/context/` — React context providers
- `src-tauri/` — Rust backend (Tauri commands, SQLite)
- `data/` — JSON data files
- `script/` — Shell and Node.js automation scripts
- `.cursor/` — Cursor AI configuration (agents, setup, planner, ADRs)
- `docs/` — Project documentation

The team consists of AI agents (frontend-dev, backend-dev, QA, solution-architect, requirements-engineer, devops) and human developers. Documentation must serve both human and AI readers.

## Requirements for the `documentation.md` output

Produce a comprehensive documentation strategy and standards document. Cover ALL sections below with concrete, actionable rules:

### 1. Documentation Philosophy
- State 5 core principles: e.g., "Docs as code", "Write for the next developer", "Every public API is documented", "Examples over explanations", "Keep docs close to code"
- Define the target audiences: new developer onboarding, AI agents reading context, future self, external contributors

### 2. Documentation Types & Hierarchy
Define each documentation type, when to use it, and where it lives:

| Type | Purpose | Location | Format |
|------|---------|----------|--------|
| **README** | Project overview, getting started | Root `/README.md` | Markdown |
| **Setup Docs** | AI agent context files | `.cursor/setup/*.md` | Markdown |
| **Agent Docs** | Role-specific agent instructions | `.cursor/2. agents/*.md` | Markdown + YAML front matter |
| **ADRs** | Architectural Decision Records | `.cursor/adr/*.md` | Markdown (MADR format) |
| **API Docs** | Endpoint reference | `docs/api/*.md` or inline JSDoc | Markdown / JSDoc |
| **Component Docs** | Component usage, props, examples | Co-located or Storybook | TSDoc + examples |
| **Guides** | How-to tutorials | `docs/guides/*.md` | Markdown |
| **Runbooks** | Operational procedures | `docs/runbooks/*.md` | Markdown with checklists |
| **Changelogs** | Version history | `CHANGELOG.md` | Keep-a-Changelog format |
| **Inline Comments** | Code-level explanations | In-source | TSDoc / Rust doc comments |

### 3. Documentation Standards & Style Guide

#### 3.1 Writing Style
- Voice: active, direct, second person ("You can…", "Run the following…")
- Tense: present tense for descriptions, imperative for instructions
- Sentence length: max 25 words per sentence
- Paragraph length: max 4 sentences
- Jargon: define on first use; link to glossary
- Avoid: "simply", "just", "obviously", "easy" — never assume reader knowledge level

#### 3.2 Markdown Conventions
- Header hierarchy: one `#` per document, then `##`, `###`, `####` (max 4 levels)
- Code blocks: always specify language (`tsx`, `ts`, `rust`, `bash`, `json`)
- Admonitions: use blockquotes with emoji prefixes: `> ⚠️ Warning:`, `> 💡 Tip:`, `> 📌 Note:`, `> 🚨 Critical:`
- Links: use relative paths for internal docs, full URLs for external
- Tables: use for comparison data, configuration options, API parameters
- Lists: use `-` for unordered, `1.` for ordered steps

#### 3.3 Code Examples
- Every code example must be runnable (no pseudo-code unless explicitly labeled)
- Show the minimal complete example (no unnecessary imports or boilerplate)
- Include expected output as a comment where applicable
- Use meaningful variable names, not `foo`/`bar`
- Show both ✅ correct and ❌ incorrect patterns where teaching a convention

#### 3.4 File Naming Conventions
- Kebab-case for all documentation files: `getting-started.md`, `api-reference.md`
- ADR naming: `YYYYMMDD-descriptive-title.md`
- Prefix with number for ordered sequences: `01-installation.md`, `02-configuration.md`

### 4. Component Documentation Template
Provide a template for documenting React components:
```
# ComponentName

> Brief one-line description

## Usage
[Code example]

## Props
[Table: name, type, default, required, description]

## Variants
[Visual examples or code for each variant]

## Accessibility
[ARIA attributes, keyboard interactions]

## Related Components
[Links to related components]
```

### 5. API Documentation Template
Provide a template for documenting API endpoints:
```
# Endpoint Name

`METHOD /api/path`

> Brief description

## Request
[Body schema, query params, headers]

## Response
[Success response, error responses]

## Example
[curl or fetch example]

## Notes
[Rate limiting, permissions, side effects]
```

### 6. ADR (Architectural Decision Record) Template
Follow the MADR format:
```
# ADR-NNN: Title

## Status: [proposed | accepted | deprecated | superseded]
## Date: YYYY-MM-DD

## Context
[What is the issue?]

## Decision
[What was decided?]

## Consequences
[What are the results?]

## Alternatives Considered
[What was rejected and why?]
```

### 7. Documentation for AI Agents
Special rules for `.cursor/setup/` and `.cursor/2. agents/` files:
- Be extremely explicit — AI agents have no implicit context
- Use structured data (tables, lists) over prose
- Include concrete file paths and command examples
- Define the vocabulary: use the same terms consistently
- Include "When to use" and "When NOT to use" sections
- Include checklists the agent can follow step-by-step

### 8. Documentation Maintenance & Governance
- Define the documentation review cadence (e.g., every sprint, with every PR that changes public API)
- Define the "docs-or-it-didn't-happen" rule: code PRs that add/change public APIs must include docs
- Define staleness detection: how to identify outdated docs
- Define ownership: who is responsible for each doc type
- Define the documentation testing strategy: link checking, example validation

### 9. Getting Started Guide Template
Provide a complete template for the root `README.md`:
- Project title, badges, one-line description
- Quick start (3 steps max)
- Prerequisites
- Installation
- Development
- Project structure overview
- Contributing
- License

### 10. Glossary
Define key project-specific terms that should be used consistently across all docs:
- Prompt, Project, Ticket, Feature, Run, Agent, Setup file, ADR, Kanban, etc.

## Formatting Rules
- Be specific and actionable — every rule should be enforceable
- Provide complete templates that can be copy-pasted
- Target 400-600 lines
- Start with `# Documentation Standards & Strategy — KWCode`
```

---

## Prompt 5 — `testing.md`

> **Output file**: `.cursor/setup/testing.md`

```markdown
You are a senior QA architect and test engineering lead who has designed testing strategies for complex desktop + web hybrid applications. Your task is to produce the `testing.md` file for `.cursor/setup/testing.md` — the definitive testing strategy, standards, and playbook for this project.

## Project Context

**KWCode** is a hybrid desktop (Tauri v2) + web (Next.js 16) application for AI-powered developer workflows:

- **Frontend**: React 18, TypeScript 5.7, Tailwind CSS, shadcn/ui, Zustand
- **Backend (Browser)**: Next.js API routes, JSON file persistence (`data/*.json`)
- **Backend (Native)**: Tauri v2 Rust commands, SQLite, shell script execution
- **AI Integration**: OpenAI API calls via proxied API routes
- **Current Testing**: Playwright E2E (`playwright.config.ts`)
- **Build System**: Next.js Webpack, Tauri bundler
- **Dev Server**: `next dev -p 4000`
- **Components**: Atomic design (ui/ → atoms/ → molecules/ → organisms/ → shared/)
- **State**: Zustand stores (run-store), React context (UITheme, QuickActions)

The app has complex interactive features: Kanban drag-and-drop, multi-step AI prompt runs, file tree navigation, markdown editing/preview, theme switching, and Tauri-native features (file dialogs, shell spawning).

## Requirements for the `testing.md` output

Produce a comprehensive, production-grade testing strategy document. Cover ALL sections:

### 1. Testing Philosophy & Principles
- State the testing pyramid / trophy and which shape this project follows
- Define 5-7 core testing principles: e.g., "Test behavior, not implementation", "Every bug gets a regression test", "Tests are documentation", "Fast feedback loops"
- State the coverage targets: unit (80%+), integration (70%+), E2E (critical paths)
- Define the "Definition of Tested": what must pass before code is mergeable

### 2. Testing Stack & Tools

| Layer | Tool | Config File | Purpose |
|-------|------|-------------|---------|
| **E2E** | Playwright | `playwright.config.ts` | Browser automation, cross-browser |
| **Component** | Vitest + Testing Library | `vitest.config.ts` | React component tests |
| **Unit** | Vitest | `vitest.config.ts` | Pure functions, utils, hooks |
| **API Route** | Vitest + supertest/node mocks | `vitest.config.ts` | Next.js API route testing |
| **Visual Regression** | Playwright screenshots | Playwright config | Catch unintended visual changes |
| **Accessibility** | axe-playwright / jest-axe | N/A | WCAG compliance |
| **Performance** | Lighthouse CI | `.lighthouserc.json` | Core Web Vitals |
| **Tauri** | Tauri test utilities + Rust tests | `Cargo.toml` | Native command testing |

For each tool, provide:
- Installation command
- Basic configuration
- "Hello world" test example

### 3. Test Organization & Naming Conventions
- Directory structure: `__tests__/` co-located vs. `tests/` root — recommend and explain why
- File naming: `*.test.ts`, `*.spec.ts`, `*.e2e.ts` — when to use each suffix
- Test naming convention: `describe('ComponentName')` → `it('should [behavior] when [condition]')`
- Test categorization via tags/annotations: `@smoke`, `@regression`, `@critical`, `@slow`
- Folder structure for E2E tests: organized by feature or user flow

### 4. Unit Testing Standards
- What to unit test: pure functions in `src/lib/`, Zod schemas, type guards, formatters, parsers
- What NOT to unit test: UI rendering (use component tests), API calls (use integration tests)
- Mocking rules: mock at boundaries (API, file system, timers), never mock the unit under test
- Test patterns for:
  - Zustand stores (testing actions and selectors)
  - Zod schema validation (valid, invalid, edge cases)
  - Utility functions (happy path, edge cases, error cases)
  - Custom React hooks (using `renderHook`)

Provide a complete example test for each pattern.

### 5. Component Testing Standards
- Use React Testing Library with Vitest
- Test what the user sees, not internal state
- Query priority: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
- Testing patterns for:
  - Form components (input, validation, submission)
  - Dialog components (open, interact, close, cancel)
  - Data display components (loading, error, empty, populated states)
  - Theme-dependent components (light vs. dark mode rendering)
  - Components with Zustand store dependencies (mocking the store)

Provide a complete example test for a shadcn/ui Card-based component.

### 6. E2E Testing Standards (Playwright)
- Define the critical user flows that MUST have E2E tests:
  1. Project CRUD (create, view, edit, delete)
  2. Prompt management and execution
  3. Ticket Kanban (create, drag, status change)
  4. Feature management
  5. AI generation workflows (mock or stub the AI API)
  6. Theme switching (light → dark → themed variants)
  7. Navigation (sidebar, tabs, breadcrumbs)
  8. Configuration settings
- Page Object Model: define the pattern for this project
- Fixture strategy: how to seed test data, reset between tests
- API mocking: how to intercept and mock API calls in Playwright
- Screenshot testing: when to capture, how to compare, threshold settings
- Cross-browser matrix: Chromium (required), Firefox (recommended), WebKit (optional)
- Mobile viewport testing: define breakpoints to test

Provide a complete Page Object and test example for the Projects page.

### 7. API Route Testing
- How to test Next.js App Router API routes with Vitest
- Testing patterns for:
  - GET endpoints (list, single, not-found)
  - POST endpoints (valid body, invalid body, Zod validation errors)
  - PUT/DELETE endpoints (success, not-found, conflict)
  - AI generation endpoints (mock OpenAI, test prompt construction, test streaming)
- Data isolation: use temp directories for JSON files in tests

### 8. Tauri / Native Testing
- Rust unit tests for Tauri commands (`#[cfg(test)]` modules)
- Integration testing: testing Rust commands with mock file system
- IPC testing: verifying frontend ↔ Tauri communication
- How to test features that differ between browser and Tauri modes

### 9. Testing AI Features
- Strategy for testing AI-dependent features without hitting real APIs
- Mock response fixtures: realistic AI responses for each generation type
- Testing the prompt construction logic (unit tests for prompt templates)
- Testing streaming responses (chunked transfer, partial rendering)
- Snapshot testing for AI UI components (loading, streaming, complete states)

### 10. Accessibility Testing
- Automated: axe-core integration in component tests and E2E tests
- Manual checklist: keyboard navigation, screen reader, color contrast, focus management
- Define the WCAG 2.1 AA compliance targets
- Provide an example axe-playwright test

### 11. Performance Testing
- Lighthouse CI integration: thresholds for FCP, LCP, TTI, CLS
- Bundle size monitoring: track and alert on bundle size increases
- Component rendering performance: `React.Profiler` usage
- Define "performance budget" for the app

### 12. CI/CD Integration
- Define the test pipeline stages: lint → type check → unit → component → E2E → visual regression
- Parallelization strategy for tests
- Test result reporting format
- Flaky test management: retry policy, quarantine process
- Branch protection rules: which tests must pass to merge

### 13. Test Data Management
- Fixture files: location, format, naming
- Factory functions: patterns for generating test data
- Database seeding for Tauri tests
- Cleanup strategies: afterEach, afterAll

### 14. Debugging Failing Tests
- Step-by-step debugging guide for each test type
- Playwright trace viewer usage
- Common failure patterns and solutions
- How to reproduce flaky tests

### 15. Testing Anti-Patterns (Avoid These)
- List 10+ anti-patterns with ❌ bad and ✅ good examples
- Examples: testing implementation details, sleeping instead of waiting, shared mutable test state, over-mocking, testing third-party library behavior

## Formatting Rules
- Provide runnable code examples for every testing pattern (TypeScript + Playwright)
- Use tables for tool comparisons and matrices
- Include configuration file contents that can be copy-pasted
- Target 500-800 lines
- Start with `# Testing Strategy & Standards — KWCode`
```

---

## Usage Instructions

1. **Open Cursor** and navigate to the KWCode project
2. **Start a new chat** with Opus 4.6 selected
3. **Copy-paste** one prompt at a time (from the code blocks above)
4. **Review** the generated output
5. **Save** the output to the corresponding `.cursor/setup/*.md` file
6. **Repeat** for each of the 5 prompts

### Tips for Best Results

- **Run each prompt in a fresh chat** — don't chain them, each is self-contained
- **If the output is too short**, reply: "Expand sections [X] and [Y] with more detail and concrete examples"
- **If the output is too generic**, reply: "Make this more specific to the KWCode project — reference actual file paths, components, and features"
- **After generating all 5**, do a consistency pass: ensure terminology, file paths, and tech stack references are uniform across all files

---

*Generated: 2026-02-12 · For KWCode Project*
