"use client";

import { useEffect, type RefObject } from "react";
import { usePathname } from "next/navigation";

/**
 * On a page with the given pathname, pressing "/" focuses the given input
 * unless focus is already in an input, textarea, or select.
 * Uses the Next.js app router pathname. Shared implementation for Dashboard,
 * Projects, Prompts, Ideas, and Technologies pages.
 */
export function usePageFocusFilterShortcut(
  inputRef: RefObject<HTMLInputElement | null>,
  pathnameMatch: string
): void {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== pathnameMatch) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const el = inputRef.current;
      if (!el) return;
      e.preventDefault();
      el.focus();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pathname, pathnameMatch, inputRef]);
}
