# ADR 0027: Restore dedicated Ideas tab on project details

## Status

Accepted

## Context

- ADR 0026 removed the standalone Ideas tab and consolidated Ideas into the Project tab as an embedded section (ProjectIdeasDocTab).
- Users reported that the Ideas tab was no longer visible; Ideas content required opening the Project tab and scrolling to the Ideas section, reducing discoverability.

## Decision

- **Restore a top-level Ideas tab** on the project details page.
- Add an "Ideas" tab in the second row of tabs (with Milestones, Planner, Control, Versioning), using the Lightbulb icon and amber styling.
- The Ideas tab renders the same `ProjectIdeasDocTab` component inside a card container; the Ideas section remains also embedded in the Project tab for users who prefer the consolidated view.

## Consequences

- Ideas are again one click away from the tab bar.
- No change to data or APIs; only the project details tab list and one new TabsContent were added.
- ADR 0026’s consolidation into the Project tab is partially reverted for Ideas only (Documentation and Worker tabs stay removed).

## References

- `src/components/organisms/ProjectDetailsPageContent.tsx` — Ideas tab in TAB_ROW_2, TabsContent for "ideas"
- `src/components/molecules/TabAndContentSections/ProjectIdeasDocTab.tsx` — unchanged; used by both Project tab (embedded) and Ideas tab (standalone)
- ADR 0026 — setup tab removal and tab consolidation
