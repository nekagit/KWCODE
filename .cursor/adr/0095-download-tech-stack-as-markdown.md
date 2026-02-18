# ADR 0095: Download Tech Stack as Markdown

## Status

Accepted. Implemented 2025-02-18 (night shift).

## Context

The Technologies page supports "Copy" (JSON to clipboard) and "Export" (JSON file). Other areas (Ideas, Run history, Prompts, Keyboard shortcuts) support both JSON and Markdown file export. For consistency and documentation workflows, the tech stack should be exportable as a Markdown file with the same structure (title, timestamp, optional description, then Frontend/Backend/Tooling tables).

## Decision

- **Add `techStackToMarkdown(data)`** in `src/lib/download-tech-stack.ts` — Pure formatter: `# {name}`, export timestamp, optional description, then `## Frontend` / `## Backend` / `## Tooling` tables (Technology | Description). Pipe characters escaped for valid Markdown.
- **Add `downloadTechStackAsMarkdown(data)`** in the same module — Null check and toast when empty; then `triggerFileDownload` with filename `tech-stack-{filenameTimestamp()}.md` from download-helpers.
- **Add "Download as Markdown" button** in TechnologiesPageContent next to "Export" (JSON), with FileText icon and aria-label.

## Consequences

- Users can download the tech stack as a Markdown file for docs or sharing, aligned with other export options in the app.
- No format drift: markdown uses the same categories and structure as the JSON export.
- Run `npm run verify` locally to confirm tests, build, and lint pass.
