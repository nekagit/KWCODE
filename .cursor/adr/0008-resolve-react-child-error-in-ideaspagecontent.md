---
title: Resolve React Child Error in IdeasPageContent
issue: N/A
---

## Context
A runtime error "Objects are not valid as a React child" occurred in `src/components/organisms/IdeasPageContent.tsx`. This error was caused by passing a React component definition (`Lightbulb` from `lucide-react`) directly as the `icon` prop to the `PageHeader` component, instead of passing an instantiated JSX element (`<Lightbulb />`). The `PageHeader` component expects a `React.ReactNode` for its `icon` prop, which means it expects an actual React element or primitive, not a component constructor.

## Decision
Modified `src/components/organisms/IdeasPageContent.tsx` to correctly pass the `Lightbulb` component as an instantiated JSX element to the `icon` prop of `PageHeader`.

Specifically, changed:
```typescript
icon={Lightbulb}
```
to:
```typescript
icon={<Lightbulb />}
```

## Status
Completed.

## Consequences
The `IdeasPageContent` component will now correctly render the `Lightbulb` icon within the `PageHeader`, resolving the "Objects are not valid as a React child" runtime error and ensuring proper UI display.
