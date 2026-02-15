# Development workflows

Reusable best practices for Git, commits, PRs, and code quality.

## Git branching strategy

- **main** (or master): stable; all changes via PR.
- **Feature branches:** `feat/short-name` or `feature/description`; branch from main, PR back.
- **Fix branches:** `fix/short-name` for bugs.

## Commit message format

- `type(scope): message`
- Types: feat, fix, docs, style, refactor, test, chore
- Scope: area (e.g. auth, planner, worker)
- Example: `feat(planner): add ticket-templates folder`

## PR review process

- Open PR with clear title and description; link ticket if any.
- Request review; address comments.
- Ensure CI (lint, test, build) passes before merge.

## Code quality checks

- Lint (ESLint) and format (Prettier) before commit.
- Run tests and build; fix failures before pushing.
- Reference `.cursor/documentation/code-organization.md` for structure.
