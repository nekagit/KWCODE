# Documentation Standards & Strategy — KWCode

**Version**: 1.0  
**Last Updated**: 2026-02-13  
**Author**: Technical Documentation Architect (AI)

---

## Documentation Landscape

### Current State Assessment

| Aspect | Status |
|--------|--------|
| **Root README** | **Missing.** No `/README.md` at repository root. Only `src/components/shared/README-tailwind.md` exists. |
| **CONTRIBUTING.md** | **Missing.** No contributor guide. |
| **CHANGELOG.md** | **Missing.** No version history file. |
| **Setup docs** | **Present.** `.cursor/setup/` contains `architecture.md`, `design.md`, `ideas.md`, `testing.md`; `documentation.md` (this file) completes the set. |
| **ADRs** | **Present.** `.cursor/adr/` has many ADRs in `YYYYMMDD-descriptive-title.md` format (e.g. `20260213-architecture-document-setup.md`). |
| **Agent docs** | **Present.** `.cursor/agents/` (frontend-dev, backend-dev, solution-architect) and `.cursor/legacy_agents/`. |
| **API docs** | **Missing.** No `docs/api/` or formal API reference; routes live in `src/app/api/` with no co-located docs. |
| **Guides / runbooks** | **Sparse.** `docs/` has only `cursor-setup-prompts.md` (meta-doc for generating setup files). No `docs/guides/` or `docs/runbooks/`. |
| **Inline docs** | **Partial.** Some TSDoc/JSDoc; no project-wide standard. |
| **Tooling** | Markdown only; no Docusaurus/Nextra; no automated link checks or doc CI. |

**Documentation maturity**: **Emerging.** Strong AI/agent and architecture docs in `.cursor/`; missing classic project-facing docs (README, CONTRIBUTING, CHANGELOG) and API/guide coverage.

### Audiences

| Audience | Primary needs | Primary docs |
|----------|----------------|--------------|
| **New developer** | Setup, first run, first PR | README (to add), CONTRIBUTING (to add), `.cursor/setup/architecture.md` |
| **AI agents** | Context, roles, patterns | `.cursor/setup/*.md`, `.cursor/agents/*.md` |
| **Experienced contributor** | Design decisions, API contracts, runbooks | `.cursor/adr/`, `docs/api/` (to add), `docs/runbooks/` (to add) |
| **DevOps / maintainer** | Deploy, Tauri build, env | Runbooks (to add), architecture.md (Security & Deployment) |

### Gaps

- **Repeated questions**: "How do I run this?" "Where is the API?" "What's the project structure?" — no single entry point (README).
- **Tribal knowledge**: Dev server port (4000), Tauri vs browser mode, `.cursor/planner` sync — documented in architecture/setup but not in a quick-start.
- **API**: No formal list of endpoints; discovery is by browsing `src/app/api/`.
- **Versioning**: No CHANGELOG; no doc versioning tied to releases.

### Infrastructure

- **Location**: Repo-only (no separate doc site or wiki).
- **Format**: Markdown; agent files may use YAML front matter.
- **CI/CD**: No doc-specific jobs (link check, example validation) yet.
- **Versioning**: Docs are main-branch only; no versioned doc branches.

---

## 1. Documentation Philosophy

### Core Principles

1. **Docs as code** — Documentation lives in the repo, is versioned with code, and is reviewed in the same PRs as implementation.
2. **Write for the next developer** — Assume the reader is capable but has no context; future you and new contributors are the primary audience.
3. **Examples over explanations** — Show runnable examples first; add prose only when necessary for nuance or constraints.
4. **Every public API is documented** — Exported functions, API routes, and public component props have TSDoc or endpoint docs; zero tolerance for undocumented public surface.
5. **Keep docs close to code** — Prefer co-located docs (e.g. JSDoc, component README) where it helps; use `.cursor/setup/` and `docs/` for cross-cutting and AI-facing docs.
6. **Assume zero context** — Do not assume prior knowledge of this repo, Cursor, or Tauri; define terms on first use and link to glossary or external refs.
7. **Update docs in the same PR** — If code changes public behavior or API, update the relevant doc in the same change set.

