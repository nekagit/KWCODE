# ADR 0087: Unit tests for design-config-to-html

## Status

Accepted. Implemented 2025-02-18 (night shift test phase).

## Context

The module `src/lib/design-config-to-html.ts` exports `designConfigToSampleHtml(config)` and is used by `DesignSamplePreview` to render a sample HTML preview from a design config. It had no unit tests. Tests document expected output shape (DOCTYPE, title, CSS variables, section ordering, enabled filter, HTML escaping, nav styles, section kinds) and guard against regressions.

## Decision

- **Add Vitest unit tests** in `src/lib/__tests__/design-config-to-html.test.ts`:
  - Minimal `DesignConfig` fixture; assert output contains DOCTYPE, page title, project name.
  - Assert CSS variables for colors, typography, and layout.
  - Assert only enabled sections appear and order is respected.
  - Assert HTML escaping for project name, page title, and section titles.
  - Assert nav styles: minimal, centered, full, sidebar (including sidebar layout class and main wrapper).
  - Assert section kinds: hero, footer, cta, generic (content).
  - Assert deterministic output for same config.
- **Conventions**: Same layout and style as existing `src/lib/__tests__/*.test.ts` (Vitest, describe/it/expect). No changes to production code.

## Consequences

- Regressions in design sample HTML generation are caught by tests.
- Expected output structure is documented via test cases.
- Future changes to `design-config-to-html.ts` can be made with confidence. Run `npm run verify` to execute tests, build, and lint.
