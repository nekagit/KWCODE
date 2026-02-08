"use client";

import { useEffect, useState } from "react";

/**
 * Root loading overlay: shown until the client has mounted, then hidden.
 * Visibility is controlled by React state so it stays hidden after hydration
 * (avoids inline script / DOM mutation being reset by React).
 */
export function RootLoadingOverlay() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div
      id="root-loading"
      className="fixed inset-0 flex items-center justify-center bg-background text-foreground z-[9999] transition-opacity duration-300 data-[loaded=true]:opacity-0 data-[loaded=true]:pointer-events-none"
      style={{ background: "hsl(var(--background))", color: "hsl(var(--foreground))" }}
      data-loaded={loaded ? "true" : undefined}
      suppressHydrationWarning
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="spinner"
          style={{
            width: 32,
            height: 32,
            border: "2px solid #e5e5e5",
            borderTopColor: "#171717",
            borderRadius: "50%",
            animation: "root-load-spin 0.8s linear infinite",
          }}
        />
        <p
          className="text-sm text-muted-foreground"
          style={{ margin: 0, fontSize: 14, color: "#737373" }}
        >
          Loading Run Prompts Control…
        </p>
      </div>
    </div>
  );
}
