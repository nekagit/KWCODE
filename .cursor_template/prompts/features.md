# PROMPT: GENERATE FEATURES.MD (Kanban-Compatible Features Roadmap)

Copy this prompt into Cursor with Opus 4.6 to generate `.cursor/planner/features.md`

---

You are a senior Product Strategist and Roadmap Architect with 15+ years of experience at companies like Linear, Notion, Vercel, Stripe, and Figma. You've designed feature roadmaps that align engineering backlogs with product vision, ensuring every feature maps to concrete work items. You're an expert in grouping tickets into meaningful features, tracking progress, and maintaining alignment between roadmaps and Kanban boards.

## YOUR TASK

Generate a **comprehensive, Kanban-compatible `features.md`** file at `.cursor/planner/features.md` that serves as the features roadmap for this project. This file groups work items (tickets) from `.cursor/planner/tickets.md` into logical features and is **machine-parsed** by the project's Kanban board, planner tab, and project details page — you MUST follow the exact format specified below.

## PROJECT CONTEXT ANALYSIS

**FIRST, deeply analyze the current project:**

1. **Read `.cursor/planner/tickets.md`** (REQUIRED)
   - This is your PRIMARY input — features MUST be derived from tickets
   - Parse all ticket numbers, titles, priorities, and feature names
   - Identify which `#### Feature: <Name>` groups exist
   - Note which tickets are done (`[x]`) vs. open (`[ ]`)

2. **Scan the Codebase** — Identify:
   - What major areas/modules exist (auth, dashboard, settings, API, etc.)
   - Which areas are complete vs. in progress vs. not started
   - The overall architecture and feature boundaries

3. **Identify Feature Boundaries** — Group tickets into features that:
   - Represent a coherent user-facing capability or technical area
   - Are meaningful (not too granular, not too broad)
   - Align with the `#### Feature:` headers already in `tickets.md`
   - Cover all tickets — no ticket should be left unassigned to a feature

4. **Assess Feature Completeness** — For each feature:
   - Are all its tickets done? → Mark feature as `[x]`
   - Are some tickets done? → Keep as `[ ]` (partially complete)
   - Are no tickets started? → Keep as `[ ]` (not started)

---

## CRITICAL FORMAT SPECIFICATION

> ⚠️ **The project's Kanban board and planner UI parse this file using regex. If the format is wrong, features won't appear on the board. Follow these patterns EXACTLY.**

### Parsing Rules (from `todos-kanban.ts`)

The parser matches this pattern per line:

1. **Feature checklist items**: `- [ ] Feature name — #1, #2` or `- [x] Feature name — #1, #2`
   - Regex: `/^-\s*\[([ x])\]\s+(.+)$/gm`
   - `[ ]` = in progress or not started
   - `[x]` = all tickets in this feature are done
   - Feature title is extracted by stripping trailing ticket refs
   - Ticket refs are extracted by regex: `/#(\d+)/g`

2. **Ticket reference format**: ` — #1, #2, #3`
   - Em dash (` — `) separates the feature name from ticket numbers
   - Each ticket number is prefixed with `#` and separated by `, `
   - Ticket numbers must correspond to actual tickets in `tickets.md`

### Required File Structure

```markdown
# Features roadmap

Features below are derived from `.cursor/planner/tickets.md`. Each major feature groups one or more work items (tickets); ticket numbers are listed so the Kanban and project details page parse and stay in sync.

## Major features

- [ ] Feature A (short description) — #1, #2, #3
- [ ] Feature B (short description) — #4, #5
- [x] Feature C (short description) — #6, #7
```

---

## REQUIRED SECTIONS

### 1. HEADER

```markdown
# Features roadmap
```

Rules:
- Must be exactly `# Features roadmap` (the serializer in `todos-kanban.ts` produces this exact title)
- Single H1, no variations

---

### 2. INTRODUCTION

```markdown
Features below are derived from `.cursor/planner/tickets.md`. Each major feature groups one or more work items (tickets); ticket numbers are listed so the Kanban and project details page parse and stay in sync.
```

Rules:
- 1-3 sentences explaining what this file is and how it relates to tickets
- Must mention `.cursor/planner/tickets.md` as the source
- Must mention Kanban/project details page for context

---

### 3. MAJOR FEATURES

```markdown
## Major features
```

This is the core section. Each line is a feature with its ticket refs:

```markdown
- [ ] Feature Name (optional short description) — #1, #2, #3
```

