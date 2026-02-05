import type { Metadata } from "next";
import { Suspense } from "react";
import "@/app/globals.css";
import { ClearLoadingOverlay } from "@/components/clear-loading-overlay";
import { RunStateProvider } from "@/context/run-state";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Run Prompts Control",
  description: "Control run_prompts_all_projects.sh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ background: "#fafafa" }}>
      <head>
        {/* Inline fallback so something is visible before any CSS/JS loads (fixes Tauri white screen) */}
        <style dangerouslySetInnerHTML={{ __html: `
          #root-loading { position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#fafafa;color:#171717;z-index:9999; }
          #root-loading[data-loaded=true] { opacity:0;pointer-events:none;transition:opacity .3s; }
          #root-loading .spinner { width:32px;height:32px;border:2px solid #e5e5e5;border-top-color:#171717;border-radius:50%;animation:root-load-spin .8s linear infinite; }
          @keyframes root-load-spin { to { transform: rotate(360deg); } }
        `}} />
      </head>
      <body className="min-h-screen antialiased bg-background text-foreground" style={{ background: "#fafafa", color: "#171717" }}>
        <div id="root-loading" className="fixed inset-0 flex items-center justify-center bg-background text-foreground z-[9999] transition-opacity duration-300 data-[loaded=true]:opacity-0 data-[loaded=true]:pointer-events-none" style={{ background: "#fafafa", color: "#171717" }} suppressHydrationWarning>
          <div className="flex flex-col items-center gap-3">
            <div className="spinner" style={{ width: 32, height: 32, border: "2px solid #e5e5e5", borderTopColor: "#171717", borderRadius: "50%", animation: "root-load-spin 0.8s linear infinite" }} />
            <p className="text-sm text-muted-foreground" style={{ margin: 0, fontSize: 14, color: "#737373" }}>Loading Run Prompts Control…</p>
          </div>
        </div>
        <ClearLoadingOverlay />
        <RunStateProvider>
          <Suspense
            fallback={
              <div className="fixed inset-0 flex items-center justify-center bg-background text-foreground" style={{ background: "#fafafa", color: "#171717" }}>
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full border-2 border-muted border-t-foreground" style={{ width: 32, height: 32 }} />
                  <p className="text-sm text-muted-foreground">Loading…</p>
                </div>
              </div>
            }
          >
            <AppShell>{children}</AppShell>
          </Suspense>
        </RunStateProvider>
      </body>
    </html>
  );
}
