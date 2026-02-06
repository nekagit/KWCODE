"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Empty } from "@/components/ui/empty";
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
  Play,
  Lightbulb,
  Palette,
  LayoutGrid,
  Building2,
} from "lucide-react";
import { useRunState } from "@/context/run-state";
import { Loader2 } from "lucide-react";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; tab?: string };

/** Main nav: dashboard tabs + Run, prompts, AI generate. */
const mainNavItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, tab: "dashboard" },
  { href: "/run", label: "Run", icon: Play },
  { href: "/projects", label: "Projects", icon: Folders },
  { href: "/?tab=tickets", label: "Tickets", icon: TicketIcon, tab: "tickets" },
  { href: "/?tab=feature", label: "Feature", icon: Layers, tab: "feature" },
  { href: "/prompts", label: "Prompts", icon: MessageSquare },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/design", label: "Design", icon: Palette },
  { href: "/architecture", label: "Architecture", icon: Building2 },
  { href: "/?tab=ai-generate", label: "AI Generate", icon: Sparkles, tab: "ai-generate" },
];

/** Log & Data section (separate group in sidebar). */
const logDataNavItems: NavItem[] = [
  { href: "/?tab=all", label: "All data", icon: LayoutGrid, tab: "all" },
  { href: "/?tab=data", label: "Data", icon: Database, tab: "data" },
  { href: "/?tab=log", label: "Log", icon: ScrollText, tab: "log" },
];

/** Configuration at bottom. */
const configNavItems: NavItem[] = [
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
  // Treat null as false so we never block the whole app waiting for Tauri detection
  const isTauri = isTauriEnv === true;

  // Show loading spinner only in Tauri while data is loading; in browser data loads in background
  if (loading && isTauri) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Running terminals widget */}
      <Popover open={runningTerminalsOpen} onOpenChange={setRunningTerminalsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="fixed top-3 right-3 z-50 flex items-center gap-1.5 rounded-lg border bg-background/95 px-2.5 py-1.5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:bg-muted/50 transition-colors"
          >
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary" className="tabular-nums font-medium">
              {runningRuns.filter((r) => r.status === "running").length} running
            </Badge>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 max-h-80 overflow-auto" align="end">
          <p className="text-xs font-medium text-muted-foreground px-2 py-1 mb-2">
            Running terminals
          </p>
          {runningRuns.length === 0 ? (
            <Empty
              title="No runs yet"
              description="Start a run from Dashboard or Run page."
              icon={<Terminal className="h-6 w-6" />}
            />
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
        </PopoverContent>
      </Popover>

      {/* Sidebar: fixed 100vh, does not scroll */}
      <aside className="flex shrink-0 flex-col border-r bg-muted/30 w-48 py-4 h-screen">
        <div className="px-3 pb-3 border-b border-border/50 mb-3">
          <h1 className="text-sm font-semibold">Run Prompts Control</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dashboard · Prompts · Projects · Tickets · Feature
          </p>
        </div>
        <nav className="flex flex-col gap-0.5 mx-2 flex-1">
          {mainNavItems.map(({ href, label, icon: Icon, tab }) => {
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
          <div className="my-2 border-t border-border/50 pt-2">
            <p className="px-3 mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
              Log & Data
            </p>
            {logDataNavItems.map(({ href, label, icon: Icon, tab }) => {
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
          </div>
          <div className="mt-auto border-t border-border/50 pt-2">
            <p className="px-3 mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
              Settings
            </p>
            {configNavItems.map(({ href, label, icon: Icon, tab }) => {
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
          </div>
        </nav>
      </aside>

      {/* Main content: scrollable, sidebar stays fixed */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
