# Architecture overview

<!-- High-level architecture. Details in .cursor/setup/architecture.md and .cursor/setup/frontend.json, backend.json. -->

## Layers

- **Frontend:** (See .cursor/setup/frontend.json for framework, routing, state.)
- **Backend / API:** (See .cursor/setup/backend.json for runtime, DB, endpoints.)
- **Data:** Database and file storage; entities as in setup JSON.

## Data flow

(Describe request flow: UI → API → DB and back. Add a Mermaid diagram if desired.)

## Key decisions

See `.cursor/adr/` for architecture decision records.
