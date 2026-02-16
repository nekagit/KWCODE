# Prompt: API documentation

Use when writing or updating API documentation.

## Context

- Endpoints: `.cursor/setup/backend.json` (endpoints list).
- Code: (point to route files or OpenAPI source if any).

## Instructions

1. List all public endpoints with method, path, request/response shape.
2. Document auth requirements and error responses.
3. Write to `.cursor/documentation/api-reference.md` or to `docs/api/` for Docusaurus.
4. Keep backend.json in sync if you add endpoints.

## Output

- Updated API docs (markdown or Docusaurus).
