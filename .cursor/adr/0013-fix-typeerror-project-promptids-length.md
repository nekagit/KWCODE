# 0013: Fix TypeError: undefined is not an object (evaluating 'project.promptIds.length')

## Context

A runtime TypeError was reported: "undefined is not an object (evaluating 'project.promptIds.length')". This error occurred when attempting to access the `length` property of `project.promptIds`, indicating that `project.promptIds` was `undefined` at the time of access.

The error was pinpointed to line 33 in `src/components/molecules/CardsAndDisplay/ProjectCard.tsx`:
```typescript
<StatBadge icon={MessageSquare} count={project.promptIds.length} label="PromptRecords" />
```
Similar access patterns were also identified for `project.ticketIds.length`, `project.featureIds.length`, and `project.ideaIds.length` within the same component, making them susceptible to the same `TypeError` if their respective arrays were `undefined` or `null`.

## Decision

To resolve this, the `ProjectCard` component in `src/components/molecules/CardsAndDisplay/ProjectCard.tsx` was modified to safely access the `length` property of `promptIds`, `ticketIds`, `featureIds`, and `ideaIds`. This was achieved by using optional chaining (`?.`) and the nullish coalescing operator (`?? 0`).

The change involved updating the lines from:
```typescript
          <StatBadge icon={MessageSquare} count={project.promptIds.length} label="PromptRecords" />
          <StatBadge icon={TicketIcon} count={project.ticketIds.length} label="Tickets" />
          <StatBadge icon={Layers} count={project.featureIds.length} label="Features" />
          <StatBadge icon={Lightbulb} count={project.ideaIds.length} label="Ideas" />
```
to:
```typescript
          <StatBadge icon={MessageSquare} count={project.promptIds?.length ?? 0} label="PromptRecords" />
          <StatBadge icon={TicketIcon} count={project.ticketIds?.length ?? 0} label="Tickets" />
          <StatBadge icon={Layers} count={project.featureIds?.length ?? 0} label="Features" />
          <StatBadge icon={Lightbulb} count={project.ideaIds?.length ?? 0} label="Ideas" />
```

This ensures that if `promptIds`, `ticketIds`, `featureIds`, or `ideaIds` are `null` or `undefined`, their `length` property access will gracefully default to `0` instead of throwing a `TypeError`.

## Status

Completed.

## Consequences

- The runtime TypeError related to accessing `length` on `undefined` for `project.promptIds` (and similar properties) is resolved.
- The `ProjectCard` component can now safely render even if these properties are `null` or `undefined` in the `project` object.
- No functional changes or regressions are expected as a result of this modification.
