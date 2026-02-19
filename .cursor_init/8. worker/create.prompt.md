# Night Shift — Create phase

Focus on **creating**: add something new — a component, route, utility, or module. Prefer new files and clear boundaries.

**This phase is for adding new features and new code** — something that would show up in a changelog as a new capability.

## Steps

1. **Choose a real feature** — Pick a real, additive feature (see "Step 2 — Choose a Feature" in `.cursor/8. worker/night-shift.prompt.md`). Check `.cursor/worker/night-shift-plan.md` and the codebase so you do not duplicate finished work.
2. **New files, clear boundaries** — Prefer new files and clear module boundaries; minimise edits to existing files. New capability = new module where possible.
3. **Implement fully** — No stubs, no pseudocode. Ensure it's shipped and working. Register in the app (route, export, or entry point) only where strictly needed.
4. **Verify** — Run `npm run verify` (or the project's test/build command). Fix any failures. Do not leave the codebase in a broken state.

## Rules

- The bar: would this show up in a changelog? If not, pick something more substantial.
- Consult `.cursor/8. worker/night-shift.prompt.md` for the full night shift workflow; this file adds the create (new-features) focus.

*Edit `.cursor/8. worker/create.prompt.md` to adapt the create-phase prompt.*
