# ADR 0084: Night shift worker instructions and test coverage

## Status

Accepted.

## Context

Night shift mode (ADR 0083) runs agents on the "next valuable task" without a specific ticket. To keep changes small and verifiable, agents need clear instructions: what to do, what to run before finishing, and where to look when touching run/terminal logic.

## Decision

- **`.cursor/8. worker/night-shift.md`** is the single source of instructions for night shift agents. It already specifies:
  - Pick one concrete task (TODO, README, tests, small improvement).
  - Run `npm run test`, `npm run build`, and `npm run lint` before considering the task done.
  - No scope creep; follow project layout and agents in `.cursor/2. agents`.
- Add a **"Where to look"** section to night-shift.md that points to:
  - `src/lib/run-helpers.ts` and `src/lib/__tests__/run-helpers.test.ts` for run/terminal slot logic (Implement All, Ticket #N, Analyze, Debug, Fast dev, Night shift). When changing slot semantics, add or extend tests there.
  - Night shift behaviour: ADR 0083, `src/store/run-store.ts`, `src/store/run-store-hydration.tsx`.

## Consequences

- Night shift agents have a concise reference for run-related code and tests, reducing duplicate discovery and encouraging test updates when slot semantics change.
- Unit tests for `isImplementAllRun` (including Night shift) remain in `run-helpers.test.ts`; no change to implementation.

## References

- `.cursor/8. worker/night-shift.md` — night shift instructions and "Where to look"
- `.cursor/adr/0083-worker-night-shift.md` — Night shift feature
- `src/lib/run-helpers.ts`, `src/lib/__tests__/run-helpers.test.ts` — slot semantics and tests
