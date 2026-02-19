# ADR 0323 — Test phase: Unit tests for copy-app-version

## Status

Accepted.

## Context

- The `copyAppVersionToClipboard()` helper (in `src/lib/copy-app-version.ts`) is used by the Loading screen and command palette to copy the app version (e.g. "v0.1.0") for bug reports and support. It had no unit tests.
- It depends on `getAppVersion()` (Tauri/browser) and `copyTextToClipboard()` (already tested). Testing the helper in isolation requires mocking these dependencies so we can assert version formatting and fallback behaviour without running the full stack.

## Decision

1. **New test file**  
   - Add `src/lib/__tests__/copy-app-version.test.ts` that mocks `@/lib/app-version` (getAppVersion) and `@/lib/copy-to-clipboard` (copyTextToClipboard).

2. **Test cases**  
   - When getAppVersion resolves: copyTextToClipboard is called with "v" + version; return value of copyTextToClipboard is propagated.
   - When getAppVersion rejects: copyTextToClipboard is called with "—" (fallback); return value is propagated.
   - Both success and failure return values from copyTextToClipboard are returned by copyAppVersionToClipboard.

## Consequences

- copy-app-version behaviour is covered by unit tests; version formatting ("v" prefix) and fallback ("—") are asserted.
- No new test dependencies; follows existing Vitest + vi.mock patterns used in api-projects and copy-to-clipboard tests.
- Regressions in version display or copy flow can be caught by the test suite.
