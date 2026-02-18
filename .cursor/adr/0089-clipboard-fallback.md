# ADR 0089: Clipboard fallback for constrained environments

## Status

Accepted. Implemented 2025-02-18 (night shift).

## Context

`copyTextToClipboard` in `src/lib/copy-to-clipboard.ts` used only `navigator.clipboard.writeText()`. The Clipboard API requires a secure context (HTTPS or localhost) and can be unavailable in some iframes or older environments. When it is missing or rejects (e.g. permission denied), the copy failed with a generic "Failed to copy" toast and no alternative path.

## Decision

- **Try Clipboard API first**  
  When `navigator.clipboard` and `writeText` exist, use them as before.

- **Fallback to execCommand('copy')**  
  If the Clipboard API is unavailable or `writeText` throws, fall back to a temporary textarea: append to `document.body`, select, call `document.execCommand('copy')`, then remove the textarea. This works in many non-secure or restricted contexts where the Clipboard API is not exposed.

- **Same public API and toasts**  
  `copyTextToClipboard(text): Promise<boolean>` is unchanged; success and error toasts are unchanged. Callers do not need to know which path was used.

## Consequences

- Copy-to-clipboard is more reliable in non-HTTPS or constrained environments (e.g. HTTP dev, certain iframes).
- Fallback is internal to `copy-to-clipboard.ts`; no changes required in components or other libs.
- Unit tests cover success path, empty input, clipboard rejection, and missing clipboard (Node env has no document so fallback returns false there).
- `execCommand('copy')` is deprecated but still widely supported; the fallback is a pragmatic compatibility measure until Clipboard API is universally available.
