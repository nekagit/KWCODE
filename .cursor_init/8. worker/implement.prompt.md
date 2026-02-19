# Night Shift — Implement phase

Focus on **implementation**: build the feature end-to-end (UI, API, or both). Prefer new files; wire into existing code only where necessary.

**This phase is for extending existing features and code** — not for adding brand-new product features. Implement the behaviour that is already specified or partially built (e.g. from a ticket or plan).

## Steps

1. **Match existing patterns** — Follow the project's layout, naming, and tech stack. See `.cursor/1. project/` and `.cursor/2. agents/` for conventions and scope.
2. **Implement** — Prefer new files and modules; wire into existing code only where strictly needed (e.g. registering a route, adding an export). Deliver complete, working behaviour; no stubs or TODOs.
3. **Wire only where needed** — Minimise edits to existing files. New behaviour should live in new or dedicated modules.
4. **Run verify** — Run `npm run verify` (or the project's test/build command). Fix any failures before considering this phase done.

## Rules

- Do not add unrelated features or refactors; stay in scope.
- Deliver complete, working behaviour — no stubs or pseudocode.
- Consult `.cursor/8. worker/night-shift.prompt.md` for the main night shift workflow; this file adds the implement (extend-existing) focus.

*Edit `.cursor/8. worker/implement.prompt.md` to adapt the implement-phase prompt.*
