"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  Terminal,
  ScrollText,
  Folders,
  Ticket as TicketIcon,
  Layers,
  Sparkles,
  Database,
} from "lucide-react";
import { useRunState } from "@/context/run-state";
import { Loader2 } from "lucide-react";

/** Dashboard tabs (home page) + other routes. All in one left sidebar. */
const navItems: { href: string; label: string; icon: typeof LayoutDashboard; tab?: string }[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, tab: "dashboard" },
  { href: "/?tab=prompts", label: "Prompts & timing", icon: MessageSquare, tab: "prompts" },
  { href: "/?tab=projects", label: "Projects", icon: Folders, tab: "projects" },
  { href: "/?tab=tickets", label: "Tickets", icon: TicketIcon, tab: "tickets" },
  { href: "/?tab=feature", label: "Feature", icon: Layers, tab: "feature" },
  { href: "/?tab=ai-generate", label: "AI Generate", icon: Sparkles, tab: "ai-generate" },
  { href: "/?tab=data", label: "Data", icon: Database, tab: "data" },
  { href: "/?tab=log", label: "Log", icon: ScrollText, tab: "log" },
  { href: "/prompts", label: "Prompts", icon: MessageSquare },
  { href: "/configuration", label: "Configuration", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = pathname === "/" ? searchParams.get("tab") || "dashboard" : null;
  const [runningTerminalsOpen, setRunningTerminalsOpen] = useState(false);
  const {
    runningRuns,
    setSelectedRunId,
    stopRun,
    selectedRunId,
    isTauriEnv,
    loading,
  } = useRunState();

  const running = runningRuns.some((r) => r.status === "running");

  if (isTauriEnv === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isTauriEnv === false) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Run in Tauri</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This app is designed to run inside Tauri. Use{" "}
            <code className="rounded bg-muted px-1">npm run tauri dev</code> or
            build and open the desktop app.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen relative">
      {/* Running terminals widget */}
      <div
        className="fixed top-3 right-3 z-50 flex flex-col items-end"
        onMouseEnter={() => setRunningTerminalsOpen(true)}
        onMouseLeave={() => setRunningTerminalsOpen(false)}
      >
        <div className="flex items-center gap-1.5 rounded-lg border bg-background/95 px-2.5 py-1.5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium tabular-nums">
            {runningRuns.filter((r) => r.status === "running").length}
          </span>
          <span className="text-xs text-muted-foreground">running</span>
        </div>
        {runningTerminalsOpen && (
          <div className="mt-1 w-72 rounded-lg border bg-popover shadow-md p-2 max-h-80 overflow-auto">
            <p className="text-xs font-medium text-muted-foreground px-2 py-1">
              Running terminals
            </p>
            {runningRuns.length === 0 ? (
              <p className="text-sm text-muted-foreground px-2 py-2">
                No runs yet.
              </p>
            ) : (
              <ul className="space-y-1">
                {runningRuns.map((run) => (
                  <li
                    key={run.runId}
                    className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{run.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {run.status === "running" ? "Running…" : "Done"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        asChild
                      >
                        <Link
                          href="/?tab=log"
                          onClick={() => {
                            setSelectedRunId(run.runId);
                            setRunningTerminalsOpen(false);
                          }}
                        >
                          View log
                        </Link>
                      </Button>
                      {run.status === "running" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-destructive"
                          onClick={() => stopRun(run.runId)}
                        >
                          Stop
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside className="flex shrink-0 flex-col border-r bg-muted/30 w-48 py-4">
        <div className="px-3 pb-3 border-b border-border/50 mb-3">
          <h1 className="text-sm font-semibold">Run Prompts Control</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dashboard · Prompts · Projects · Tickets · Feature · Data · Log
          </p>
        </div>
        <nav className="flex flex-col gap-0.5 mx-2">
          {navItems.map(({ href, label, icon: Icon, tab }) => {
            const isActive = tab != null
              ? pathname === "/" && currentTab === tab
              : pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 w-full text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 p-4 md:p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
