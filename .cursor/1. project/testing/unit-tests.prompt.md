# Prompt: Unit tests

Use when adding or expanding unit tests.

## Context

- Test stack: see `.cursor/setup/testing.md` and TECH-STACK (e.g. Vitest, Testing Library).
- Target: (module or component to test).

## Instructions

1. Test behavior, not implementation; use public API only.
2. Cover happy path and main edge cases; mock external deps.
3. Follow project test layout (e.g. `*.test.ts` next to file or in `__tests__/`).
4. Run test suite and ensure no regressions.

## Output

- New or updated unit tests.
