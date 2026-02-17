# ADR 0052: Tauri invoke — implementation log commands use camelCase args

## Context

The Control tab in Tauri mode was failing with:

```text
invalid args `projectId` for command `get_implementation_log_entries`: command get_implementation_log_entries missing required key projectId
```

The frontend was calling `get_implementation_log_entries` and `update_implementation_log_entry_status` with snake_case keys (`project_id`, `entry_id`). Tauri’s command layer expects camelCase argument names for the frontend contract (e.g. `projectId`, `entryId`), consistent with other commands such as `stop_run` which use `runId`.

## Decision

- Use **camelCase** for all Tauri `invoke()` argument keys for implementation-log commands in the frontend.
- `get_implementation_log_entries`: pass `{ projectId }` instead of `{ project_id: projectId }`.
- `update_implementation_log_entry_status`: pass `{ projectId, entryId, status }` instead of `{ project_id, entry_id, status }`.

Rust command signatures remain snake_case (`project_id`, `entry_id`); only the frontend payload keys are camelCase.

## Files changed

- `src/components/molecules/TabAndContentSections/ProjectControlTab.tsx`: Updated both `invoke("get_implementation_log_entries", …)` and `invoke("update_implementation_log_entry_status", …)` to use camelCase argument keys.

## References

- ADR 0045: Implementation log dual mode (Tauri and API)
