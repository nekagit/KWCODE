# ADR: Rename molecule files to match exported component names

## Context
React/TypeScript best practice is that the **file name should match the primary exported component name** (PascalCase). This makes discovery, refactors, and tooling (e.g. "go to definition") predictable. Several molecule files had different names from their exports, and one name was ambiguous.

## Decision
Rename the following files and, where needed, the exported symbol so that **filename = export name** and names are clear:

| Old path | New path | Export (unchanged or updated) |
|----------|----------|-------------------------------|
| `TabAndContentSections/ProjectPromptsTab.tsx` | `TabAndContentSections/ProjectPromptRecordsTab.tsx` | `ProjectPromptRecordsTab` |
| `CardsAndDisplay/PromptSelectionCard.tsx` | `CardsAndDisplay/PromptRecordSelectionCard.tsx` | `PromptRecordSelectionCard` |
| `ListsAndTables/PromptTable.tsx` | `ListsAndTables/PromptRecordTable.tsx` | `PromptRecordTable` |
| `FormsAndDialogs/GeneratePromptDialog.tsx` | `FormsAndDialogs/GeneratePromptRecordDialog.tsx` | `GeneratePromptRecordDialog` |
| `FormsAndDialogs/PromptFormDialog.tsx` | `FormsAndDialogs/PromptRecordFormDialog.tsx` | `PromptRecordFormDialog` |
| `ControlsAndButtons/PromptActionButtons.tsx` | `ControlsAndButtons/PromptRecordActionButtons.tsx` | `PromptRecordActionButtons` |
| `TabAndContentSections/DbDataTabContent.tsx` | `TabAndContentSections/DatabaseDataTabContent.tsx` | `DatabaseDataTabContent` (was `DbDataTabContent`) |

All imports that referenced these paths were updated. The old files were removed after the new ones were in place.

## Status
Completed.

## Consequences
- File names now match component names; easier to find and refactor.
- "Prompt" vs "PromptRecord" naming is consistent in prompts-related molecules.
- "Db" was expanded to "Database" for clarity.
- No behavior change; only file paths and one export name (`DbDataTabContent` → `DatabaseDataTabContent`).
