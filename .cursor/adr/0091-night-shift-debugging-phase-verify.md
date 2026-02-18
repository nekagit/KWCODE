# ADR 0091 — Night shift debugging phase: verify and fix

## Status

Accepted.

## Context

Night shift was run in **debugging phase**: focus on reproduce, isolate, and fix rather than new features. The plan was to ensure `npm run verify` (test + build + lint) passes and fix any failures.

## Decision

- A new plan entry was added to `.cursor/worker/night-shift-plan.md` for the debugging run (verify and fix).
- No code changes were made in this run: static analysis of tests and production code did not find defects; test expectations match implementations (download-helpers, csv-helpers, run-helpers, design-config-to-html).
- Verify could not be executed in the agent environment (commands rejected); no failures were reproduced in-session.

## Consequences

- Developers should run `npm run verify` locally after pulling or after any changes to confirm tests, build, and lint pass.
- Future debugging-phase runs should run verify when the environment allows and fix any failures before closing the plan.
