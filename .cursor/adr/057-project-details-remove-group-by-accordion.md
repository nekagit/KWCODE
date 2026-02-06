# ADR 057: Project details page – remove Group by accordion

## Status

Accepted.

## Context

The project details page had a "Group by" accordion (ADR 051) that let users choose a category (phase, step, organization, etc.) to sort entity lists. The feature added UI and state without strong demand; entity lists can be shown in natural order.

## Decision

- Remove the **Group by** accordion item from the project details page.
- Remove `groupBy` state and `GroupByOption` type.
- Render prompts, tickets, features, ideas, designs, and architectures in their natural (API) order; no category-based sorting.
- Update Categorization copy to drop the sentence "Use 'Group by' below to view by category."
- Remove unused Select component imports.

## Consequences

- Simpler project details page and less code.
- Entity lists no longer support sorting by category on this page; categorization inputs remain for metadata only.
- ADR 051 is superseded on the "Group by" item only; other accordion behavior unchanged.
