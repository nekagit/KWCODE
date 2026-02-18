# ADR 0299 — Configuration page: Check API health button

## Status

Accepted.

## Context

In browser mode the Configuration page shows API health status (OK/Unavailable) from an initial load via `getApiHealth()`. Users could re-check API health only from the command palette (⌘K → "Check API health"). There was no inline way to re-run the check from the Configuration page.

## Decision

Add a **Check API health** button on the Configuration page when running in browser mode (`!isTauri`):

- Button placed next to the API health status text in the version/source row.
- On click: call `getApiHealth()`, update `apiHealthOk` state, show success toast (with version if present) or error toast. Button shows a loading state (spinning RefreshCw) while the request is in progress.
- Reuses existing `getApiHealth()` from `@/lib/api-health`; no new lib. Same behaviour as the command palette handler for consistency.

## Consequences

- Users on the Configuration page can re-check API health without opening the command palette.
- Parity with the palette action; single source of truth for the check logic (`getApiHealth`).
- Button only rendered in browser mode; no change for Tauri desktop.
