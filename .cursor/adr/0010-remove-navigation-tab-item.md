## Remove NavigationTabItem component

### Context

The `NavigationTabs` component, which utilized the `NavigationTabItem` component, was previously removed due to redundancy. As a direct consequence, the `NavigationTabItem` component is no longer needed.

### Decision

To maintain a clean codebase and remove unused components, the `NavigationTabItem.tsx` component has been removed.

### Consequences

- The `NavigationTabItem` component is no longer available.
- This change further streamlines the navigation-related components and eliminates unused code.