#### Feature Line Rules

**Checkbox State:**
- `[ ]` — Feature is not fully complete (some or all tickets still open)
- `[x]` — ALL tickets referenced by this feature are done

**Feature Name:**
- Concise: 1-5 words ("Authentication", "Dashboard UI", "Kanban Board", "Theme System")
- Must match the `#### Feature:` headers used in `tickets.md`
- Use Title Case

**Description (Optional):**
- In parentheses after the name: `Feature Name (short explanation)`
- 3-10 words clarifying scope
- Especially useful for non-obvious features

**Ticket References:**
- Separated from feature name/description by ` — ` (space-em-dash-space)
- Comma-separated: `#1, #2, #3`
- Each `#N` must correspond to a ticket number in `tickets.md`
- At least one ticket ref per feature (no orphan features)

**Ordering:**
- Features should be listed in priority order (P0 features first, then P1, etc.)
- Within same priority, order by importance or natural dependency flow
- Done features can be listed at the end or inline

---

## CORRELATION WITH TICKETS.MD

> **CRITICAL**: Features and tickets must be bidirectionally linked. This is validated by the `validateFeaturesTicketsCorrelation()` function in the planner UI.

### Correlation Rules

1. **Every feature must reference at least one ticket** — No orphan features without `#N` refs
2. **Every ticket should be in at least one feature** — Ideally, no tickets left out of all features
3. **Feature names must match** — The feature name in `features.md` should match (or closely align with) the `#### Feature: <Name>` headers in `tickets.md`
4. **Ticket numbers must exist** — Don't reference `#99` if ticket #99 doesn't exist in `tickets.md`
5. **Done state must be consistent** — If you mark a feature `[x]`, ALL referenced tickets should also be `[x]` in `tickets.md`

### Validation Checks (from `validateFeaturesTicketsCorrelation()`)

The planner UI runs these checks:

| Check | Outcome if Fails |
|-------|-----------------|
| Feature refs a ticket number not in tickets.md | ❌ Error: "Ticket number(s) in features.md not found in tickets.md: #N" |
| Feature has no ticket refs (`#N`) at all | ❌ Error: "features.md has checklist items without ticket refs" |
| Feature name in tickets.md has no matching feature in features.md | ❌ Error: "Feature name(s) without matching feature" |
| Ticket in tickets.md not referenced in any feature | ⚠️ Warning (info): "Ticket(s) not referenced in any feature" |

---

## FEATURE CATEGORIES & EXAMPLES

Generate features across these categories (as applicable to the project):

### A. Core Product Features

```markdown
- [ ] Authentication (login, register, session management) — #1, #2, #3
- [ ] Dashboard (project overview, stats, quick actions) — #4, #5, #6
- [ ] Project Management (CRUD operations for projects) — #7, #8, #9
```

### B. Data & API Features

```markdown
- [ ] API Layer (RESTful endpoints, validation, error handling) — #10, #11, #12
- [ ] Database (schema, migrations, seed data) — #13, #14
- [ ] Data Sync (real-time updates, cache invalidation) — #15, #16
```

### C. UI & Design Features

```markdown
- [ ] Theme System (light/dark mode, color themes) — #17, #18
- [ ] Responsive Layout (mobile, tablet, desktop breakpoints) — #19, #20
- [ ] Component Library (buttons, cards, modals, forms) — #21, #22, #23
```

### D. Quality & Infrastructure Features

```markdown
- [ ] Testing Infrastructure (unit, integration, E2E tests) — #24, #25, #26
- [ ] Error Handling (boundaries, toasts, logging) — #27, #28
- [ ] Performance (code splitting, lazy loading, optimization) — #29, #30
```

### E. Documentation & DevEx Features

```markdown
- [ ] Documentation (README, API docs, contributing guide) — #31, #32, #33
- [ ] Developer Experience (linting, formatting, CI/CD) — #34, #35
```

---

## ANTI-PATTERNS (AVOID THESE)

❌ **DON'T: Features without ticket refs**
```markdown
- [ ] Authentication
- [ ] Dashboard
```
✅ **DO: Features with ticket refs**
```markdown
- [ ] Authentication — #1, #2, #3
- [ ] Dashboard — #4, #5, #6
```

---

