"use client";

import { useEffect, type RefObject } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export type ProjectTabSlug = "design" | "architecture" | "worker" | "git";

/**
 * On a project detail page (/projects/[id]?tab=<tab>), pressing "/" focuses the
 * given input unless focus is already in an input, textarea, or select.
 * Uses the Next.js app router pathname and search params.
 * Shared implementation for Design, Architecture, Run (worker), and Versioning (git) tabs.
 */
export function useProjectTabFocusFilterShortcut(
  inputRef: RefObject<HTMLInputElement | null>,
  tab: ProjectTabSlug
): void {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const match = pathname?.match(/^\/projects\/([^/]+)$/);
    if (!match || match[1] === "new") return;
    if (searchParams?.get("tab") !== tab) return;

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
  }, [pathname, searchParams, inputRef, tab]);
}
