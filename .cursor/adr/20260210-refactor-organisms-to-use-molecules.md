1. ADR Title: Refactor Organism Components to Use Molecules

2. Status: Proposed

3. Date: 2026-02-10

4. Decision Drivers:
    * Improve code organization and maintainability by adhering to a component-based architecture (Atomic Design principles).
    * Enhance reusability of UI components (molecules) across different organism components.
    * Reduce complexity and promote a clearer separation of concerns within organism components.
    * Prepare for future refactoring into even more granular atomic components.

5. Decision Outcome:
    * Existing organism components in `src/components/organisms` have been analyzed to identify reusable UI patterns and logical blocks.
    * These identified patterns have been extracted into new molecule components, located in `src/components/molecules`.
    * Each original organism component has been updated to import and utilize these newly created molecule components.
    * The refactoring ensures that each organism component now composes multiple molecule components, promoting a hierarchical and modular structure.

6. Alternatives Considered:
    * **No refactoring:** This would lead to continued code sprawl and tightly coupled components within `src/components/organisms`, hindering maintainability and reusability.
    * **Directly refactor into atoms/molecules/organisms in one step:** While a comprehensive goal, attempting a full atomic design refactor in a single pass for all components would be overly complex and time-consuming. An incremental approach, focusing on separating organisms into molecules first, is more manageable and provides immediate benefits.
    * **Alternative molecule groupings:** Different groupings of UI elements into molecules were considered. The chosen approach prioritized creating molecules that encapsulate distinct UI sections or logical units that could be reused across various organism components.
