# ADR 051: Project details page – all sections in accordions

## Status

Accepted.

## Context

The project details page (`/projects/[id]`) showed many sections in a long scroll: Link to this project (card with checkboxes), Categorization (card with entity category inputs), Group by selector, and six entity sections (Prompts, Tickets, Features, Ideas, Designs, Architecture) as separate cards. To reduce clutter and let users focus on one area at a time, we wanted each major section to be collapsible.

## Decision

- **Accordion layout**
  - Wrap all main content in a single `Accordion type="multiple"` so multiple sections can be open at once.
  - Use `defaultValue={["link", "prompts"]}` so "Link to this project" and "Prompts" are open by default.
- **Accordion items**
  - **Link to this project** – checkboxes for prompts, tickets, features, ideas, designs, architectures and "Save links" button; styled with `bg-primary/5 border-primary/30`.
  - **Categorization** – phase/step/organization/categorizer/other inputs per entity type.
  - **Group by** – dropdown to group entity lists by category (none, phase, step, etc.).
  - **Prompts**, **Tickets**, **Features**, **Ideas**, **Designs**, **Architecture** – one accordion item each with the existing list content, "linked" count in the trigger, and external link button.
- **Styling**
  - Each item: `border rounded-lg px-4 mt-2`, trigger `py-4 hover:no-underline`, content `pb-4`. Trigger text uses `text-base font-medium` and icons where applicable.

## Consequences

- Project details page is easier to scan; users expand only the sections they need.
- "Link to this project" and "Prompts" open by default keeps common flows visible.
- No change to data, APIs, or entity linking/categorization behavior.
- Card components for these sections are removed in favor of accordion items; layout is simpler.
