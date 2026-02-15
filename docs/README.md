# Documentation

This folder holds project documentation. Structure:

- **getting-started/** — Installation, quick start, configuration
- **architecture/** — Overview, frontend, backend, data flow
- **development/** — Setup, workflows, agents guide, best practices
- **api/** — API reference (see `.cursor/setup/backend.json` and `.cursor/documentation/api-reference.md`)
- **guides/** — Creating features, testing, deployment
- **contributing/** — Code style, PR process, ticket workflow

Source content for many of these topics lives in `.cursor/documentation/`. To build a docs site (e.g. Docusaurus), run from repo root:

```bash
npx create-docusaurus@latest docs-app classic --typescript
```

Then copy or link this `docs/` content into the generated `docs-app/docs/` and configure the sidebar.
