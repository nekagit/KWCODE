# ADR 141: Setup tab — Design and Architecture as distinct cards

## Status

Accepted.

## Context

The project details Setup tab should include Design, Ideas, and Architecture sections. Users reported that the design card and architecture card were missing or not clearly visible in the Setup tab. Per ADR 139, the Setup tab contains `ProjectDesignTab`, `ProjectIdeasTab`, and `ProjectArchitectureTab`; they were present in code but needed to be rendered as distinct, card-style sections for clarity.

## Decision

- **Setup tab content** in `ProjectDetailsPageContent`:
  - Wrap each of the three sections (Design, Ideas, Architecture) in a `Card` (from `@/components/ui/card`) with `CardContent`.
  - Order: Design card → Ideas card → Architecture card.
- **Implementation:** Import `Card` and `CardContent` from `@/components/ui/card`; inside `TabsContent value="setup"`, render three `Card` wrappers, each with `CardContent className="pt-6"` containing `ProjectDesignTab`, `ProjectIdeasTab`, and `ProjectArchitectureTab` respectively.

## Consequences

- Design and Architecture are clearly visible as separate cards in the Setup tab.
- Ideas remains in the middle as the second card.
- Visual consistency with other card-based sections (e.g. Git tab, All data tab) and clearer hierarchy for setup/linking (design, ideas, architecture).
