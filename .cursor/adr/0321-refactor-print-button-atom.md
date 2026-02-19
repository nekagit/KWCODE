# ADR 0321 — Refactor: Extract PrintButton atom

## Status

Accepted.

## Context

- Multiple pages (Configuration, Documentation, Ideas, Loading screen, Prompts, Technologies, Run tab) each rendered an inline Print button with the same behaviour: Printer icon, "Print" label, `window.print()`, `aria-label="Print current page"`, and a page-specific `title` (e.g. "Print configuration page (⌘P)").
- This duplicated the same UI and a11y pattern in seven places and made it harder to change print-button behaviour or styling in one place.

## Decision

1. **New atom**  
   - Add `src/components/atoms/buttons/PrintButton.tsx`: a shared component that renders a shadcn `Button` with `Printer` icon, text "Print", `onClick={() => window.print()}`, `aria-label="Print current page"`, and optional `title`, `variant`, `size`, `className`, `iconClassName`.

2. **Replace usages**  
   - Use `<PrintButton ... />` in: ConfigurationPageContent, DocumentationPageContent, IdeasPageContent, LoadingScreenPageContent, PromptRecordsPageContent, TechnologiesPageContent, ProjectRunTab. Each call site passes the same variant/size/title/className (and iconClassName where needed) as before so visual and behavioural contracts are unchanged.

3. **Out of scope**  
   - Command palette "Print current page" (menu item, different pattern) and app-shell keyboard handler are unchanged.

## Consequences

- One place for print-button behaviour and a11y; future changes (e.g. analytics, print options) can be done in the atom.
- Less duplication; call sites are shorter and consistent.
- Same public behaviour and visuals; no user-facing change.
