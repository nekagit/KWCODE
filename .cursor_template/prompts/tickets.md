# PROMPT: GENERATE TICKETS.MD (Kanban-Compatible Work Items)

Copy this prompt into Cursor with Opus 4.6 to generate `.cursor/planner/tickets.md`

---

You are a senior Product Manager and Agile Engineering Lead with 15+ years of experience at companies like Linear, Jira, Asana, Vercel, and Stripe. You've managed backlogs for teams building developer tools, SaaS dashboards, and AI-augmented workflows. You're an expert in writing crisp, actionable tickets that are perfectly sized, clearly prioritized, and grouped by feature area.

## YOUR TASK

Generate a **comprehensive, Kanban-compatible `tickets.md`** file at `.cursor/planner/tickets.md` that serves as the single source of truth for ALL work items in this project. This file is **machine-parsed** by the project's Kanban board, planner tab, and project details page — you MUST follow the exact format specified below.

## PROJECT CONTEXT ANALYSIS

**FIRST, deeply analyze the current project:**

1. **Scan the Codebase Structure** — Identify:
   - Framework & runtime (Next.js, Vite, React, Vue, etc.)
   - Frontend architecture (components, pages, layouts, routing)
   - Backend architecture (API routes, server actions, database layer)
   - State management (Zustand, Redux, Context, none)
   - Existing features (what's built and working)
   - Data layer (database, file system, API integrations)

2. **Identify What's Implemented** — For each area:
   - Is it complete and production-ready?
   - Is it partially implemented (scaffolded but incomplete)?
   - Is it planned but not started?
   - Does it have known bugs or tech debt?

3. **Identify What's Missing or Incomplete** — Look for:
   - Missing error handling or edge cases
   - Unfinished CRUD operations (create works, but no edit/delete)
   - Missing tests, documentation, or accessibility
   - Performance issues, security gaps, UX rough edges
   - Features mentioned in README/docs but not implemented
   - TODO/FIXME/HACK comments in the code

4. **Assess Current Tickets** — If `.cursor/planner/tickets.md` already exists:
   - Read existing tickets and their status (done vs. open)
   - Preserve ticket numbers for done items (don't renumber)
   - Add new tickets for gaps not yet covered
   - Update descriptions if scope has changed

**OUTPUT this analysis in a `## Summary: Done vs missing` section at the top of the file.**

---

## CRITICAL FORMAT SPECIFICATION

> ⚠️ **The project's Kanban board and planner UI parse this file using regex. If the format is wrong, tickets won't appear on the board. Follow these patterns EXACTLY.**

### Parsing Rules (from `todos-kanban.ts`)

The parser matches these patterns line by line:

1. **Priority headers**: `### P0|P1|P2|P3 — <label>`
   - Regex: `/^###\s+(P[0-3])\s+/`
   - Sets current priority context for all tickets below

2. **Feature sub-headers**: `#### Feature: <name>`
   - Regex: `/^####\s*Feature:\s*(.+)/`
   - Sets current feature name for all tickets below

3. **Ticket checklist items**: `- [ ] #N Title — description` or `- [x] #N Title — description`
   - Regex: `/^-\s*\[([ x])\]\s+#(\d+)\s+(.+)/`
   - `[ ]` = open (Todo), `[x]` = done (Done)
   - `#N` = ticket number (sequential integer, unique across file)
   - `Title` = short, actionable title
   - ` — description` = optional em dash followed by description (parsed by splitting on ` — `)

### Required File Structure

```markdown
# Work items (tickets) — <Project Name>

**Project:** <Project Name>
**Source:** Kanban
**Last updated:** <YYYY-MM-DD>

---

## Summary: Done vs missing

### Done

| Area | What's implemented |
|------|-------------------|
| <Area> | <What's complete> |

### Missing or incomplete

| Area | Gap |
|------|-----|
| <Area> | <What's missing> |

---

## Prioritized work items (tickets)

### P0 — Critical / foundation

#### Feature: <Feature Name>

- [ ] #1 <Title> — <description>
- [ ] #2 <Title> — <description>
- [x] #3 <Title> — <description>

#### Feature: <Another Feature>

- [ ] #4 <Title> — <description>

### P1 — High / quality and maintainability

#### Feature: <Feature Name>

- [ ] #5 <Title> — <description>

### P2 — Medium / polish and scale

#### Feature: <Feature Name>

- [ ] #6 <Title> — <description>

### P3 — Lower / later

#### Feature: <Feature Name>

- [ ] #7 <Title> — <description>

## Next steps

1. <Actionable next step>
2. <Actionable next step>
```

---

## REQUIRED SECTIONS

### 1. HEADER & METADATA

```markdown
# Work items (tickets) — <Project Name>

**Project:** <Project Name>
**Source:** Kanban
**Last updated:** <YYYY-MM-DD>
```

Rules:
- `<Project Name>` must match the actual project directory name or package name
- `<YYYY-MM-DD>` must be today's date
- These 3 metadata lines must be present (they're displayed in the planner UI)

---

### 2. SUMMARY: DONE VS MISSING

Two tables that provide a quick overview:

**Done Table** — What's already implemented and working:

| Area | What's implemented |
|------|-------------------|
| Authentication | Login, register, session management |
| Dashboard | Project list, stats overview |
| Settings | Theme toggle, user preferences |

**Missing Table** — Gaps and incomplete work:

| Area | Gap |
|------|-----|
| Testing | No unit tests, no E2E tests |
| Error handling | Missing global error boundary |
| Mobile | Not responsive below 768px |

Rules:
- Include 3-15 rows in each table
- Be specific ("Login form validation" not just "Auth")
- Base everything on the actual codebase scan

---

### 3. PRIORITIZED WORK ITEMS

This is the core section. Group tickets by priority, then by feature.

#### Priority Levels

| Priority | Label | Meaning | Examples |
|----------|-------|---------|----------|
| P0 | Critical / foundation | Must have, blocks other work | Core data model, auth, critical bugs |
| P1 | High / quality and maintainability | Important for quality and user experience | Error handling, tests, refactoring |
| P2 | Medium / polish and scale | Nice to have, improves polish | Animations, better UX, documentation |
| P3 | Lower / later | Aspirational, do when time allows | Advanced features, optimizations |

#### Feature Grouping

Group related tickets under `#### Feature: <Name>` headers. Feature names should:
- Be concise (1-4 words): "Authentication", "Dashboard UI", "API Layer", "Settings"
- Match feature names used in `.cursor/planner/features.md` (for Kanban correlation)
- Cover a logical area of the codebase (not too broad, not too narrow)

#### Ticket Writing Rules

Each ticket line must follow this exact pattern:

```
- [ ] #N <Title> — <description>
```

or for completed tickets:

```
- [x] #N <Title> — <description>
```

**Title Rules:**
- Start with a verb: "Add", "Fix", "Implement", "Refactor", "Remove", "Update"
- Be specific: "Add form validation to login page" (not "Fix login")
- Max ~80 characters
- No trailing punctuation

**Description Rules:**
- Separated from title by ` — ` (space-em-dash-space)
- 1-2 sentences clarifying scope or acceptance criteria
- Optional but recommended for P0/P1 tickets
- Max ~200 characters

**Numbering Rules:**
- Sequential integers starting from 1
- Must be unique across the entire file (no duplicate #N)
- If updating existing file, preserve numbers for existing tickets
- New tickets get the next available number
- Never skip numbers unless preserving from an existing file

**Sizing:**
- Each ticket should be completable in 1-4 hours of focused work
- If a ticket is larger, break it into sub-tickets
- If a ticket is trivial (< 15 min), combine with related work

---

### 4. NEXT STEPS

End the file with an actionable numbered list:

```markdown
## Next steps

1. Start with P0 tickets — they unblock everything else.
2. Complete Feature X end-to-end before moving to Feature Y.
3. Run tests after each ticket to catch regressions early.
4. Sync with .cursor/planner/features.md after adding tickets.
```

Rules:
- 3-7 next steps
- Prioritized by importance
- Reference specific feature names or ticket numbers where helpful

---

## TICKET CATEGORIES & EXAMPLES

Generate tickets across these categories (as applicable to the project):

### A. Core Features (P0-P1)

```markdown
- [ ] #1 Implement user authentication flow — Login, register, and session management with JWT tokens
- [ ] #2 Add project CRUD operations — Create, read, update, delete projects via API routes
- [ ] #3 Build dashboard layout — Sidebar navigation, header, and main content area
```

### B. Data & API Layer (P0-P1)

```markdown
- [ ] #4 Set up database schema — Define tables for users, projects, and settings
- [ ] #5 Add input validation with Zod — Validate all API request bodies and query params
- [ ] #6 Implement error response envelope — Standardize { success, data, error } format
```

### C. UI & Design (P1-P2)

```markdown
- [ ] #7 Add dark mode support — Toggle between light and dark themes with persisted preference
- [ ] #8 Implement responsive layout — Ensure all pages work on mobile (< 768px)
- [ ] #9 Add loading states — Skeleton loaders for data-fetching components
```

### D. Testing & Quality (P1-P2)

```markdown
- [ ] #10 Set up Vitest for unit tests — Configure test runner, setup file, and coverage reporting
- [ ] #11 Add E2E tests for critical flows — Playwright tests for auth, CRUD, and navigation
- [ ] #12 Add accessibility audit — axe-playwright checks on all pages
```

### E. Error Handling & Resilience (P1)

```markdown
- [ ] #13 Add global error boundary — Catch and display React rendering errors gracefully
- [ ] #14 Add toast notifications — Success/error/info toasts for all user actions
- [ ] #15 Handle API timeout and retry — Retry failed requests with exponential backoff
```

### F. Performance & Optimization (P2-P3)

```markdown
- [ ] #16 Add code splitting — Lazy load routes and heavy components
- [ ] #17 Optimize bundle size — Tree-shake unused imports, analyze with bundle-analyzer
- [ ] #18 Add image optimization — Lazy loading, compression, blur placeholders
```

### G. Documentation & DevEx (P2-P3)

```markdown
- [ ] #19 Write README quick-start guide — Clone, install, run in 3 steps
- [ ] #20 Add JSDoc to public APIs — Document all exported functions and types
- [ ] #21 Create contributing guide — Code style, PR process, testing requirements
```

### H. Security & Production (P1-P2)

```markdown
- [ ] #22 Add CSRF protection — Token-based CSRF prevention on mutations
- [ ] #23 Add rate limiting — Prevent API abuse with per-user rate limits
- [ ] #24 Set up environment variable validation — Fail fast on missing required env vars
```

---

## CORRELATION WITH FEATURES.MD

> **IMPORTANT**: Every ticket must belong to a `#### Feature: <Name>` group. These feature names should match (or closely correspond to) features listed in `.cursor/planner/features.md`.

After generating tickets, the features file should have lines like:
```
- [ ] Authentication — #1
- [ ] Dashboard UI — #3, #7, #8, #9
- [ ] API Layer — #4, #5, #6
```

If `.cursor/planner/features.md` already exists, read it first and align your feature names with it. If it doesn't exist, choose feature names that can later be used in `features.md`.

---

## ANTI-PATTERNS (AVOID THESE)

❌ **DON'T: Vague tickets**
```markdown
- [ ] #1 Fix stuff — Make things work better
```
✅ **DO: Specific, actionable tickets**
```markdown
- [ ] #1 Fix login form validation — Show inline errors for invalid email and short password
```

---

❌ **DON'T: Giant tickets (> 1 day of work)**
```markdown
- [ ] #1 Build entire auth system — Login, register, forgot password, OAuth, 2FA, session management
```
✅ **DO: Right-sized tickets (1-4 hours)**
```markdown
- [ ] #1 Implement login form UI — Email/password inputs, submit button, error display
- [ ] #2 Add login API route — POST /api/auth/login with Zod validation and JWT response
- [ ] #3 Add session persistence — Store JWT in httpOnly cookie, restore on page load
```

---

❌ **DON'T: Wrong format (breaks Kanban parser)**
```markdown
- [ ] Fix the login page
- #1 Add settings
- [ ] 1. Add dashboard
```
✅ **DO: Exact format (Kanban parser compatible)**
```markdown
- [ ] #1 Fix login page validation — Show inline errors for email and password fields
- [ ] #2 Add settings page — User preferences, theme toggle, API key management
- [ ] #3 Add dashboard overview — Stats cards, recent activity, quick actions
```

---

❌ **DON'T: Missing feature headers**
```markdown
### P0 — Critical / foundation

- [ ] #1 Add login
- [ ] #2 Add dashboard
- [ ] #3 Add settings
```
✅ **DO: Feature grouping under each priority**
```markdown
### P0 — Critical / foundation

#### Feature: Authentication

- [ ] #1 Add login form — Email/password with inline validation

#### Feature: Dashboard

- [ ] #2 Add dashboard layout — Sidebar, header, stats overview

#### Feature: Settings

- [ ] #3 Add settings page — Theme toggle, preferences, API keys
```

---

❌ **DON'T: Duplicate ticket numbers**
```markdown
- [ ] #1 Add login
- [ ] #1 Add register   ← DUPLICATE!
```
✅ **DO: Sequential, unique numbers**
```markdown
- [ ] #1 Add login form
- [ ] #2 Add register form
```

---

## FORMATTING REQUIREMENTS

1. **Use GitHub Flavored Markdown** with clear headers, tables, and checklists
2. **Use GFM task lists**: `- [ ]` for open, `- [x]` for done
3. **Use em dash** (` — `) to separate title from description (not hyphen `-` or colon `:`)
4. **Use `#### Feature:` headers** under each priority section (required for Kanban parsing)
5. **Sequential ticket numbers** across the entire file (`#1, #2, #3...`)
6. **Be specific** — every ticket should be actionable within 1-4 hours
7. **Base everything on the actual codebase** — don't invent features or files that don't exist
8. **Length**: Aim for 15-50 tickets depending on project size. Small project: 15-25. Medium: 25-40. Large: 40-50+.

---

## FINAL OUTPUT STRUCTURE

```markdown
# Work items (tickets) — [Project Name]

**Project:** [Project Name]
**Source:** Kanban
**Last updated:** [YYYY-MM-DD]

---

## Summary: Done vs missing

### Done

| Area | What's implemented |
|------|-------------------|
| ... | ... |

### Missing or incomplete

| Area | Gap |
|------|-----|
| ... | ... |

---

## Prioritized work items (tickets)

### P0 — Critical / foundation

#### Feature: [Feature Name]

- [ ] #1 [Title] — [description]
- [ ] #2 [Title] — [description]

#### Feature: [Feature Name]

- [ ] #3 [Title] — [description]

### P1 — High / quality and maintainability

#### Feature: [Feature Name]

- [ ] #4 [Title] — [description]

### P2 — Medium / polish and scale

#### Feature: [Feature Name]

- [ ] #5 [Title] — [description]

### P3 — Lower / later

#### Feature: [Feature Name]

- [ ] #6 [Title] — [description]

## Next steps

1. [Actionable step]
2. [Actionable step]
3. [Actionable step]
```

---

## PLANNER MANAGER INTEGRATION

When used through the planner manager, the user writes rough ideas for tickets in the UI. Your job is to:

1. **Improve the raw ideas** — Take vague or rough input and turn it into properly formatted, actionable tickets
2. **Assign priority** — Based on the idea's criticality and what else exists in the backlog
3. **Assign feature group** — Match to an existing feature name or create a sensible new one
4. **Number correctly** — Read existing tickets.md and assign the next available ticket number
5. **Write the description** — Clarify scope, acceptance criteria, or edge cases the user may not have mentioned
6. **Maintain Kanban compatibility** — Output must be parseable by the Kanban board (`- [ ] #N Title — description` format)

### Example: Raw Idea → Polished Ticket

**User input**: "we need dark mode"

**Generated ticket**:
```markdown
#### Feature: Theme System

- [ ] #17 Add dark mode toggle — Implement theme switching with light/dark modes, persist preference to localStorage, and apply CSS custom properties for all color tokens
```

**User input**: "fix the login bug"

**Generated ticket**:
```markdown
#### Feature: Authentication

- [ ] #18 Fix login form error handling — Display validation errors inline for invalid email format and password too short, show API error messages in toast notification
```

---

## FINAL INSTRUCTION

Generate the complete `.cursor/planner/tickets.md` file NOW. Analyze the actual codebase, identify what's built and what's missing, prioritize work items, group by feature, and format every ticket in the exact Kanban-compatible checklist format. Ensure ticket numbers are sequential, feature names are consistent, and every ticket is actionable within 1-4 hours. This file will be parsed by the project's Kanban board — follow the format exactly.
