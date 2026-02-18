"use client";

import { useEffect, type RefObject } from "react";
import { usePathname } from "next/navigation";

/**
 * On the Ideas page (/ideas), pressing "/" focuses the filter input
 * unless focus is already in an input, textarea, or select.
 * Uses the Next.js app router pathname.
 */
export function useIdeasFocusFilterShortcut(
  inputRef: RefObject<HTMLInputElement | null>
): void {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/ideas") return;

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
  }, [pathname, inputRef]);
}
