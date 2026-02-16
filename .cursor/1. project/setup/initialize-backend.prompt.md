# Prompt: Initialize backend

Use when setting up or bootstrapping the backend/API for this project.

## Context

- Tech stack: see `.cursor/setup/backend.json` and `.cursor/project/TECH-STACK.md`.
- Runtime, framework, database, auth, and validation are defined there.

## Instructions

1. Read the backend setup JSON and TECH-STACK.
2. Scaffold or update the backend: server, DB connection, auth, core endpoints.
3. Ensure server runs and health check passes.
4. Update `.cursor/setup/backend.json` if you add endpoints or entities.

## Output

- Working backend/API (or delta if augmenting).
- Any new endpoints/entities reflected in setup JSON.
