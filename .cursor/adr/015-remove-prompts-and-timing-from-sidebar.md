# ADR 015: Remove "Prompts & timing" from sidebar

## Status
Accepted

## Context
The app-shell sidebar included a "Prompts & timing" item linking to `/?tab=prompts` (dashboard tab). The app already has a dedicated **Prompts** page at `/prompts` (see ADR 010). Having both "Prompts & timing" (dashboard tab) and "Prompts" (dedicated page) in the sidebar was redundant and confusing.

## Decision
- Remove the "Prompts & timing" sidebar entry (`/?tab=prompts`) from `mainNavItems` in `src/components/app-shell.tsx`.
- Keep the "Prompts" link to `/prompts` for the dedicated Prompts page.

## Consequences
- Sidebar order is: Dashboard → Projects → Tickets → Feature → Prompts → AI Generate, then Log & Data, then Configuration.
- Users who need prompts and run controls use the "Prompts" page; dashboard tab `prompts` is no longer surfaced in the sidebar (still reachable via URL if needed).
