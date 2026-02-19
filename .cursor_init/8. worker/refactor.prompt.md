# Night Shift — Refactor phase

Focus on **refactoring**: improve structure, naming, and patterns **without changing behaviour**. Prefer small, safe steps.

## Steps

1. **Identify scope** — Choose a small, well-defined area (file, component, or module). Do not refactor the whole codebase in one go.
2. **Run tests before** — Run the project test suite (e.g. `npm run verify` or see `.cursor/1. project/testing.md`) and confirm everything passes. This is your baseline.
3. **Refactor** — Rename for clarity, extract functions/components, simplify conditionals, reduce duplication. Do not add features or fix bugs; only improve existing code.
4. **Run tests after** — Run the same test command again. All tests must still pass. Same public behaviour and contracts.
5. **Small commits** — Prefer one logical change per commit so changes are easy to review and revert if needed.

## Rules

- Do not add new features or fix bugs in this phase; only improve existing code.
- Keep the same public behaviour and contracts so existing tests still pass.
- If the ticket asks to create a **new folder** (e.g. under `.cursor`) for organization or to move existing files into it, that counts as refactoring structure — do it. Use the **exact path** from the ticket (e.g. `.cursor` not `.cursro`).
- Consult `.cursor/8. worker/night-shift.prompt.md` for the main night shift workflow; this file adds the refactor focus.

*Edit `.cursor/8. worker/refactor.prompt.md` to adapt the refactor-phase prompt.*
