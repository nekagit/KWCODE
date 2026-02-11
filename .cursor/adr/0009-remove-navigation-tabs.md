## Remove NavigationTabs component

### Context

The `ProjectTabs` component was previously removed. However, a similar `NavigationTabs` component was still rendering a top navigation bar with the same tabs. This created a redundant UI element.

### Decision

To streamline the UI and avoid duplicate navigation, the `NavigationTabs.tsx` component has been removed. The parent components that previously utilized `NavigationTabs` will now need to adapt to this change and render their content directly or use a different navigation mechanism.

### Consequences

- The top navigation bar will no longer be rendered by `NavigationTabs`.
- Any components relying on `NavigationTabs` for rendering their tabs will need to be updated.
- This change simplifies the navigation structure and aligns with the removal of `ProjectTabs`.
