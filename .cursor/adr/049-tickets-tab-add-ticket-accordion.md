# ADR 049: Tickets tab – Add ticket in accordion

## Status

Accepted.

## Context

On the Tickets tab (/?tab=tickets), the "Add ticket" form (title, description, status, priority, button) was always visible in a bordered block. To reduce visual clutter and align with the Feature tab's "Add feature" accordion pattern, we wanted the add-ticket form to be collapsible.

## Decision

- **Accordion**
  - Wrap the "Add ticket" section in a single-item accordion (`Accordion type="single" collapsible`).
  - Use trigger label "Add ticket" and keep the form (Title, Description, Status, Priority, Add ticket button) inside `AccordionContent`.
- **Styling**
  - Match the Feature tab accordion: `rounded-lg border bg-muted/30`, trigger with `px-4 py-3`, content with `px-4 pb-4 pt-2`, and open-state border on trigger.

## Consequences

- Add-ticket form is collapsed by default; users expand "Add ticket" when they want to create a ticket.
- Tickets tab layout is cleaner and consistent with the Feature tab "Add feature" accordion.
- No change to ticket creation behavior or data.
