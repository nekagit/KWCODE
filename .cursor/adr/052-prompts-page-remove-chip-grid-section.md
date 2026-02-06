# ADR 052: Prompts page – remove chip/grid selection section

## Status

Accepted.

## Context

The Prompts page had two main sections: (1) a card with a grid of prompt "chips" (checkbox, id + title, trash icon) for selecting prompts for run and quick delete, and (2) an "All prompts data" table with full fields and actions. The chip grid duplicated selection and delete behavior and added visual clutter.

## Decision

- **Remove the chip/grid section**
  - Remove the first card that rendered `prompts.map(...)` as a flex-wrap grid of items with Checkbox, "id: title", and Trash2. That section is no longer shown on the Prompts page.
- **Single card: All prompts data**
  - Keep a single card titled "All prompts data" that contains the full table. Move the action buttons (Create prompt, Edit prompt, Generate with AI) into this card's header so create/edit/generate remain available.
- **Copy and description**
  - Merge the former first card's copy into the "All prompts data" description: explain that users select in the table for run (script `-p ID …`), go to the Run page to set prompts and run, edit or delete from the table, and configure timing on the Configuration page.
- **Cleanup**
  - Stop destructuring `prompts` from `useRunState` and remove the unused `cn` import.

## Consequences

- The Prompts page has one primary section (the table) instead of two, reducing duplication and clutter.
- Selection for run, edit, and delete are done only from the table; behavior is unchanged.
- Create, Edit, and Generate with AI remain in the card header.
