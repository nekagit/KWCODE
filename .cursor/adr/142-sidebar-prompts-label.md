# ADR 142: Sidebar "Prompts" label

## Status
Accepted

## Context
The sidebar navigation item for the prompts page was labeled "PromptRecords", which is internal/technical naming rather than user-facing. Users expect a simple "Prompts" label.

## Decision
- In `SidebarNavigation.tsx`, change the label for the `/prompts` nav item from `"PromptRecords"` to `"Prompts"`.

## Consequences
- Sidebar shows a clearer, user-friendly label "Prompts" for the prompts page.
- No route or behavior change; only the displayed label is updated.
