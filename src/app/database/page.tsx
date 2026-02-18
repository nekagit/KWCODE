"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Database redirect page: /database
 *
 * Redirects to the Dashboard Database tab (/?tab=all). Aligns with Run (/run)
 * and Testing (/testing) as top-level routes; sidebar, command palette, and
 * Dashboard Database link point here for a consistent URL.
 */
export default function DatabaseRedirectPage() {
  const router = useRouter();
  const didRedirect = useRef(false);

  useEffect(() => {
    if (didRedirect.current) return;
    didRedirect.current = true;
    router.replace("/?tab=all");
  }, [router]);

  return (
    <div className="flex min-h-[200px] items-center justify-center text-muted-foreground text-sm">
      Redirecting to Database…
    </div>
  );
}
