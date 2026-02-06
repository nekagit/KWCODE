# ADR 031: Project export as JSON including all linked entities

## Status

Accepted.

## Context

Projects aggregate linked entities: prompts, tickets, features, ideas, designs, and architectures (via IDs). Users need to export a full snapshot of a project as JSON for backup, portability, tooling, or re-import. The existing project GET returns resolved entities but only summary fields for designs and architectures; a dedicated export should include full records for every linked entity.

## Decision

- **Export API**
  - Add `GET /api/data/projects/[id]/export` that returns a single JSON payload.
  - Payload shape: `{ exportedAt, project, prompts, tickets, features, ideas, designs, architectures }`.
  - `project`: full `Project` (id, name, description, repoPath, promptIds, ticketIds, featureIds, ideaIds, designIds, architectureIds, timestamps).
  - `prompts`, `tickets`, `features`, `ideas`: full records for each ID linked to the project (same shape as stored in prompts-export.json, tickets.json, features.json, ideas.json).
  - `designs`: full design records (id, name, config, created_at, updated_at) for each project designId.
  - `architectures`: full `ArchitectureRecord` for each project architectureId.
  - `exportedAt`: ISO timestamp of export.
- **UI**
  - On the project detail page (`/projects/[id]`), add an **Export as JSON** button next to Edit.
  - On click: fetch the export API, create a blob, trigger download with filename `project-{name}.json` (sanitized).
- **ADR and docs**
  - Document in `nenad/adr` and `.cursor/adr` for AI/project history.

## Consequences

- Users can download a complete, self-contained JSON snapshot of a project and all its linked data.
- Export is suitable for backup, migration, and future re-import or merge.
- Single endpoint keeps export logic in one place; UI only triggers fetch and download.
