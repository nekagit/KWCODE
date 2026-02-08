# ADR 103: Sidebar collapsible

## Status

Accepted.

## Context

The app shell uses a fixed left sidebar for navigation (Dashboard, Run, Projects, Tickets, Feature, Prompts, Ideas, Design, Architecture, Log & Data, Configuration). Users requested the ability to collapse the sidebar to gain more horizontal space for main content while keeping quick access to navigation via icons.

## Decision

- **Collapsible behavior**
  - Add local state `sidebarCollapsed` in `AppShell` (`src/components/app-shell.tsx`). Sidebar width transitions between `w-48` (expanded) and `w-[3.25rem]` (collapsed) with `transition-[width] duration-200 ease-in-out` and `overflow-hidden` so content does not spill during animation.

- **Collapsed layout**
  - When collapsed: hide header text (“Run Prompts Control” and subtitle), section titles (“Log & Data”, “Settings”), and nav link labels. Show only icons, centered in the narrow rail. Use `justify-center` and `px-0` on nav links when collapsed.

- **Tooltips**
  - When collapsed, wrap each nav link in `Tooltip` (side="right") so hover shows the label. Use `delayDuration={0}` for immediate feedback. Toggle button at the bottom of the sidebar also has a tooltip (“Expand sidebar” / “Collapse sidebar”).

- **Toggle control**
  - Add a button at the bottom of the sidebar (below Settings), using `PanelLeftClose` when expanded and `PanelLeftOpen` when collapsed. Button is `variant="ghost"` `size="icon"` with `aria-label` for accessibility.

## Consequences

- Users can collapse the sidebar for more content space and expand it when they need full labels. No persistence (e.g. localStorage) in this change; preference resets on reload. Can be added later if desired.
