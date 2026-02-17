# ADR 0105: Document `verify` script in .cursor/README.md

## Status

Accepted.

## Context

The project has a single `npm run verify` script (test + build + lint) documented in night-shift instructions and in ADR 0102. The main Cursor usage doc (`.cursor/README.md`) did not mention it, so contributors or agents reading only the README might not know to run verify before considering work done.

## Decision

- Add a **Quality checks** subsection to `.cursor/README.md` under "How to use (KWCode)".
- State that from the repo root, run **`npm run verify`** to run unit tests (Vitest), Next.js build, and ESLint in order, and that this should be used before committing or handing off (e.g. after Implement All or night shift tasks).

## Consequences

- One place in the Cursor docs that tells everyone (humans and agents) to run verify for quality checks.
- Aligns README with night-shift and ADR 0102 without duplicating the full command list.

## References

- `.cursor/README.md` — Quality checks subsection
- `.cursor/adr/0102-verify-script-night-shift.md` — verify script decision
- `.cursor/8. worker/night-shift.md` — night shift instructions
