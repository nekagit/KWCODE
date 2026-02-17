# ADR 0079: UI polish — terminal failed state, cards, tabs inactive

## Status

Accepted

## Context

Follow-up UI pass: fix missing failed-state styling in terminal slots, improve card and tab visuals for consistency and feedback.

## Decision

- **TerminalSlot.tsx**: Add `statusColor === "rose"` styling for the status badge (`bg-rose-500/15 text-rose-400`) so failed runs (non-zero exit) display with the same rose accent as the header border.
- **card.tsx**: Use `border-border/50`, `shadow-sm`, and add `transition-shadow duration-200 hover:shadow` for subtle elevation on hover and clearer border.
- **tabs.tsx**: Add `data-[state=inactive]:text-muted-foreground` to TabsTrigger so inactive tabs have explicit muted text and active tab stands out more.

## Consequences

- Failed terminal runs are visually consistent; cards feel more responsive; tab active/inactive contrast is clearer. No behavior or API changes.
- References: `src/components/shared/TerminalSlot.tsx`, `src/components/ui/card.tsx`, `src/components/ui/tabs.tsx`.