❌ **DON'T: Wrong checkbox format**
```markdown
- [] Authentication — #1     ← No space in []
- [X] Dashboard — #2         ← Uppercase X
- Authentication — #3        ← No checkbox at all
```
✅ **DO: Correct checkbox format**
```markdown
- [ ] Authentication — #1
- [x] Dashboard — #2
```

---

❌ **DON'T: Hyphen instead of em dash**
```markdown
- [ ] Authentication - #1, #2    ← Regular hyphen
```
✅ **DO: Em dash with spaces**
```markdown
- [ ] Authentication — #1, #2   ← Em dash with spaces
```

---

❌ **DON'T: Invalid ticket numbers**
```markdown
- [ ] Authentication — #99, #100   ← These don't exist in tickets.md!
```
✅ **DO: Valid ticket numbers from tickets.md**
```markdown
- [ ] Authentication — #1, #2, #3  ← These exist in tickets.md
```

---

❌ **DON'T: Feature marked done but tickets are open**
```markdown
- [x] Authentication — #1, #2   ← But #1 is [ ] in tickets.md!
```
✅ **DO: Feature done only when all tickets done**
```markdown
- [ ] Authentication — #1, #2   ← #1 is still [ ], so feature is [ ]
```

---

❌ **DON'T: One giant feature with all tickets**
```markdown
- [ ] Everything — #1, #2, #3, #4, #5, #6, #7, #8, #9, #10, #11, #12
```
✅ **DO: Meaningful feature grouping (3-8 tickets per feature)**
```markdown
- [ ] Authentication — #1, #2, #3
- [ ] Dashboard — #4, #5, #6
- [ ] Settings — #7, #8, #9
- [ ] API Layer — #10, #11, #12
```

---

## FORMATTING REQUIREMENTS

1. **Use GitHub Flavored Markdown** with clear headers and checklists
2. **Use GFM task lists**: `- [ ]` for open features, `- [x]` for done features
3. **Use em dash** (` — `) to separate feature name from ticket refs (not hyphen or colon)
4. **Use comma-separated `#N` refs**: `#1, #2, #3` (not `1, 2, 3` or `ticket-1, ticket-2`)
5. **One feature per line** — no multi-line features or nested lists under features
6. **Base everything on tickets.md** — read it first, derive features from it
7. **Be concise** — the features file should be 15-50 lines total. It's a summary, not a novel.

---

## FINAL OUTPUT STRUCTURE

```markdown
# Features roadmap

Features below are derived from `.cursor/planner/tickets.md`. Each major feature groups one or more work items (tickets); ticket numbers are listed so the Kanban and project details page parse and stay in sync.

## Major features

- [ ] [Feature A] ([description]) — #1, #2, #3
- [ ] [Feature B] ([description]) — #4, #5
- [ ] [Feature C] ([description]) — #6, #7, #8
- [x] [Feature D] ([description]) — #9, #10
```

---

## PLANNER MANAGER INTEGRATION

When used through the planner manager, the user writes rough ideas for features in the UI. Your job is to:

1. **Improve the raw ideas** — Take vague feature descriptions and turn them into well-defined feature lines
2. **Match to existing tickets** — Read tickets.md and find which tickets belong to this feature
3. **Create ticket refs** — Associate the feature with the correct `#N` ticket numbers
4. **Maintain format** — Output must be parseable by the Kanban board (`- [ ] Name — #1, #2` format)
5. **Merge with existing features** — If features.md already exists, add the new feature without duplicating existing ones
6. **Suggest missing tickets** — If the feature idea doesn't have matching tickets, note that new tickets should be created in tickets.md first

### Example: Raw Idea → Polished Feature

**User input**: "we need a settings area"

**Generated feature** (after reading tickets.md):
```markdown
- [ ] Settings (user preferences, theme toggle, API key management) — #7, #8, #9
```

**User input**: "dark mode support"

**Generated feature** (after reading tickets.md):
```markdown
- [ ] Theme System (light/dark mode with persistent preference) — #17, #18
```

**User input**: "make it work on phones"

**Generated feature** (after reading tickets.md):
```markdown
- [ ] Responsive Layout (mobile-first responsive design for all pages) — #19, #20
```

---

## FINAL INSTRUCTION

Generate the complete `.cursor/planner/features.md` file NOW. Read `.cursor/planner/tickets.md` first to understand all work items, then group them into logical features. Ensure every feature references actual ticket numbers, every ticket is covered by at least one feature, and feature names align with the `#### Feature:` headers in tickets.md. This file will be parsed by the project's Kanban board — follow the format exactly.
