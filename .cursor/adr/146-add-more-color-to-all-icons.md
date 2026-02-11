# ADR 146: Add more color to all icons

## Status

Accepted.

## Context

Icons across the app were mostly neutral (inherited or `text-muted-foreground`), which made the UI feel flat and reduced visual hierarchy. Users requested more color on icons to improve recognition and tie icons to semantic meaning (e.g. Run = info, Tickets = warning, Projects = success).

## Decision

Apply semantic theme colors to icons app-wide using existing CSS variables (`--primary`, `--info`, `--success`, `--warning`, `--destructive`, `--muted-foreground`):

1. **Sidebar navigation**
   - Dashboard: `text-primary/90`
   - Testing: `text-info/90`
   - Architecture: `text-primary/90`
   - Database: `text-accent-foreground/90`
   - Ideas: `text-warning/90`
   - Projects: `text-success/90`
   - Tickets: `text-warning/90`
   - Feature: `text-info/90`
   - Prompts: `text-primary/90`
   - Run: `text-info/90` (existing)
   - Configuration: `text-muted-foreground/90` (existing)
   - Log (ScrollText): `text-info/80` (existing)

2. **TitleWithIcon and cards**
   - AI / Sparkles: `text-primary/90`
   - Quick actions / Zap: `text-warning/90`
   - Projects / Folders: `text-success/90`
   - PromptRecords / MessageSquare: `text-primary/90`
   - Run from feature / Layers: `text-info/90`
   - Tickets / TicketIcon: `text-warning/90`
   - Feature / Layers: `text-info/90`
   - Coverage / Activity: `text-primary/80`

3. **Shared components**
   - PageHeader icon wrapper: `text-primary/90` (replacing gray)
   - BadgeComponent icon: `text-primary/90`
   - EmptyState icon: `text-primary/80`; icon-as-node wrapper: `text-primary/80`
   - Empty (ui): icon container `text-primary/80` (replacing `text-muted-foreground`)

4. **Quick actions FAB**
   - Log: `text-info/90`
   - Run: `text-success/90`
   - Configuration: `text-muted-foreground/90`

5. **Project tabs, category headers, and pages**
   - Project category headers and PageHeader: icons use `text-primary/90`
   - Project tab icons (Prompts, Architecture, Tickets, Features, Ideas, Design): semantic colors per category
   - Project details tab triggers (Git, Todo, Setup): `text-success/90`, `text-info/90`, `text-muted-foreground/90`
   - AllDataTabContent card titles: Folders, MessageSquare, TicketIcon, Layers, Lightbulb, Palette with matching semantic colors
   - Testing, Ideas, Configuration, Running terminals, Tickets table: icons use `text-info/90`, `text-warning/90`, or `text-primary/90` as appropriate
   - Loading and error icons: `text-primary/80`, `text-destructive/90`

6. **Atoms**
   - TestingPhaseListItem: `text-info/80`
   - ProjectCard: Folders `text-success/90`, ArrowRight `text-primary/90`

## Consequences

- Icons are more visually distinct and aligned with semantic meaning (success = green, warning = amber, info = blue, primary = theme primary).
- Navigation, cards, and empty states feel more cohesive with the theme palette.
- No new CSS variables; all colors use existing theme tokens with opacity (e.g. `/90`, `/80`) for consistency and accessibility.
- ADR 143 (scheme-colored icons) is extended rather than replaced; this ADR broadens the same approach to all icon usages.
