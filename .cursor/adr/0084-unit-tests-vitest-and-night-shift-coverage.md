# ADR 0084: Unit tests — Vitest script and Night shift coverage

## Status

Accepted.

## Context

- The project had an existing Vitest test file (`src/lib/__tests__/run-helpers.test.ts`) but no `npm run test` script and no Vitest dependency in `package.json`, so unit tests could not be run from the repo.
- After ADR 0083 (Night shift), `isImplementAllRun` in `src/lib/run-helpers.ts` was updated to include `r.label.startsWith("Night shift")`, but the unit tests did not cover Fast dev or Night shift labels.

## Decision

- **Add Vitest and scripts**: Add `vitest` as a devDependency and `"test": "vitest run"`, `"test:watch": "vitest"` to `package.json`. Add `vitest.config.ts` with `include: ["src/**/*.test.ts", "src/**/*.test.tsx"]`, `environment: "node"`, and `resolve.alias` for `@/` to match the app.
- **Extend run-helpers tests**: In `src/lib/__tests__/run-helpers.test.ts`, add a test case that asserts `isImplementAllRun` returns true for "Fast dev: ..." and "Night shift" / "Night shift (Terminal N)" labels, so slot semantics for Night shift are covered by tests.
- **Night shift worker instructions**: Update `.cursor/8. worker/night-shift.md` so night shift agents have a clear order of preference for picking the next task (TODO in code, README/project docs, improving tests, small improvement) and must run `npm run test`, `npm run build`, and `npm run lint` before considering the task done.

## Consequences

- Developers and CI can run unit tests with `npm run test`. Night shift and other automation can rely on the same command.
- `isImplementAllRun` behavior for Night shift and Fast dev is regression-protected by tests.
- Night shift agents have explicit, repeatable instructions for choosing and completing one valuable task per run.

## References

- `package.json` — `test`, `test:watch` scripts; `vitest` devDependency
- `vitest.config.ts` — Vitest config
- `src/lib/__tests__/run-helpers.test.ts` — Fast dev and Night shift test cases
- `src/lib/run-helpers.ts` — `isImplementAllRun`
- `.cursor/8. worker/night-shift.md` — night shift instructions
- ADR 0083 — Worker tab Night shift
