# 0005-organize-atom-components

## Status
Accepted

## Context
The `src/components/atoms` directory has grown organically, resulting in a flat structure with a large number of components. This makes it difficult to navigate, discover, and maintain components, leading to potential inconsistencies and reduced developer efficiency.

## Decision
To improve the organization, maintainability, and discoverability of atom components, we will refactor the `src/components/atoms` directory into a more structured hierarchy. Components will be grouped into logical subfolders based on their functionality and shared structure.

The proposed subfolders are:
- `architecture/`
- `badges/`
- `buttons/`
- `checkbox-groups/`
- `displays/`
- `forms/`
- `headers/`
- `inputs/`
- `list-items/`
- `navigation/`
- `theme/`

Each existing component will be moved to its corresponding new subfolder. Uncategorized components will be assigned to the most appropriate existing category or a new one if necessary.

## Consequences
- **Improved Maintainability:** Components will be easier to locate and understand, reducing the effort required for updates and bug fixes.
- **Enhanced Discoverability:** Developers can quickly find relevant components based on their functional categories.
- **Reduced Cognitive Load:** A more organized structure will lessen the mental overhead for developers working with atom components.
- **Potential for Import Path Changes:** This refactoring will necessitate updates to import paths for all moved components. This will be handled as part of the implementation.
- **Initial Refactoring Effort:** There will be an initial effort required to move files and update import paths. However, the long-term benefits outweigh this initial cost.

## Compliance
This ADR adheres to the user rule of placing all `.md` files in the `.cursor/adr` folder and follows best practices for documenting architectural decisions in AI projects by providing clear context, decision, and consequences.