### Target Audiences

| Audience | Needs | Primary docs |
|----------|-------|---------------|
| **New developer** | Setup, where to start, first contribution | README, CONTRIBUTING, architecture overview |
| **AI agents** | Context files, role definitions, system prompts | `.cursor/setup/*`, `.cursor/agents/*` |
| **Experienced contributor** | Design decisions, API reference, advanced patterns | Architecture docs, ADRs, API reference |
| **Maintainer / DevOps** | Deployment, Tauri build, env, runbooks | Deployment guides, runbooks, architecture (Security & Scalability) |

---

## 2. Documentation Types & Hierarchy

### A. README.md (Project Overview)

**Purpose**: First thing anyone sees — answer "What is this?"

**Location**: Repository root (`/README.md`)

**Required sections**:
1. Project title and one-line description
2. Badges (build status, coverage, version, license) — optional but recommended
3. Quick start (3 steps max: clone, install, run)
4. Features (bullet list of key capabilities)
5. Prerequisites (Node version, system deps, accounts e.g. OpenAI)
6. Installation (detailed setup)
7. Usage (basic examples, common workflows)
8. Project structure (high-level directory overview)
9. Contributing (link to CONTRIBUTING.md)
10. License

**Template**: See [Section 7 — Template 1: README.md](#template-1-readmemd).

---

### B. CONTRIBUTING.md (Contributor Guide)

**Purpose**: How to contribute code, docs, or ideas.

**Location**: `/CONTRIBUTING.md` or `/docs/CONTRIBUTING.md`

**Required sections**:
1. Code of conduct (link to CODE_OF_CONDUCT.md if present)
2. How to report bugs (issue template, required info)
3. How to suggest features (discussion first, RFC if applicable)
4. Development setup (IDE, env vars, tools beyond README)
5. Coding standards (style, linting, file naming)
6. Testing requirements (how to run and write tests)
7. Commit message conventions (e.g. Conventional Commits)
8. PR process (branch naming, review checklist, CI)
9. Documentation requirements (when to update docs, how to write them)

**Template**: See [Section 7 — Template 2: CONTRIBUTING.md](#template-2-contributingmd).

---

### C. CHANGELOG.md (Version History)

**Purpose**: Track what changed between versions.

**Location**: `/CHANGELOG.md`

**Format**: [Keep a Changelog](https://keepachangelog.com/).

**Structure**:
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]
### Added
- New feature X
### Changed
- Behavior Y now works differently
### Deprecated
- Feature Z will be removed in v2.0
### Removed
- Removed deprecated API endpoint
### Fixed
- Bug fix for issue #123
### Security
- Security patch for CVE-XXXX-XXXX

## [0.2.0] - 2026-02-13
### Added
- Feature A

[Unreleased]: https://github.com/user/repo/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/user/repo/releases/tag/v0.2.0
```

---

### D. Architecture Docs (System Design)

**Purpose**: Explain how the system works at a high level.

**Location**: `.cursor/setup/architecture.md` (primary); optional expansion in `docs/architecture/`.

**Types**:
- `architecture.md` — Overall system architecture (already exists in `.cursor/setup/`)
- Optional: `docs/architecture/data-flow.md`, `api-design.md`, `security.md`, `performance.md` if the main doc is split

**Required content**:
- High-level diagrams (ASCII or Mermaid)
- Architectural style (layered, modular monolith, atomic design, dual-backend)
- Technology choices and rationale
- Integration points (file system, OpenAI, Tauri)
- Directory structure and module boundaries
- Anti-patterns and extension patterns

---

### E. ADRs (Architectural Decision Records)

**Purpose**: Document **why** significant decisions were made.

**Location**: `.cursor/adr/`

**Format**: MADR-style (Markdown Any Decision Records).

**File naming**: `YYYYMMDD-descriptive-title.md` (e.g. `20260213-architecture-document-setup.md`).

**Template**: See [Section 7 — Template 3: ADR](#template-3-adr-architectural-decision-record).

---

### F. API Reference (Endpoint Documentation)

**Purpose**: Document all API endpoints for frontend and integration use.

**Location**: `docs/api/` or inline in route files (JSDoc). Prefer `docs/api/` for a single discoverable reference.

**Template per endpoint**: See [Section 2 — API template](#f-api-reference-endpoint-documentation) and [Section 7 — Template 4: API Endpoint](#template-4-api-endpoint-documentation).

---

### G. Component Documentation (UI Components)

**Purpose**: Document React components for reuse and consistency.

**Location**: Co-located (e.g. `Button.mdx` or `README.md` next to component) or `docs/components/`. For KWCode, prefer co-located or `docs/components/` for shared/design-system components.

**Template**: See [Section 7 — Template 5: Component Documentation](#template-5-component-documentation).

---

### H. Guides & Tutorials (How-To Docs)

**Purpose**: Step-by-step instructions for common tasks.

**Location**: `docs/guides/`

**Types**: Getting started, feature tutorials, migration guides, troubleshooting, best practices.

**Template**: See [Section 7 — Template 6: How-To Guide](#template-6-how-to-guide).

---

### I. Runbooks (Operational Procedures)

**Purpose**: Step-by-step procedures for deployment, rollback, incidents, migrations.

**Location**: `docs/runbooks/`

**Template**: See [Section 7 — Template 7: Runbook](#template-7-runbook).

---

### J. Inline Code Documentation (TSDoc / JSDoc)

**Purpose**: Document functions, classes, and types in code.

**When to use**:
- Public APIs (exported functions, classes, types)
- Complex logic (non-obvious algorithms)
- Configuration objects (each option documented)

**TSDoc tags**: `@param`, `@returns`, `@throws`, `@example`, `@see`, `@deprecated`, `@internal`.

**Example**:
```typescript
/**
 * Fetches a list of projects from the API with optional filtering.
 *
 * @param options - Query options for filtering and pagination
 * @param options.status - Filter by project status (default: 'all')
 * @param options.page - Page number (default: 1)
 * @param options.perPage - Items per page (default: 10, max: 100)
 * @returns Promise resolving to paginated list of projects
 * @throws {ApiError} If API request fails
 * @example
 * const projects = await fetchProjects({ status: 'active', page: 1 })
 */
export async function fetchProjects(options?: FetchProjectsOptions): Promise<PaginatedList<Project>> {
  // ...
}
```

---

## 3. Documentation Standards & Style Guide

### A. Writing Style

**Voice and tone**:
- **Active voice**: "Run `npm install`" not "npm install should be run."
- **Second person**: "You can deploy by…" not "One can deploy by…"
- **Direct and concise**: Avoid "simply," "just," "obviously."
- **Present tense**: "The function returns" not "will return."

**Structure**:
- Max ~25 words per sentence; break long sentences.
- Max ~4 sentences per paragraph; use whitespace.
- One idea per paragraph.

**Jargon**:
- Define technical terms on first use.
- Link to glossary for repeated terms (Prompt, Run, Agent, etc.).
- Acronyms: API, URL are fine; spell out and define less common ones (e.g. ADR, MADR).

**Avoid**:
- "simply" / "just" / "obviously" / "easy"
- "should work" / "might work" — be definitive or state the condition
- "etc." — be exhaustive or say "for example"

---

### B. Markdown Conventions

**Headers**:
- One `#` (H1) per document (the title).
- Use `##`, `###`, `####` (max 4 levels); do not skip levels.

**Code blocks**:
- Always specify language: ` ```typescript`, ` ```bash`, ` ```json`.
- No language = plain text: ` ``` `.
- Include enough context (imports, types) or note what is omitted.

**Admonitions** (callouts):
```markdown
> ⚠️ **Warning**: This action is irreversible.

> 💡 **Tip**: Use `⌘K` to open the command palette.

> 📌 **Note**: The API is rate-limited to 100 requests per minute.

> 🚨 **Critical**: Never commit API keys to the repository.

> ✅ **Success**: Deployment complete. View at https://example.com
```

**Links**:
- Internal: relative paths `[Architecture](.cursor/setup/architecture.md)` or `[Architecture](/docs/architecture.md)`.
- External: full URLs.
- Anchors: `[Section](#section-title)` (lowercase, hyphens for spaces).

**Tables**: Use for parameters, options, comparisons; include a header row.

**Lists**:
- Unordered: `-` (not `*` or `+`).
- Ordered: `1.`, `2.`, `3.`
- Nested: indent 2 spaces.
- Checkboxes: `- [ ]` and `- [x]`.

---

### C. Code Examples

**Requirements**:
1. **Runnable**: Copy-paste should work (no pseudo-code unless labeled).
2. **Complete**: Include imports and minimal context.
3. **Tested**: Prefer running examples in CI or at least manually.
4. **Realistic**: Use real variable names and paths (e.g. `run-store`, `projects.json`).

**Pattern**:
```typescript
// ✅ GOOD: Complete, runnable
import { Button } from '@/components/ui/button'

function MyComponent() {
  const handleClick = () => console.log('Clicked')
  return <Button onClick={handleClick}>Click Me</Button>
}

// ❌ BAD: Incomplete
<Button onClick={handleClick}>Click Me</Button>
```

**Show expected output** where helpful:
```bash
$ npm run dev
▲ Next.js 16.x.x
- Local: http://127.0.0.1:4000
```

**Show correct vs incorrect** when teaching a pattern:
```typescript
// ❌ DON'T: Mutate props
function Component({ items }) {
  items.push(newItem)
}

// ✅ DO: Create new array or call updater
function Component({ items, onItemsChange }) {
  onItemsChange([...items, newItem])
}
```

---

### D. File Naming Conventions

**Documentation files**:
- Kebab-case: `getting-started.md`, `api-reference.md`.
- Descriptive: `how-to-deploy.md` not just `deploy.md`.
- ADRs: `YYYYMMDD-descriptive-title.md`.
- Ordered sequences: `01-installation.md`, `02-configuration.md`.

**Avoid**: Spaces, underscores for multi-word names, UPPERCASE.

---

## 4. Documentation for AI Agents

### A. Context Files (`.cursor/setup/`)

**Purpose**: Give AI agents high-level project context.

**Required files**:
- `design.md` — Design system, tokens, component patterns
- `architecture.md` — System architecture, data flow, tech stack
- `ideas.md` — Roadmap, feature backlog, innovation ideas
- `documentation.md` — This file; documentation standards
- `testing.md` — Testing strategy, frameworks, standards

**Writing for AI**:
- **Explicit**: Do not rely on implicit context.
- **Structured**: Prefer tables and lists over long prose.
- **Concrete paths**: Use exact paths (e.g. `src/store/run-store.ts`, `src/app/api/data/projects/route.ts`).
- **Vocabulary**: Define and use terms consistently (Prompt, Project, Ticket, Run, Agent, Setup file).
- **Examples**: Include code snippets for every pattern.
- **When to use / when NOT to use**: Reduce misuse.

---

### B. Agent Instruction Files (`.cursor/agents/`)

**Purpose**: Define AI agent roles, responsibilities, and workflows.

**Template**:
```markdown
---
name: [Agent Name]
description: [One-line role description]
agent: general-purpose | specialist | reviewer
---

# [Agent Name]

## Role
[2–3 paragraphs: what this agent does]

## Responsibilities
1. **[Responsibility #1]** — [Description]
2. **[Responsibility #2]** — [Description]

## Workflow
### 1. [Step name]
[Instructions with examples]

### 2. [Step name]
[Instructions]

## Best Practices
- [Practice 1]
- [Practice 2]

## Anti-Patterns (Avoid)
- ❌ **[Anti-pattern]**: [Why bad]
- ✅ **[Correct pattern]**: [Why good]

## Checklist Before Completion
- [ ] [Checkpoint 1]
- [ ] [Checkpoint 2]

## Handoff
After completing, hand off to:
- **[Next agent]**: [When to invoke, what to pass]
```

---

## 5. Documentation Maintenance & Governance

### A. Update Cadence

| Trigger | Action |
|--------|--------|
| **Every PR** | If code changes public API or behavior, update docs in the same PR. |
| **Sprint / retro** | Review docs for accuracy; fix stale or missing sections. |
| **Major release** | Full pass on README, CONTRIBUTING, CHANGELOG; update version and links. |
| **Quarterly** | Doc health: broken links, outdated examples, orphaned files. |

**Ownership**:
- **Author**: Update docs in the same PR as the code change.
- **Reviewer**: Confirm docs are updated and accurate.
- **Maintainer**: Quarterly audit and structural improvements.

---

### B. Documentation Review Process

**Checklist for PR reviewers**:
- [ ] New or changed public APIs have TSDoc or endpoint docs.
- [ ] README updated if setup or usage changed.
- [ ] CHANGELOG updated if this is a versioned release.
- [ ] Migration or runbook added for breaking or operational changes.
- [ ] Examples are runnable and tested where feasible.
- [ ] Internal and external links are valid.
- [ ] Screenshots or UI references are current if changed.

---

### C. Staleness Detection

**Signals**:
- "Last updated" in doc header older than ~6 months → schedule review.
- Broken links (run link checker in CI).
- References to files or symbols that no longer exist (grep or script).
- Labels: `docs-needed`, `docs-outdated` on issues/PRs.

**Automated checks (recommended)**:
```yaml
# .github/workflows/docs.yml (example)
name: Docs Health
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check links
        run: npx markdown-link-check '**/*.md' --config .mlc.json
```

---

### D. "Docs-or-It-Didn't-Happen" Rule

**Policy**: PRs that add or change public APIs or user-facing behavior must include the corresponding documentation updates.

**Enforcement**:
- PR template: checkbox "Documentation updated (README/API/CHANGELOG as applicable)."
- Review: Reviewer verifies docs are updated.
- Exceptions: Critical hotfixes may document in a follow-up PR; internal-only APIs should still note intent to keep them private.

---

## 6. Documentation Testing

### A. Link Checking

```bash
npx markdown-link-check '**/*.md' --config .mlc.json
```

Run in CI on PRs; fail on broken links. Allow temporary skip with comment: `<!-- markdown-link-check-disable -->` if needed.

### B. Example Validation

- **Option 1**: Extract examples into test files and run them (e.g. `docs/examples/button.test.tsx`).
- **Option 2**: Doctest-style: parse markdown, extract code blocks, run in test runner.

### C. Screenshot / UI Docs

For component docs with screenshots: capture from Storybook or app; use visual regression (e.g. Playwright) to detect when UI changed but docs did not.

---

## 7. Templates for Common Docs

### Template 1: README.md

```markdown
# KWCode

AI-powered development workflow and prompt orchestration for Cursor — plan in .cursor/planner, run prompts, and drive execution from one desktop app.

[![Build](https://github.com/your-org/kwcode/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/kwcode/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Quick start

1. **Clone and install**
   ```bash
   git clone https://github.com/your-org/kwcode.git && cd kwcode
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Set OPENAI_API_KEY for AI features (optional for local-only use)
   ```

3. **Run**
   ```bash
   npm run dev
   ```
   Open http://127.0.0.1:4000 (browser). For Tauri desktop: `npm run tauri dev`.

## Features

- **Project & planner** — Manage projects and keep `.cursor/planner` (features.md, tickets.md) in sync
- **Kanban** — Tickets and features as a board; sync to/from planner files
- **Run** — Execute prompts, Implement All, feature queue, floating terminal (Tauri)
- **AI** — Generate prompts, ideas, design, architecture, tickets, project-from-idea (OpenAI)
- **Setup** — Design, architecture, documentation, testing setup docs and analysis prompts
- **Themes** — Light/dark and themed variants (ocean, forest, warm, red)

## Prerequisites

- Node.js 18+
- npm (or pnpm / yarn)
- (Optional) OpenAI API key for generation features
- (Optional) Rust + Tauri deps for desktop build

## Installation

[Same as Quick start; add any extra steps: Tauri prerequisites, env vars, data dir.]

## Usage

- **Browser**: `npm run dev` → http://127.0.0.1:4000
- **Desktop**: `npm run tauri dev` (first run may install Rust/Tauri)
- **Build**: `npm run build`; desktop: `npm run tauri:build`

## Project structure

| Path | Purpose |
|------|--------|
| `src/app/` | Next.js routes and API |
| `src/components/` | UI (ui, atoms, molecules, organisms, shared) |
| `src/store/` | Zustand run store |
| `src/lib/` | Utilities, Tauri bridge, validation |
| `.cursor/setup/` | Architecture, design, ideas, testing, documentation |
| `.cursor/adr/` | Architectural decision records |
| `data/` | File-based app data (e.g. projects.json) |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).
```

---

### Template 2: CONTRIBUTING.md

```markdown
# Contributing to KWCode

Thank you for your interest in contributing. This document explains how to set up your environment, follow our standards, and submit changes.

## Code of conduct

We expect respectful and inclusive behavior. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) if present.

## Reporting bugs

- Use the issue template and include: steps to reproduce, expected vs actual behavior, environment (OS, Node version, browser/Tauri).
- For crashes, include relevant logs or stack traces.

## Suggesting features

- Open a discussion or issue describing the use case and proposed behavior.
- For large changes, an ADR in `.cursor/adr/` may be requested (YYYYMMDD-title.md).

## Development setup

1. Clone, install, and run as in README.
2. **Env**: Copy `.env.example` to `.env`; set `OPENAI_API_KEY` if you work on AI features.
3. **IDE**: Recommended to use ESLint and Prettier; project uses Next.js and TypeScript.
4. **Tauri**: For desktop work, ensure Rust and Tauri CLI are installed (`npm run tauri` will prompt if needed).

## Coding standards

- **Style**: Follow existing patterns; use project ESLint/Prettier config.
- **Naming**: Kebab-case for files; PascalCase for components; camelCase for functions/variables.
- **Imports**: Use `@/` path alias (e.g. `@/components/ui/button`, `@/lib/utils`).
- **Components**: Prefer Client Components only where needed (`"use client"`); keep server-friendly where possible.

## Testing

- Run E2E: `npm run test:e2e` (Playwright; dev server must be reachable at baseURL).
- Unit/component: See `.cursor/setup/testing.md` for strategy; add tests for new behavior and regressions.

## Commit messages

- Use clear, present-tense descriptions: "Add project delete API" not "Added project delete API."
- Optionally follow Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`.

## Pull request process

1. Branch from `main`; name branches by purpose: `feat/command-palette`, `fix/kanban-sync`.
2. Ensure lint and tests pass.
3. Update documentation (README, API docs, CHANGELOG) if behavior or API changes.
4. Request review; address feedback.

## Documentation

- Public API and route changes require doc updates in the same PR.
- Use `.cursor/setup/documentation.md` for style and structure.
- ADRs go in `.cursor/adr/` with format `YYYYMMDD-descriptive-title.md`.
```

---

### Template 3: ADR (Architectural Decision Record)

```markdown
# ADR: [Short title]

## Date
YYYY-MM-DD

## Status
Proposed | Accepted | Deprecated | Superseded

## Context

[What is the issue or decision driver? Describe the situation and constraints.]

## Decision

[What was decided? Be specific and actionable.]

## Consequences

### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Trade-off 1]
- [Trade-off 2]

## Alternatives considered

### [Alternative A]
- **Pros**: …
- **Cons**: …
- **Why rejected**: …

### [Alternative B]
- **Pros**: …
- **Cons**: …
- **Why rejected**: …
```

---

### Template 4: API Endpoint Documentation

```markdown
## GET /api/data/projects

> Returns the list of projects (file-based from data/projects.json).

### Request

**Query parameters**: None.

**Headers**:
| Header | Required | Description |
|--------|----------|-------------|
| (none) | — | No auth required in current version. |

### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "proj_abc",
      "name": "My Project",
      "path": "/path/to/repo",
      "createdAt": "2026-02-13T10:00:00Z"
    }
  ]
}
```

**Error (500)**:
```json
{
  "success": false,
  "error": { "code": "READ_FAILED", "message": "Could not read projects file." }
}
```

### Example

```bash
curl -s http://127.0.0.1:4000/api/data/projects
```

### Notes

- Data is read from `data/projects.json` on the server.
- No pagination in current implementation.
```

