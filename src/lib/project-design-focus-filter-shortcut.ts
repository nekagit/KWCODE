"use client";

import { useEffect, type RefObject } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * On a project's Design tab (/projects/[id]?tab=design), pressing "/" focuses the
 * "Filter designs by name" input unless focus is already in an input,
 * textarea, or select. Uses the Next.js app router pathname and search params.
 */
export function useProjectDesignFocusFilterShortcut(
  inputRef: RefObject<HTMLInputElement | null>
): void {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const match = pathname?.match(/^\/projects\/([^/]+)$/);
    if (!match || match[1] === "new") return;
    if (searchParams?.get("tab") !== "design") return;

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
