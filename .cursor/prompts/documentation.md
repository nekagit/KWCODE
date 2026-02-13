# PROMPT 04: GENERATE DOCUMENTATION.MD

Copy this prompt into Cursor with Opus 4.6 to generate `.cursor/setup/documentation.md`

---

You are a senior technical documentation architect who has led documentation strategy at top developer-tools companies (Stripe, Vercel, Supabase, Twilio, Cloudflare). You're an expert in writing documentation that developers love — clear, concise, example-driven, and maintainable.

## YOUR TASK

Generate a **comprehensive, actionable `documentation.md`** file that serves as the definitive guide on HOW to write, structure, organize, and maintain documentation for this project. This document should work for both human developers AND AI agents reading context.

## PROJECT CONTEXT ANALYSIS

**FIRST, deeply understand the project's documentation needs:**

1. **Assess Current Documentation**
   - What docs exist? (README, inline comments, API docs, guides)
   - What's missing? (setup guides, architecture docs, troubleshooting)
   - What's the documentation maturity level? (chaotic, emerging, mature)
   - Where are docs stored? (README, /docs folder, wiki, Notion, etc.)

2. **Identify Documentation Audiences**
   - New contributors (onboarding, first PR)
   - AI agents (context files, system prompts)
   - End users (if applicable: user guides, tutorials)
   - Maintainers (architecture decisions, runbooks)
   - External contributors (contributing guide, code of conduct)

3. **Map Documentation Gaps**
   - What questions do new developers ask repeatedly?
   - What causes confusion in PRs/issues?
   - What tribal knowledge exists only in people's heads?
   - What has changed but docs haven't been updated?

4. **Analyze Documentation Infrastructure**
   - Tooling: Markdown, MDX, Docusaurus, Nextra, raw files
   - Location: Repo, separate site, wiki, Notion
   - CI/CD: Automated link checking, dead code detection, doc generation
   - Versioning: How are docs versioned with releases?

**OUTPUT this analysis in a brief section at the top of documentation.md as "Documentation Landscape"**

---

## REQUIRED SECTIONS

Generate a documentation.md with the following structure. Be COMPREHENSIVE, SPECIFIC, and ENFORCEABLE.

### 1. DOCUMENTATION PHILOSOPHY

**Core Principles (5-7 principles)**

1. **[Principle Name]** - [One-sentence rationale]
   - Example: "Docs as Code" - Documentation lives in the repo, versioned with code, reviewed in PRs

2. **[Principle]** - [Rationale]
3. **[Principle]** - [Rationale]
4. **[Principle]** - [Rationale]
5. **[Principle]** - [Rationale]

