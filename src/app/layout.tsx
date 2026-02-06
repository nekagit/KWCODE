import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import "@/app/globals.css";
import { ClearLoadingOverlay } from "@/components/clear-loading-overlay";
import { RunStoreHydration } from "@/store/run-store-hydration";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Run Prompts Control",
  description: "Control run_prompts_all_projects.sh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const devOrigin = "http://127.0.0.1:4000";
  const isDev = process.env.NODE_ENV === "development";

  return (
    <html lang="en" style={{ background: "#fafafa" }}>
      <head>
        {/* In dev (e.g. Tauri webview), base ensures asset URLs resolve to origin when document URL is /configuration etc. */}
        {isDev && <base href={`${devOrigin}/`} />}
        {/* Critical CSS: variables + base so Tauri webview has styles even if main stylesheet is delayed or blocked */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --background: 0 0% 100%;
            --foreground: 240 10% 3.9%;
            --card: 0 0% 100%;
            --card-foreground: 240 10% 3.9%;
            --muted: 240 4.8% 95.9%;
            --muted-foreground: 240 3.8% 46.1%;
            --border: 240 5.9% 90%;
            --primary: 240 5.9% 10%;
            --primary-foreground: 0 0% 98%;
            --secondary: 240 4.8% 95.9%;
            --accent: 240 4.8% 95.9%;
            --ring: 240 5.9% 10%;
            --radius: 0.5rem;
          }
          *,*::before,*::after { box-sizing: border-box; }
          * { border-color: hsl(var(--border)); }
          html, body { margin: 0; min-height: 100%; background: hsl(var(--background)); color: hsl(var(--foreground)); -webkit-font-smoothing: antialiased; }
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
        {/* Hide overlay after 2s; show "Continue" after 3s. Wait for DOM so #root-loading exists (streaming). */}
        <Script
          id="hide-loading-overlay"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  function go(){
    var el = document.getElementById("root-loading");
    if (!el) return;
    function hide(){ el.setAttribute("data-loaded", "true"); }
    setTimeout(hide, 2000);
    setTimeout(function(){
      if (el.getAttribute("data-loaded") !== "true" && !el.querySelector(".js-continue-btn")) {
        var btn = document.createElement("button");
        btn.className = "js-continue-btn";
        btn.textContent = "Continue";
        btn.style.cssText = "margin-top:12px;padding:8px 16px;background:#171717;color:#fafafa;border:none;border-radius:6px;cursor:pointer;font-size:14px;";
        btn.onclick = hide;
        var inner = el.querySelector("div");
        if (inner) inner.appendChild(btn);
      }
    }, 3000);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", go);
  } else {
    go();
  }
})();
            `.trim(),
          }}
        />
        {/* Duplicate as raw script so it runs even if next/script is deferred in Tauri webview */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){function go(){var el=document.getElementById("root-loading");if(!el)return;function hide(){el.setAttribute("data-loaded","true");}setTimeout(hide,2000);setTimeout(function(){if(el.getAttribute("data-loaded")!=="true"&&!el.querySelector(".js-continue-btn")){var b=document.createElement("button");b.className="js-continue-btn";b.textContent="Continue";b.style.cssText="margin-top:12px;padding:8px 16px;background:#171717;color:#fafafa;border:none;border-radius:6px;cursor:pointer;font-size:14px;";b.onclick=hide;var i=el.querySelector("div");if(i)i.appendChild(b);}},3000);}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",go);else go();})();`,
          }}
        />
        <ClearLoadingOverlay />
        <RunStoreHydration />
        <TooltipProvider>
          <Toaster richColors position="top-center" />
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
        </TooltipProvider>
      </body>
    </html>
  );
}
