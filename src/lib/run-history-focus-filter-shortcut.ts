"use client";

import { type RefObject } from "react";
import { useProjectTabFocusFilterShortcut } from "@/lib/project-tab-focus-filter-shortcut";

/**
 * On a project's Run tab (/projects/[id]?tab=worker), pressing "/" focuses the
 * run history "Filter by label" input unless focus is already in an input,
 * textarea, or select. Uses the Next.js app router pathname and search params.
 */
export function useRunHistoryFocusFilterShortcut(
  inputRef: RefObject<HTMLInputElement | null>
): void {
  useProjectTabFocusFilterShortcut(inputRef, "worker");
}
