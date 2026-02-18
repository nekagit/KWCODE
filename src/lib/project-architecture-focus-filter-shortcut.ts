"use client";

import { type RefObject } from "react";
import { useProjectTabFocusFilterShortcut } from "@/lib/project-tab-focus-filter-shortcut";

/**
 * On a project's Architecture tab (/projects/[id]?tab=architecture), pressing "/"
 * focuses the "Filter architectures by name" input unless focus is already in an
 * input, textarea, or select. Uses the Next.js app router pathname and search params.
 */
export function useProjectArchitectureFocusFilterShortcut(
  inputRef: RefObject<HTMLInputElement | null>
): void {
  useProjectTabFocusFilterShortcut(inputRef, "architecture");
}
