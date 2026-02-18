# ADR 0272 — Dashboard: Database in entity links row

## Status

Accepted.

## Context

- The Dashboard shows entity quick links in a single row (Projects, Ideas, Technologies, Prompts, Run, Documentation, Configuration, Loading) and had a **separate** Database link below the row.
- The sidebar and command palette already list Database alongside other tools (Ideas, Technologies, Documentation, Database).
- Having Database as a standalone link below the row was inconsistent and made it easier to miss.

## Decision

- Move **Database** into the `entityLinks` array in `DashboardOverview.tsx` so it appears in the same row as other entities.
- Place Database **after Documentation** to match the sidebar Tools order (Ideas, Technologies, Documentation, Database).
- Use `href: "/?tab=all"`, label "Database", icon `LayoutGrid`, and color `text-slate-600 dark:text-slate-400`.
- Remove the standalone Database `<Link>` that previously followed the entity links map so Database appears only once in the row.

## Consequences

- All one-click destinations (including Database) are in one entity links row for consistent UX.
- Dashboard entity order aligns with sidebar Tools section for Database.
- No duplicate Database link on the Dashboard.
