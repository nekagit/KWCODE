# ADR 0322 — Test phase: Extract print trigger into testable utility

## Status

Accepted.

## Context

- The PrintButton atom (ADR 0321) has no unit tests. The project uses Vitest in a Node environment and does not use React Testing Library or jsdom.
- Testing "click triggers window.print()" would require either adding RTL + jsdom or testing the behaviour in isolation. To avoid new test dependencies and to keep tests fast and deterministic, we prefer a small, testable utility.

## Decision

1. **New utility**  
   - Add `src/lib/print-page.ts` with `triggerPrint(): void` that calls `window.print()` when `window` is defined and has a `print` function; no-op otherwise (SSR-safe).

2. **PrintButton**  
   - Use `triggerPrint()` from `print-page.ts` instead of inline `window.print()`. No change to props, UI, or user-visible behaviour.

3. **Tests**  
   - Add `src/lib/__tests__/print-page.test.ts`: unit tests that mock `globalThis.window` and assert that `triggerPrint()` calls `window.print()` when available, and does not throw when `window` is undefined or `window.print` is missing.

## Consequences

- Print behaviour is covered by unit tests without introducing React component test infrastructure.
- Single place for the print action; future changes (e.g. analytics, print options) can be implemented in the utility and tested there.
- PrintButton remains a thin UI over tested logic.
