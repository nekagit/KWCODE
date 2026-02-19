# Night Shift — Build Something Real

You are in **night shift mode**: no ticket was provided. Your job is to **design and implement one real, self-contained feature** — new files, new capability, shipped and working. MAKE SURE TO NOT REPEAT FINISH TASKS, IF PREVIOUSLY IN THE PLAN A COPY CLIPBOARD FUNCTION IS DONE YOU DO SOMETHING ELSE MAKE SURE TO ANALYZE THE GIT CHANGELOG THEREFORE ASWELL AS THE **`.cursor/worker/night-shift-plan.md`**.

---

## Step 1 — Plan First

Before writing any code, open (or create) **`.cursor/worker/night-shift-plan.md`**.

You must create a new entry so Update the file with a new plan with this structure:
```markdown
# Night Shift Plan — [Date]

## Chosen Feature
_One sentence: what you're building and why it matters._

## Approach
_How it fits into the existing architecture. Which patterns/conventions you'll follow._

## Files to Create
- `src/...` — purpose
- `src/...` — purpose

## Files to Touch (minimise this list)
- `src/...` — only if strictly required (e.g. registering a new route or export)

## Checklist
- [ ] Task A
- [ ] Task B
- [ ] Task C
```

**Iterate on the plan** before coding. If the first draft is vague, rewrite it until every checklist item is a concrete, implementable action. The plan is your contract — don't start coding until it's solid. Make sure to check the github changelog if you plan is already done, dont do it again and check in the code if you can unify or reuse existing code

---

## Step 2 — Choose a Feature

Pick something **real and additive**. In order of preference:

1. **A feature described** in `.cursor/README.md`, `.cursor/1. project/`, or any ADR that is marked as planned/proposed.
2. **A meaningful capability gap** you identify by reading the codebase — something users or developers would notice.
3. **A new integration, page, component, API route, or utility module** that fits naturally into the project.

**Not eligible:**
- Fixing a typo or comment
- Adding a missing type annotation
- Writing tests for existing code
- Refactoring internals without new behaviour

> The bar: would this show up in a changelog? If not, pick something bigger.

---

## Step 3 — Implement

- **Prefer new files** over editing existing ones. New feature = new module.
- Only touch existing files when strictly necessary (e.g. registering a route, adding an export to an index).
- Follow the project's layout, naming conventions, and tech stack exactly.
- Consult `.cursor/2. agents/` for coding style and scope boundaries.
- Use real file paths and complete implementations — no stubs, no `// TODO`, no pseudocode.
- As you complete each checklist item in the plan, **check it off** in `.cursor/worker/night-shift-plan.md`.

---

## Step 4 — Verify
```bash
npm run verify        # test + build + lint
```

Fix any failures. Do not leave the codebase in a broken state. FIX ALL TS BUILD ERRORS

---

## Step 5 — Wrap Up

YOU MUST Update `.cursor/worker/night-shift-plan.md` with a brief **Outcome** section:
```markdown
## Outcome
_What was built, which files were created, what a developer needs to know to use it._
```

---

## Conventions

| Area | Files |
|---|---|
| Run/terminal slot logic | `src/lib/run-helpers.ts`, `src/lib/__tests__/run-helpers.test.ts` |
| Night shift behaviour | `.cursor/adr/0083-worker-night-shift.md` |
| Run store | `src/store/run-store.ts`, `src/store/run-store-hydration.tsx` |

---

*Edit `.cursor/8. worker/night-shift.prompt.md` to change what night shift agents do.*