---

### Template 5: Component Documentation

```markdown
# Button

> Primary button component (shadcn/ui) with variants and sizes.

## Usage

```tsx
import { Button } from '@/components/ui/button'

function Example() {
  return (
    <Button variant="default" size="lg" onClick={() => {}}>
      Save
    </Button>
  )
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| variant | 'default' \| 'destructive' \| 'outline' \| 'secondary' \| 'ghost' \| 'link' | 'default' | No | Visual style |
| size | 'default' \| 'sm' \| 'lg' \| 'icon' | 'default' | No | Size |
| onClick | () => void | — | No | Click handler |
| disabled | boolean | false | No | Disabled state |
| children | ReactNode | — | Yes | Content |

## Variants

[Short code or screenshot for each variant.]

## Accessibility

- Semantic `<button>`; keyboard activation; focus ring; `aria-disabled` when disabled.

## Related

- [IconButton](docs/components/IconButton.md), [Link](docs/components/Link.md)
```

---

### Template 6: How-To Guide

```markdown
# How to add a new API route

Step-by-step guide to adding a new REST endpoint in KWCode.

## Prerequisites

- Next.js App Router basics
- Project dev server runs (`npm run dev`)

## Steps

### 1. Create the route file

```bash
mkdir -p src/app/api/my-resource
touch src/app/api/my-resource/route.ts
```

### 2. Implement the handler

```ts
// src/app/api/my-resource/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Implementation
  return NextResponse.json({ success: true, data: [] })
}
```

### 3. Add validation (if accepting body/query)

Use Zod and `parseAndValidate` from `@/lib/api-validation` (see existing routes in `src/app/api/`).

### 4. Document the endpoint

Add an entry in `docs/api/` or in this guide with method, path, request/response, and example.

### 5. Test

- Manual: `curl http://127.0.0.1:4000/api/my-resource`
- Or add integration test per `.cursor/setup/testing.md`.

## Troubleshooting

- **404**: Ensure folder name matches path (`api/my-resource` → `api/my-resource/route.ts`).
- **Runtime error**: Check server logs in the terminal where `npm run dev` is running.
```

---

### Template 7: Runbook

```markdown
# Runbook: Production deployment (Tauri desktop)

**Frequency**: On release  
**Estimated time**: 20–40 min  
**Risk**: Medium

## Prerequisites

- [ ] Tests passing on `main`
- [ ] CHANGELOG updated
- [ ] Version bumped (e.g. in `package.json` / tag)
- [ ] Staging or local Tauri build tested

## Steps

### 1. Version and tag

```bash
git checkout main && git pull
npm version patch   # or minor/major
git push origin main --tags
```

### 2. Build Tauri app

```bash
npm run tauri:build
```

Artifacts in `src-tauri/target/release/bundle/` (or per Tauri docs).

### 3. Verify

- [ ] Installer runs on target OS
- [ ] App starts and can load projects and run prompts (if applicable)
- [ ] No console errors on startup

### 4. Distribute

- Attach artifacts to GitHub Release or use your distribution channel.
- Update release notes from CHANGELOG.

## Rollback

- Revert the release tag and deploy previous build; document in CHANGELOG.

## Monitoring

- No server-side monitoring for desktop; rely on user reports and crash logs if integrated.
```

---

## 8. Glossary

| Term | Definition | Example usage |
|------|------------|---------------|
| **Prompt** | A template or preset for AI input (e.g. generate ticket, generate design). | "Create a new prompt for generating READMEs." |
| **Project** | Top-level entity: a repo or workspace the app manages; has path, name, and linked planner files. | "Each project has its own .cursor/planner." |
| **Ticket** | A unit of work (task, bug, epic) in the planner; appears on Kanban. | "Move the ticket to In Progress." |
| **Feature** | A user-facing capability or epic; groups tickets in features.md. | "The authentication feature is in the backlog." |
| **Run** | Execution of a prompt or script (e.g. Implement All, setup prompts) via Tauri or API. | "The last run completed in 2 minutes." |
| **Agent** | An AI role with specific responsibilities (e.g. frontend-dev, backend-dev). | "The frontend-dev agent builds UI from specs." |
| **Setup file** | A context document in `.cursor/setup/` (e.g. design.md, architecture.md). | "The design.md setup file defines color tokens." |
| **ADR** | Architectural Decision Record; documents why a decision was made. | "See ADR 20260213-architecture-document-setup for rationale." |
| **Planner** | The `.cursor/planner` folder (features.md, tickets.md) used as source of truth for Kanban and runs. | "Sync Kanban with planner before running Implement All." |
| **Implement All** | Workflow that runs multiple prompts/tasks in sequence for a project. | "Run Implement All from the Run tab." |
| **Dual-backend** | App runs in browser (Next.js API only) or in Tauri (API + native invoke for shell/run). | "In Tauri mode, run commands use invoke(); in browser they no-op." |

---

## Appendix: Quick Reference

### Documentation checklist for PRs

- [ ] New or changed public APIs have TSDoc or endpoint docs
- [ ] README updated if setup/usage changed
- [ ] CHANGELOG updated if versioned release
- [ ] Migration or runbook added if breaking or operational change
- [ ] Examples are runnable where possible
- [ ] Links checked (no broken internal/external links)
- [ ] Screenshots or UI references updated if UI changed

### Markdown quick reference

| Element | Syntax |
|--------|--------|
| H1–H4 | `#`, `##`, `###`, `####` |
| Bold | `**text**` |
| Italic | `*text*` |
| Code inline | `` `code` `` |
| Code block | ` ```lang` … ` ``` ` |
| Link | `[text](url)` or `[text](#anchor)` |
| Image | `![alt](url)` |
| Unordered list | `- item` |
| Ordered list | `1. item` |
| Table | `\| A \| B \|` then `\|---\|---\|` |
| Blockquote | `> quote` |
| Checkbox | `- [ ]` or `- [x]` |

### Key paths (KWCode)

| Purpose | Path |
|--------|------|
| Setup docs | `.cursor/setup/*.md` |
| ADRs | `.cursor/adr/YYYYMMDD-*.md` |
| Agents | `.cursor/agents/*.md` |
| API routes | `src/app/api/**/route.ts` |
| Run store | `src/store/run-store.ts` |
| Tauri bridge | `src/lib/tauri.ts` |
| Data (file-based) | `data/projects.json`, `.cursor/planner/` |

---

*This documentation guide is a living standard. Update it as the project and best practices evolve.*
