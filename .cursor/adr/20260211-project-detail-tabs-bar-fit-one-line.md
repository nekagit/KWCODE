# ADR: Project detail tab bar — same line, fit width

## Date
2026-02-11

## Status
Accepted

## Context
The project detail tab bar had two issues: (1) tab heading items should sit on the same line as the grey tab area (no wrapping, single row); (2) the grey area was using full/max width instead of fitting the tab items.

## Decision
- **Tabs container (c["5"]):** Use `w-full flex flex-col items-center` so the tab bar is centered horizontally; tab content below stays full width via TabsContent `w-full` classes.
- **TabsList (c["6"]):** Use `inline-flex flex-nowrap w-fit max-w-full items-center justify-center gap-3 p-3` so the grey area is not full width but fits the tab triggers and is centered by the parent.
- **inline-flex + w-fit:** Keeps the tab bar only as wide as its content (grey area fits the triggers).
- **flex-nowrap:** Keeps all tab triggers on one line with the grey background.
- **max-w-full:** Prevents overflow on small viewports while still fitting content when space allows.

## Consequences
- Tab bar (Git & Testing, Todo, Setup) and its grey background stay on one row and only as wide as the three triggers.
- Tab content below continues to use full width via existing TabsContent classes.
