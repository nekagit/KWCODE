# 0001-remove-quick-action-cards

## Context

The user has requested to remove all "cards" displayed on the home page. Upon investigation, these cards appear to be rendered by the `QuickActionButtons` component, which is a child of `QuickActionCard`, which is in turn rendered by `QuickActions` component within `DashboardTabContent`.

## Decision

To fulfill the user's request, the `QuickActions` component will be removed from `DashboardTabContent.tsx`. This will remove all the quick action cards/buttons from the home page.

## Consequences

- The quick action cards/buttons will no longer be visible on the dashboard.
- Any functionality associated with these buttons (e.g., adding tickets, running features, creating prompts) will no longer be directly accessible from the dashboard. Users will need to navigate to the respective tabs to perform these actions.