**Suggested Principles:**
- "Write for the Next Developer" (including future you)
- "Examples Over Explanations" (show, don't just tell)
- "Every Public API is Documented" (zero tolerance for undocumented exports)
- "Keep Docs Close to Code" (co-located when possible)
- "Assume Zero Context" (never assume reader knowledge)
- "Update Docs in the Same PR" (code + docs = atomic commit)
- "Test Your Examples" (all code blocks must be runnable)

**Target Audiences**

Define who reads these docs and what they need:

| Audience | Needs | Primary Docs |
|----------|-------|--------------|
| **New Developer** | How to set up, where to start, first contribution | README, CONTRIBUTING, architecture overview |
| **AI Agents** | Context files, role definitions, system prompts | .cursor/agents/*, .cursor/setup/* |
| **Experienced Contributor** | Deep dives, design decisions, advanced patterns | Architecture docs, ADRs, API reference |
| **End User** (if applicable) | How to use the product, tutorials, troubleshooting | User guides, FAQ, video tutorials |
| **DevOps/Ops** | Deployment, monitoring, runbooks | Deployment guides, runbooks, incident response |

---

### 2. DOCUMENTATION TYPES & HIERARCHY

Define each documentation type, when to use it, and where it lives:

#### A. README.md (Project Overview)

**Purpose**: First thing anyone sees — answer "What is this?"

**Location**: Repository root (`/README.md`)

**Required Sections**:
1. Project title + one-line description
2. Badges (build status, coverage, version, license)
3. Quick start (3 steps max: clone, install, run)
4. Features (bullet list of key capabilities)
5. Prerequisites (Node version, system deps, accounts needed)
6. Installation (detailed setup instructions)
7. Usage (basic examples, common workflows)
8. Project structure (high-level directory overview)
9. Contributing (link to CONTRIBUTING.md)
10. License

**Template** (provide complete template)

---

#### B. CONTRIBUTING.md (Contributor Guide)

**Purpose**: How to contribute code, docs, or ideas

**Location**: `/CONTRIBUTING.md` or `/docs/CONTRIBUTING.md`

**Required Sections**:
1. Code of conduct (link to CODE_OF_CONDUCT.md)
2. How to report bugs (issue template, required info)
3. How to suggest features (discussion first, RFC process)
4. Development setup (beyond README — IDE setup, env vars, tools)
5. Coding standards (style guide, linting rules, file naming)
6. Testing requirements (test coverage, running tests, writing tests)
7. Commit message conventions (Conventional Commits, semantic versioning)
8. PR process (branch naming, review checklist, CI checks)
9. Documentation requirements (when to update docs, how to write docs)

**Template** (provide complete template)

---

#### C. CHANGELOG.md (Version History)

**Purpose**: Track what changed between versions

**Location**: `/CHANGELOG.md`

**Format**: Keep a Changelog (https://keepachangelog.com/)

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
- Security patch for CVE-2024-XXXX

## [1.2.0] - 2024-02-12
### Added
- Feature A

[Unreleased]: https://github.com/user/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/user/repo/releases/tag/v1.2.0
```

---

#### D. Architecture Docs (System Design)

**Purpose**: Explain how the system works at a high level

**Location**: `/docs/architecture/` or `.cursor/setup/architecture.md`

**Types**:
- `architecture.md` — Overall system architecture
- `data-flow.md` — How data moves through the system
- `api-design.md` — API conventions and patterns
- `security.md` — Security model and threat analysis
- `performance.md` — Performance characteristics and optimization strategies

**Required Content**:
- High-level diagrams (ASCII or Mermaid)
- Architectural patterns used (layered, hexagonal, event-driven)
- Technology choices and rationale
- Integration points (databases, external APIs, native bindings)
- Deployment topology

---

#### E. ADRs (Architectural Decision Records)

**Purpose**: Document WHY significant decisions were made

**Location**: `/.cursor/adr/` or `/docs/decisions/`

**Format**: MADR (Markdown Any Decision Records)

**File Naming**: `YYYYMMDD-descriptive-title.md`

**Template**:
```markdown
# ADR-001: Use Zustand for State Management

## Status: Accepted

**Date**: 2024-02-12

## Context

We need a state management solution for the React app. The app has:
- Multiple components needing shared state
- Complex async data fetching
- Performance requirements (no unnecessary re-renders)

## Decision

Use Zustand for global state management.

## Consequences

### Positive
- Simple API, minimal boilerplate
- Excellent TypeScript support
- Good performance (subscription-based updates)
- Easy to test (plain functions)

### Negative
- Less mature ecosystem than Redux
- No time-travel debugging (unless using devtools)
- Not as well-known (steeper learning curve for new contributors)

## Alternatives Considered

### Redux Toolkit
- **Pros**: Battle-tested, huge ecosystem, excellent DevTools
- **Cons**: More boilerplate, steeper learning curve, performance overhead
- **Why Rejected**: Too much boilerplate for this project's size

### React Context
- **Pros**: Built-in, no dependencies, simple
- **Cons**: Performance issues with frequent updates, re-render entire tree
- **Why Rejected**: Performance concerns for large component trees

### Jotai
- **Pros**: Atomic state, very lightweight, great TypeScript
- **Cons**: Newer, smaller community, different mental model
- **Why Rejected**: Prefer Zustand's centralized store pattern
```

---

#### F. API Reference (Endpoint Documentation)

**Purpose**: Document all API endpoints for frontend consumption

**Location**: `/docs/api/` or inline in code (JSDoc)

**Template per Endpoint**:
```markdown
## GET /api/projects

> Retrieve a list of all projects

### Request

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number for pagination |
| `perPage` | number | No | 10 | Items per page (max 100) |
| `status` | string | No | `all` | Filter by status: `active`, `archived`, `all` |

**Headers**:
```
Authorization: Bearer {token}
```

### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "proj_123",
      "name": "My Project",
      "status": "active",
      "createdAt": "2024-02-12T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "perPage": 10,
    "total": 42
  }
}
```

**Error (400 Bad Request)**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PAGE",
    "message": "Page number must be positive"
  }
}
```

### Example

```bash
curl -X GET "https://api.example.com/projects?page=1&status=active" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Notes
- Results are sorted by `createdAt` descending (newest first)
- Rate limit: 100 requests per minute per user
- Requires authentication
```

---

#### G. Component Documentation (UI Components)

**Purpose**: Document React/Vue components for reuse

**Location**: Co-located with component or `/docs/components/`

**Template**:
```markdown
# Button

> A customizable button component with multiple variants and sizes

## Usage

```tsx
import { Button } from '@/components/ui/button'

function App() {
  return (
    <Button variant="primary" size="lg" onClick={handleClick}>
      Click Me
    </Button>
  )
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'link'` | `'primary'` | No | Visual style of the button |
| `size` | `'sm' \| 'default' \| 'lg' \| 'icon'` | `'default'` | No | Button size |
| `onClick` | `() => void` | - | Yes | Click handler |
| `disabled` | `boolean` | `false` | No | Whether button is disabled |
| `loading` | `boolean` | `false` | No | Show loading spinner |
| `children` | `React.ReactNode` | - | Yes | Button content |

## Variants

### Primary
```tsx
<Button variant="primary">Primary Action</Button>
```

### Secondary
```tsx
<Button variant="secondary">Secondary Action</Button>
```

### Outline
```tsx
<Button variant="outline">Outline Button</Button>
```

## States

- **Default**: Normal appearance
- **Hover**: Slightly darker background
- **Active**: Pressed appearance (scale-95)
- **Focus**: Visible focus ring (keyboard navigation)
- **Disabled**: Reduced opacity, no interaction
- **Loading**: Spinner + disabled state

## Accessibility

- Uses semantic `<button>` element
- Supports keyboard interaction (Enter/Space)
- Includes `aria-disabled` when disabled
- Loading state announces via `aria-busy`

## Related Components

- [IconButton](/docs/components/IconButton.md) - Button with icon only
- [LinkButton](/docs/components/LinkButton.md) - Button styled as link
```

---

#### H. Guides & Tutorials (How-To Docs)

**Purpose**: Step-by-step instructions for common tasks

**Location**: `/docs/guides/`

**Types**:
- Getting started guides
- Feature tutorials
- Migration guides
- Troubleshooting guides
- Best practices

**Template**:
```markdown
# How to Add a New Page

This guide walks you through adding a new page to the Next.js app.

## Prerequisites

- Basic understanding of Next.js App Router
- Development environment set up

## Steps

### 1. Create the Route Folder

```bash
mkdir -p src/app/my-page
```

### 2. Add page.tsx

```tsx
// src/app/my-page/page.tsx
export default function MyPage() {
  return (
    <div>
      <h1>My New Page</h1>
      <p>Welcome to my page!</p>
    </div>
  )
}
```

### 3. (Optional) Add a Layout

```tsx
// src/app/my-page/layout.tsx
export default function MyPageLayout({ children }) {
  return (
    <div className="container mx-auto">
      {children}
    </div>
  )
}
```

### 4. Add to Navigation

```tsx
// src/components/Sidebar.tsx
<NavLink href="/my-page">My Page</NavLink>
```

### 5. Test

```bash
npm run dev
# Visit http://localhost:3000/my-page
```

## Next Steps

- [Add data fetching](/docs/guides/data-fetching.md)
- [Add authentication](/docs/guides/authentication.md)

## Troubleshooting

**"Page not found" error**
- Make sure the folder name matches the URL path
- Restart the dev server (`npm run dev`)

**"Hydration mismatch" error**
- Check for client-only code in server components
- Add `'use client'` directive if needed
```

---

#### I. Runbooks (Operational Procedures)

**Purpose**: Step-by-step procedures for ops tasks

**Location**: `/docs/runbooks/`

**Types**:
- Deployment procedures
- Rollback procedures
- Incident response
- Database migrations
- Backup and restore

**Template**:
```markdown
# Runbook: Production Deployment

**Frequency**: On-demand (usually after sprint)
**Estimated Time**: 15-30 minutes
**Risk Level**: Medium

## Prerequisites

- [ ] All tests passing on `main` branch
- [ ] Changelog updated
- [ ] Staging environment tested
- [ ] Database migrations (if any) reviewed
- [ ] Stakeholders notified (if breaking changes)

## Deployment Steps

### 1. Create Release Branch

```bash
git checkout main
git pull origin main
git checkout -b release/v1.2.0
```

### 2. Update Version

```bash
npm version minor  # or major, patch
# This updates package.json and creates a git tag
```

### 3. Push to GitHub

```bash
git push origin release/v1.2.0
git push origin v1.2.0  # Push the tag
```

### 4. Merge to Main

Create PR: `release/v1.2.0` → `main`
- Get approval from at least 1 reviewer
- Merge (do NOT squash, preserve commits)

### 5. Deploy to Production

The GitHub Action will automatically deploy to Vercel.

Monitor: https://vercel.com/your-org/your-app/deployments

### 6. Verify Deployment

- [ ] Visit https://app.example.com (check it loads)
- [ ] Test critical user flows (login, create project, etc.)
- [ ] Check error monitoring (Sentry: no new errors)
- [ ] Check performance metrics (Vercel Analytics)

### 7. Announce

- Post in #releases Slack channel
- Tweet (if public release)
- Update status page (if applicable)

## Rollback Procedure

**If deployment fails or introduces critical bug:**

1. Go to Vercel dashboard
2. Find the previous successful deployment
3. Click "Promote to Production"
4. Investigate issue, create hotfix branch
5. Deploy hotfix following same process

## Monitoring

- **Errors**: https://sentry.io/your-org/your-app
- **Logs**: Vercel logs or `npx vercel logs --prod`
- **Metrics**: Vercel Analytics

## Post-Deployment

- [ ] Archive the release branch (delete after 1 week)
- [ ] Update documentation if needed
- [ ] Retrospective (what went well, what to improve)
```

---

#### J. Inline Code Documentation (TSDoc / JSDoc)

**Purpose**: Document functions, classes, types directly in code

**Format**: TSDoc (TypeScript) or JSDoc (JavaScript)

**When to Use**:
- Public APIs (exported functions, classes, types)
- Complex algorithms (explain non-obvious logic)
- Configuration objects (document each option)

**Template**:
```typescript
/**
 * Fetches a list of projects from the API with optional filtering
 * 
 * @param options - Query options for filtering and pagination
 * @param options.status - Filter by project status (default: 'all')
 * @param options.page - Page number for pagination (default: 1)
 * @param options.perPage - Items per page (default: 10, max: 100)
 * 
 * @returns Promise resolving to paginated list of projects
 * 
 * @throws {ApiError} If API request fails
 * @throws {ValidationError} If parameters are invalid
 * 
 * @example
 * ```typescript
 * const projects = await fetchProjects({ status: 'active', page: 1 })
 * console.log(projects.items) // Array of Project objects
 * ```
 * 
 * @see {@link Project} for project type definition
 * @see {@link https://docs.example.com/api/projects | API Reference}
 */
export async function fetchProjects(options?: FetchProjectsOptions): Promise<PaginatedList<Project>> {
  // Implementation
}
```

**TSDoc Tags**:
- `@param` — Parameter documentation
- `@returns` — Return value documentation
- `@throws` — Exceptions that can be thrown
- `@example` — Usage example (runnable code)
- `@see` — Links to related docs
- `@deprecated` — Mark deprecated APIs
- `@internal` — Mark internal-only APIs (not public)

---

### 3. DOCUMENTATION STANDARDS & STYLE GUIDE

#### A. Writing Style

**Voice & Tone**:
- **Active voice**: "Run `npm install`" (not "npm install should be run")
- **Second person**: "You can deploy by..." (not "One can deploy by...")
- **Direct, concise**: Avoid filler words like "simply", "just", "obviously"
- **Present tense**: "The function returns" (not "will return" or "would return")

**Sentence Structure**:
- **Max 25 words per sentence** (break up long sentences)
- **Max 4 sentences per paragraph** (use whitespace)
- **One idea per paragraph**

**Jargon & Terminology**:
- Define technical terms on first use
- Link to glossary for repeated terms
- Avoid acronyms unless universally known (API, URL = OK; CRDT = define first)

**Forbidden Phrases** (Never Use):
- "simply" / "just" / "obviously" / "easy" (assumes reader knowledge)
- "should work" / "might work" (be definitive: "works" or "doesn't work")
- "etc." (be exhaustive or say "for example")

---

#### B. Markdown Conventions

**Headers**:
- One `#` (H1) per document (the title)
- Use `##`, `###`, `####` (max 4 levels)
- Skip levels (H2 → H4) is forbidden

**Code Blocks**:
- Always specify language: ` ```typescript`, ` ```bash`, ` ```json`
- No language = plain text: ` ```
- Include full context (imports, declarations) or note what's omitted

**Admonitions** (Callouts):
Use blockquotes with emoji prefixes:
```markdown
> ⚠️ **Warning**: This action is irreversible!

> 💡 **Tip**: You can use the keyboard shortcut `⌘K` to open the command palette.

> 📌 **Note**: The API is rate-limited to 100 requests per minute.

> 🚨 **Critical**: Never commit API keys to the repository!

> ✅ **Success**: Deployment complete! View at https://example.com
```

**Links**:
- **Internal docs**: Relative paths (`[Architecture](/docs/architecture.md)`)
- **External docs**: Full URLs (`[Next.js Docs](https://nextjs.org/docs)`)
- **Anchor links**: `[Section](#section-title)` (lowercase, hyphens)

**Tables**:
- Use for structured data (parameters, comparisons, options)
- Align columns with `|---|---|` syntax
- Include header row always

**Lists**:
- Unordered: `-` (not `*` or `+`)
- Ordered: `1.`, `2.`, `3.` (auto-increment)
- Nested: Indent 2 spaces
- Checkbox lists: `- [ ]` (unchecked), `- [x]` (checked)

---

#### C. Code Examples

**Every Code Example Must Be:**
1. **Runnable**: Copy-paste should work (no pseudo-code)
2. **Complete**: Include imports, types, minimal context
3. **Tested**: Ideally run through automated tests
4. **Realistic**: Use real variable names, not `foo`/`bar`

**Pattern for Examples**:
```typescript
// ✅ GOOD: Complete, runnable example
import { Button } from '@/components/ui/button'

function MyComponent() {
  const handleClick = () => {
    console.log('Button clicked')
  }
  
  return <Button onClick={handleClick}>Click Me</Button>
}

// ❌ BAD: Incomplete, unclear context
<Button onClick={handleClick}>Click Me</Button>
```

**Show Expected Output**:
```bash
$ npm run build
> Building application...
> ✓ Compiled successfully
> Build output: .next/
```

**Show Both Correct and Incorrect Patterns**:
```typescript
// ❌ DON'T: Mutate props directly
function Component({ items }) {
  items.push(newItem) // This mutates the prop!
}

// ✅ DO: Create new array
function Component({ items, onItemsChange }) {
  onItemsChange([...items, newItem])
}
```

---

#### D. File Naming Conventions

**Documentation Files**:
- Kebab-case: `getting-started.md`, `api-reference.md`
- Descriptive: `how-to-deploy.md` (not `deploy.md`)
- ADRs: `YYYYMMDD-descriptive-title.md` (e.g., `20240212-use-zustand.md`)
- Ordered sequences: `01-installation.md`, `02-configuration.md`

**Avoid**:
- Spaces: `getting started.md` ❌ (breaks links)
- Underscores: `getting_started.md` ❌ (prefer hyphens)
- UPPERCASE: `GETTING-STARTED.MD` ❌ (inconsistent with conventions)

---

### 4. DOCUMENTATION FOR AI AGENTS

AI agents need special documentation to function effectively:

#### A. Context Files (`.cursor/setup/`)

**Purpose**: Provide AI agents with high-level project context

**Required Files**:
- `design.md` — Design system, color tokens, component patterns
- `architecture.md` — System architecture, data flow, tech stack
- `ideas.md` — Roadmap, feature backlog, innovation ideas
- `documentation.md` — (This file!) Documentation standards
- `testing.md` — Testing strategy, frameworks, standards

**Writing for AI Agents**:
- **Be Explicit**: Never assume implicit context
- **Use Tables**: Structured data > prose for LLMs
- **Include File Paths**: Always provide exact paths (`src/components/Button.tsx`)
- **Define Vocabulary**: Use consistent terminology
- **Provide Examples**: Code snippets for every pattern
- **When to Use / When NOT to Use**: Prevent misuse

---

#### B. Agent Instruction Files (`.cursor/agents/`)

**Purpose**: Define AI agent roles, responsibilities, workflows

**Template**:
```markdown
# [Agent Name]

**Description**: [One-line role description]

**Agent Type**: [general-purpose | specialist | reviewer]

---

## Role

[2-3 paragraphs explaining what this agent does]

## Responsibilities

1. **[Responsibility #1]** - [Description]
2. **[Responsibility #2]** - [Description]
3. **[Responsibility #3]** - [Description]

## Workflow

### 1. [Step Name]
[Detailed instructions with code examples]

### 2. [Step Name]
[Detailed instructions]

## Best Practices

- [Practice #1]
- [Practice #2]

## Anti-Patterns (Avoid These)

- ❌ **[Anti-pattern]**: [Why it's bad]
- ✅ **[Correct pattern]**: [Why it's good]

## Checklist Before Completion

- [ ] [Checkpoint #1]
- [ ] [Checkpoint #2]
- [ ] [Checkpoint #3]

## Handoff

After completing this role, hand off to:
- **[Next Agent]**: [When to invoke, what to tell them]
```

---

### 5. DOCUMENTATION MAINTENANCE & GOVERNANCE

#### A. Update Cadence

**When to Update Docs**:
- **Every PR**: If code changes public API, docs MUST be updated in same PR
- **Sprint Retrospectives**: Review docs for accuracy, update if stale
- **Major Releases**: Comprehensive doc review, changelog update
- **Quarterly**: Deep dive on docs health (broken links, outdated content)

**Who Updates Docs**:
- **Code Author**: Responsible for updating docs in their PR
- **Reviewer**: Checks that docs are updated, accurate, complete
- **Maintainer**: Quarterly audits, strategic improvements

---

#### B. Documentation Review Process

**Docs Checklist for PR Reviewers**:
- [ ] New public APIs have TSDoc comments
- [ ] README updated if setup/usage changed
- [ ] CHANGELOG updated (if versioned release)
- [ ] Migration guide added (if breaking change)
- [ ] Examples are runnable (tested)
- [ ] Links are not broken (internal + external)
- [ ] Screenshots are up-to-date (if UI changed)

---

#### C. Staleness Detection

**How to Identify Outdated Docs**:
- **"Last Updated" dates** in doc headers (> 6 months = flag for review)
- **Broken links** (CI job checks links daily)
- **Code references** that no longer exist (grep for function names in docs)
- **Issue/PR labels** (`docs-needed`, `docs-outdated`)

**Automated Checks** (CI):
```yaml
# .github/workflows/docs.yml
name: Docs Health Check
on: [pull_request, schedule]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check for broken links
        run: npx markdown-link-check docs/**/*.md
      - name: Check code examples compile
        run: npm run test:docs
```

---

#### D. "Docs-or-It-Didn't-Happen" Rule

**Policy**: Any PR that adds/changes public APIs MUST include documentation updates.

**Enforcement**:
- GitHub branch protection: Require "docs-updated" label
- PR template: Checkbox for "Documentation updated"
- CI check: Fail if docs/ folder hasn't changed and API changed

**Exceptions**:
- Hotfixes (critical bugs, security patches) — docs can be updated in follow-up PR
- Internal/private APIs (but document intention to keep private)

---

### 6. DOCUMENTATION TESTING

#### A. Link Checking

```bash
npx markdown-link-check docs/**/*.md
```

**CI Integration**:
- Run on every PR
- Fail if broken links found
- Allow temporary skips with comment: `<!-- markdown-link-check-disable -->`

---

#### B. Example Validation

**All code examples should be tested**:

**Approach 1: Extract examples to test files**
```typescript
// docs/examples/button.test.tsx
import { render } from '@testing-library/react'
import { Button } from '@/components/ui/button'

// This code is also in docs/components/button.md
test('button example from docs', () => {
  const { getByText } = render(<Button>Click Me</Button>)
  expect(getByText('Click Me')).toBeInTheDocument()
})
```

**Approach 2: Doctest-style** (parse markdown, extract code blocks, run)

---

#### C. Screenshot Diffing

**For UI component docs**:
- Capture screenshot of component in Storybook
- Compare to screenshot in docs (Playwright visual regression)
- Alert if mismatch (component changed but docs didn't)

---

### 7. TEMPLATES FOR COMMON DOCS

Provide copy-paste-ready templates for each major doc type:

#### Template 1: README.md
[Provide complete, real-world README template]

#### Template 2: CONTRIBUTING.md
[Provide complete contributing guide template]

#### Template 3: ADR (Architectural Decision Record)
[Already provided above]

#### Template 4: API Endpoint Documentation
[Already provided above]

#### Template 5: Component Documentation
[Already provided above]

#### Template 6: How-To Guide
[Already provided above]

#### Template 7: Runbook
[Already provided above]

---

### 8. GLOSSARY

Define key project-specific terms that should be used consistently:

| Term | Definition | Example Usage |
|------|------------|---------------|
| **Prompt** | A template for AI input | "Create a new prompt for generating READMEs" |
| **Project** | Top-level organizational unit | "Each project contains multiple features" |
| **Ticket** | A unit of work (task, bug, epic) | "Move the ticket to 'In Progress'" |
| **Feature** | A user-facing capability | "The authentication feature is complete" |
| **Run** | Execution of an automated workflow | "The prompt run completed successfully" |
| **Agent** | An AI role with specific responsibilities | "The frontend-dev agent creates UI components" |
| **Setup File** | AI context document | "The design.md setup file defines color tokens" |
| **ADR** | Architectural Decision Record | "See ADR-003 for the database choice rationale" |

---

## FORMATTING REQUIREMENTS

1. Use markdown with clear headers (##, ###, ####)
2. Provide complete, copy-paste-ready templates
3. Use tables for comparisons, checklists, parameters
4. Use code blocks with language tags (markdown, typescript, bash)
5. Use blockquotes for warnings/tips (with emoji prefixes)
6. Be SPECIFIC and ENFORCEABLE (no vague guidance)
7. Target 700-1000 lines

---

## FINAL OUTPUT STRUCTURE

```markdown
# Documentation Standards & Strategy — [Project Name]

**Version**: 1.0  
**Last Updated**: [Date]  
**Author**: Technical Documentation Architect (AI)

---

## Documentation Landscape

[Brief analysis of current state]

---

## 1. Documentation Philosophy

[Content]

---

## 2. Documentation Types & Hierarchy

[Content for all 10 types: README, CONTRIBUTING, CHANGELOG, Architecture, ADRs, API Ref, Component Docs, Guides, Runbooks, Inline Docs]

---

## 3. Documentation Standards & Style Guide

[Content: Writing Style, Markdown Conventions, Code Examples, File Naming]

---

## 4. Documentation for AI Agents

[Content: Context Files, Agent Instruction Files]

---

## 5. Documentation Maintenance & Governance

[Content: Update Cadence, Review Process, Staleness Detection, Docs-or-It-Didn't-Happen Rule]

---

## 6. Documentation Testing

[Content: Link Checking, Example Validation, Screenshot Diffing]

---

## 7. Templates for Common Docs

[7+ complete templates]

---

## 8. Glossary

[Project-specific terminology]

---

## Appendix: Quick Reference

### Documentation Checklist for PRs
- [ ] Public APIs have TSDoc comments
- [ ] README updated if needed
- [ ] CHANGELOG updated (if versioned)
- [ ] Migration guide (if breaking change)
- [ ] Examples are runnable
- [ ] Links checked (not broken)
- [ ] Screenshots updated (if UI changed)

### Markdown Quick Reference
[Table of markdown syntax]

---

*This documentation guide is a living standard. Update it as best practices evolve.*
```

---

## FINAL INSTRUCTION

Generate the complete `documentation.md` .cursor/setup file NOW. Be comprehensive, actionable, and provide complete templates. Reference the actual project structure where possible. Make it the definitive documentation strategy for this project.