# ADR 0102: Add `verify` script for night shift (test + build + lint)

## Status

Accepted.

## Context

Night shift instructions (`.cursor/8. worker/night-shift.md`) require running three commands before considering a task done: `npm run test`, `npm run build`, `npm run lint`. Having a single script reduces repetition and ensures the same order and semantics everywhere (e.g. CI, local checks, night-shift agents).

## Decision

- Add a **`verify`** script to `package.json` that runs the three checks in order:
  - `npm run verify` → `npm run test && npm run build && npm run lint`
- Night shift and other agents can run `npm run verify` instead of three separate commands when "run tests, build, and lint" is required.

## Consequences

- One command for full pre-completion checks; failure of any step stops the chain.
- Night-shift instructions can optionally reference `npm run verify` as a shortcut while still listing the individual commands for clarity.
- Aligns with common practice (e.g. many projects use `ci` or `verify` for this).

## References

- `.cursor/8. worker/night-shift.md` — night shift instructions
- `package.json` — scripts: `test`, `build`, `lint`, `verify`
