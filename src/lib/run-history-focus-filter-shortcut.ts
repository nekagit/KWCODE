"use client";

import { useEffect, type RefObject } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * On a project's Run tab (/projects/[id]?tab=worker), pressing "/" focuses the
 * run history "Filter by label" input unless focus is already in an input,
 * textarea, or select. Uses the Next.js app router pathname and search params.
 */
export function useRunHistoryFocusFilterShortcut(
  inputRef: RefObject<HTMLInputElement | null>
): void {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Must be on a project detail page (e.g. /projects/abc-123), not /projects or /projects/new
    const match = pathname?.match(/^\/projects\/([^/]+)$/);
    if (!match || match[1] === "new") return;
    if (searchParams?.get("tab") !== "worker") return;

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
  }, [pathname, searchParams, inputRef]);
}
