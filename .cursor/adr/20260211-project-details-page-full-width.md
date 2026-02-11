# ADR: Project details page full width

## Date
2026-02-11

## Status
Accepted

## Context
The project details page (tabs: Git & Testing, Todo, Setup) was constrained to about half width by `max-w-2xl` and `mx-auto` on each TabsContent, making the layout feel narrow.

## Decision
- In `tailwind-organisms.json` for `ProjectDetailsPageContent.tsx`, remove **max-w-2xl** and **mx-auto** from the tab content classes:
  - **c["13"]** (Git tab): `mt-6 pt-8 pb-8 px-5 w-full`
  - **c["14"]** (Todo tab): `mt-6 pt-8 pb-8 px-5 w-full flex min-h-[calc(100vh-14rem)] flex-col gap-8`
  - **c["15"]** (Setup tab): `mt-6 pt-8 pb-8 px-5 w-full space-y-8`
- Tab content now uses full available width while keeping padding and vertical spacing.

## Consequences
- Project details page uses full width; Kanban, tickets, and other content have more horizontal space.
- No change to tab bar (still fit-content) or page structure.
