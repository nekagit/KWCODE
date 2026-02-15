# Prompt: Refactoring

Use when refactoring a module or area without changing behavior.

## Context

- Scope: (files or area to refactor).
- Goal: (e.g. extract components, simplify types, align with .cursor/setup patterns).

## Instructions

1. Ensure tests exist and pass before refactor.
2. Refactor in small steps; run tests after each step.
3. Do not change public behavior or API contracts unless the ticket says so.
4. Update `.cursor/setup/` or docs if structure changes affect routes/entities.

## Output

- Refactored code and passing tests.
