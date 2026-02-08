import type { Metadata } from "next";
import "@/app/globals.css";
import { RootLoadingOverlay } from "@/components/root-loading-overlay";
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
  return (
    <html lang="en" style={{ background: "hsl(var(--background))" }}>
      <head>
        {/* Apply stored UI theme before paint so first paint and loading overlay match Configuration choice */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("app-ui-theme");var v=["light","dark","ocean","forest","warm","red"];if(t&&v.indexOf(t)!==-1){document.documentElement.setAttribute("data-theme",t);}})();`,
          }}
        />
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
          #root-loading { position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:hsl(var(--background));color:hsl(var(--foreground));z-index:9999; }
          #root-loading[data-loaded=true] { opacity:0;pointer-events:none;transition:opacity .3s; }
          #root-loading .spinner { width:32px;height:32px;border:2px solid hsl(var(--border));border-top-color:hsl(var(--foreground));border-radius:50%;animation:root-load-spin .8s linear infinite; }
          @keyframes root-load-spin { to { transform: rotate(360deg); } }
        `}} />
      </head>
      <body className="min-h-screen antialiased bg-background text-foreground" style={{ background: "hsl(var(--background))", color: "hsl(var(--foreground))" }}>
        <RootLoadingOverlay />
        <RunStoreHydration />
        <TooltipProvider>
          <Toaster richColors position="top-center" />
          <AppShell>{children}</AppShell>
        </TooltipProvider>
      </body>
    </html>
  );
}
