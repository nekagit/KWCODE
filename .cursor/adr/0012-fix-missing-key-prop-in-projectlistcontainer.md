# 0012: Fix Missing "key" Prop Warning in ProjectListContainer

## Context

A React console error was observed: "Each child in a list should have a unique "key" prop." The error indicated that it originated from `GridContainer` and was passed a child from `ProjectsListPageContent`.

Upon investigation:
- `ProjectsListPageContent` renders a list of `ProjectCard` components, each with a unique `key={project.id}`.
- These `ProjectCard` components are passed as `children` to `ProjectListContainer`.
- `ProjectListContainer` in turn renders these `children` directly inside a `GridContainer`.

The issue was that while individual `ProjectCard` components had keys, `GridContainer` was receiving a collection of children without explicit keys at its level, leading React to warn about missing `key` props when processing the list of children within `GridContainer`.

## Decision

To resolve this, the `ProjectListContainer` component in `src/components/molecules/ListsAndTables/ProjectListContainer.tsx` was modified. The `children` prop is now processed using `React.Children.map` to ensure that each child element rendered within `GridContainer` has a unique `key` prop.

The change involved updating the return statement from:
```typescript
  return (
    <GridContainer>
      {children}
    </GridContainer>
  );
```
to:
```typescript
  return (
    <GridContainer>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { key: child.key || index });
        }
        return child;
      })}
    </GridContainer>
  );
```

This modification ensures that if a child already has a `key`, it is preserved; otherwise, a unique `index` is assigned as the `key`. This satisfies React's requirement for unique `key` props for elements in a list.

## Status

Completed.

## Consequences

- The React console warning regarding missing "key" props is resolved.
- The rendering of project cards within the `GridContainer` is stable and efficient.
- No functional changes or regressions are expected as a result of this modification.
