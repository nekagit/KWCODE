# ADR 0032: Run port settable in project details without repo path

## Status

Accepted.

## Context

ADR 0024 added run port display and "Set port" / "View Running Project" in the project details top bar. The port UI was initially gated by `project.repoPath`, so the port input and badge only rendered when the project had a repo path set. Users reported they could not set the port in project details—either because the project had no repo path yet or the control was hard to discover.

## Decision

- **Show port UI unconditionally:** The run port section (badge when set, or "Set port" input + button when unset) and the "View Running Project" button are always visible in the project details top bar, regardless of whether `project.repoPath` is set.
- **View Running Project** remains disabled when `project.runPort == null` (tooltip: "Set run port above first"). No change to modal or iframe behavior.

## Implementation

- `src/components/organisms/ProjectDetailsPageContent.tsx`: Removed the `project.repoPath &&` wrapper around the run port block and the "View Running Project" button so both render whenever project details are shown. Port can be set and updated even when the project has no repo path.

## Fix: "Failed to save port" when using Tauri

When saving the port from the UI, the frontend sends only `{ runPort: number }` to `update_project`. The Tauri backend deserialized the body into the full `Project` struct; the `name` field had no `#[serde(default)]`, so partial JSON caused a deserialization error ("missing field `name`") and the user saw "Failed to save port".

- `src-tauri/src/lib.rs`: Added `#[serde(default)]` to `Project.name` so partial updates (e.g. only `runPort`) deserialize successfully. The existing merge logic already uses `base.name` when `updated.name.is_empty()`.

## Consequences

- Users can set and edit the run port from project details at any time, including before setting a repo path.
- "View Running Project" is always visible but disabled until a port is set; no dependency on repo path for visibility.
