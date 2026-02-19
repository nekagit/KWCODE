# ADR 0322 — Refactor: Unify clipboard usage

## Status

Accepted.

## Context

- Three components used raw `navigator.clipboard.writeText` instead of the shared `copyTextToClipboard` from `@/lib/copy-to-clipboard`: **PromptTableRow** (copy prompt content), **TestTemplateListItem** (copy template prompt), **GenerateKanbanPromptSection** (copy kanban prompt).
- The shared lib provides fallback via `document.execCommand('copy')` when the Clipboard API is unavailable (e.g. non-HTTPS, some iframes) and consistent success/error toasts. Using raw `navigator.clipboard` bypassed that and led to inconsistent behaviour and no fallback in those components.

## Decision

1. **Extend** `src/lib/copy-to-clipboard.ts`: add optional second parameter `options?: { silent?: boolean }`. When `silent: true`, do not show toasts; still return `true`/`false`. Call sites that show their own toast or Check state use `silent: true`.
2. **Refactor** `PromptTableRow.tsx`: replace `navigator.clipboard.writeText` with `copyTextToClipboard(content, { silent: true })`; on success show "Prompt copied to clipboard" and `setCopied(true)`; on failure show "Failed to copy". Behaviour unchanged.
3. **Refactor** `TestTemplateListItem.tsx`: use `copyTextToClipboard(t.prompt, { silent: true })`; on success `setCopiedId(t.id)` and clear after 2s. Behaviour unchanged.
4. **Refactor** `GenerateKanbanPromptSection.tsx`: use `copyTextToClipboard(kanbanPrompt)` (no silent) so the user gets the standard success/error toast and fallback.
5. **Tests:** add cases in `copy-to-clipboard.test.ts` for `silent: true` (no toast called on success, failure, or empty text).

## Consequences

- All copy actions go through one path: consistent fallback and error handling.
- Call sites that need custom feedback (toast message, Check icon) use `silent: true` and handle success/failure themselves.
- Same public behaviour; no user-facing change.
