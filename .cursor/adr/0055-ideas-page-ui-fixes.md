# ADR 0055: Ideas page UI fixes

## Status
Accepted

## Context
The Ideas page needed UI polish: header icon size inconsistent with other resource pages, tab labels ("Templates", "AI generated", "My ideas") could overflow on small viewports, and the ideas.md accordion section could use a constrained width for readability on large screens.

## Decision
- **Header icon**: Use `size-5 text-warning/90` for the Lightbulb in `IdeasPageContent` (via `tailwind-organisms.json`) so it matches the size of icons on Technologies and Configuration pages.
- **Tab bar**: Add `[&_button]:min-w-0 [&_button]:truncate [&_button]:text-sm` to the tab list class so triggers don’t overflow; use `gap-2 p-2` for clearer spacing.
- **IdeasDocAccordion**: Wrap in a `div` with `w-full max-w-4xl mx-auto` so the accordion has a readable max width and stays centered.

## Consequences
- Ideas page aligns visually with other resource pages and behaves better on narrow viewports.
- Accordion content is easier to read on wide screens without changing the rest of the page layout.
