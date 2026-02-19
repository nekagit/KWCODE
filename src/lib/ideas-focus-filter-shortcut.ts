"use client";

/** Ideas page: "/" focuses the filter input. Used by IdeasPageContent. */
import { type RefObject } from "react";
import { usePageFocusFilterShortcut } from "@/lib/page-focus-filter-shortcut";

/**
 * On the Ideas page (/ideas), pressing "/" focuses the filter input
 * unless focus is already in an input, textarea, or select.
 * Uses the Next.js app router pathname.
 */
export function useIdeasFocusFilterShortcut(
  inputRef: RefObject<HTMLInputElement | null>
): void {
  usePageFocusFilterShortcut(inputRef, "/ideas");
}
