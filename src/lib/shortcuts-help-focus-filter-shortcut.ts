"use client";

import { useEffect, type RefObject } from "react";

/**
 * When the Shortcuts Help dialog is open, pressing "/" focuses the filter input
 * unless focus is already in an input, textarea, or select.
 * Uses capture phase so this runs before page-level "/" handlers when the dialog is open.
 */
export function useShortcutsHelpFocusFilterShortcut(
  inputRef: RefObject<HTMLInputElement | null>,
  dialogOpen: boolean
): void {
  useEffect(() => {
    if (!dialogOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const el = inputRef.current;
      if (!el) return;
      e.preventDefault();
      el.focus();
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [dialogOpen, inputRef]);
}
