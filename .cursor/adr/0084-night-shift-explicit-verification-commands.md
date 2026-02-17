# ADR 0084: Night shift — explicit verification commands

## Status

Accepted.

## Context

Night shift mode (`.cursor/8. worker/night-shift.md`) instructs agents to "run tests and build" before considering a task done. The project has unit tests (Vitest), Next.js build, and ESLint; agents need unambiguous script names so they run the same checks every time.

## Decision

- **Update `.cursor/8. worker/night-shift.md`** so the "run tests and build" bullet is replaced with an explicit list:
  - `npm run test` — unit tests (Vitest)
  - `npm run build` — Next.js build
  - `npm run lint` — ESLint
- No change to implement-all.md or other worker prompts; night-shift gets the explicit list because it runs unattended and must not skip verification.

## Consequences

- Night-shift agents have one place to read the exact commands.
- Reduces ambiguity (e.g. "tests" could mean e2e only; now unit tests are specified).
- Aligns with project scripts in `package.json` (`test`, `build`, `lint`).

## References

- `.cursor/8. worker/night-shift.md` — night shift instructions
- `package.json` — scripts: `test`, `test:watch`, `build`, `lint`
