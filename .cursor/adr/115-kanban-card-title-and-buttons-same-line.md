# ADR 115: Kanban card – title and button group on same line

## Context

On the project details Todos tab, the Kanban accordion card showed the title "Kanban (from features.md & tickets.md)" in the trigger row, while the actions (Implement Features, Sync) were inside the content area in a separate row with the description text. Users wanted the button group aligned with the title on the same line, with the title on the left and the buttons on the right.

## Decision

- **Layout**: Place the Kanban card’s button group (Implement Features, Sync) in the **same row as the card title**, inside the accordion trigger:
  - Left: title with icon ("Kanban (from features.md & tickets.md)").
  - Right: Implement Features and Sync buttons.
  - The accordion chevron remains at the end of the row (AccordionTrigger default behavior).

- **Interaction**: Wrap the button group in a `div` with `onClick={(e) => e.stopPropagation()}` so that clicking the buttons does not toggle the accordion open/closed.

- **Content**: Keep the helper text ("Check that .cursor/features.md and .cursor/tickets.md exist…") only in the accordion content, below the trigger. Remove the inline "why disabled" text that appeared next to Implement Features when disabled; the button’s `title` tooltip still explains why it is disabled.

## Consequences

- The Kanban card header is more compact and actions are visible without expanding the card.
- Title and primary actions are on one line; description stays in the body.
- No change to behavior of Implement Features or Sync; only layout and placement are updated.
