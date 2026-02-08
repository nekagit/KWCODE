"use client";

import { useState, Suspense } from "react";
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
  Play,
  Lightbulb,
  Palette,
  LayoutGrid,
  Building2,
  PanelLeftClose,
  PanelLeftOpen,
  TestTube2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRunState } from "@/context/run-state";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; tab?: string };

/** Main nav: dashboard tabs + Run, prompts. */
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
  { href: "/testing", label: "Testing", icon: TestTube2 },
];

/** Log & DB Data section (separate group in sidebar). */
const logDataNavItems: NavItem[] = [
  { href: "/?tab=all", label: "Database", icon: LayoutGrid, tab: "all" },
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const {
    runningRuns,
    setSelectedRunId,
    stopRun,
    selectedRunId,
    isTauriEnv,
  } = useRunState();

  const running = runningRuns.some((r) => r.status === "running");
  // Treat null as false so we never block the whole app waiting for Tauri detection
  const isTauri = isTauriEnv === true;

  // No full-screen block: let the app shell and pages render. Run store data (allProjects, prompts)
  // loads in background; pages that need it show their own loading/retry so we never get stuck.

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

      {/* Sidebar: collapsible, fixed height */}
      <aside
        className={`flex shrink-0 flex-col border-r bg-muted/30 py-4 h-screen overflow-hidden transition-[width] duration-200 ease-in-out ${
          sidebarCollapsed ? "w-[3.25rem]" : "w-48"
        }`}
      >
        <div
          className={`px-3 pb-3 border-b border-border/50 mb-3 overflow-hidden ${
            sidebarCollapsed ? "px-2" : ""
          }`}
        >
          {!sidebarCollapsed && (
            <>
              <h1 className="text-sm font-semibold whitespace-nowrap">Run Prompts Control</h1>
              <p className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">
                Dashboard · Prompts · Projects · Tickets · Feature
              </p>
            </>
          )}
        </div>
        <nav className="flex flex-col gap-0.5 mx-2 flex-1 min-w-0">
          {mainNavItems.map(({ href, label, icon: Icon, tab }) => {
            const isActive = tab != null
              ? pathname === "/" && currentTab === tab
              : pathname === href || (href !== "/" && pathname.startsWith(href));
            const linkEl = (
              <Link
                href={href}
                className={`flex items-center gap-2 rounded-md py-2 w-full text-sm font-medium transition-colors ${
                  sidebarCollapsed ? "justify-center px-0" : "px-3"
                } ${
                  isActive
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{label}</span>}
              </Link>
            );
            return (
              <span key={href}>
                {sidebarCollapsed ? (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                    <TooltipContent side="right">{label}</TooltipContent>
                  </Tooltip>
                ) : (
                  linkEl
                )}
              </span>
            );
          })}
          <div className="my-2 border-t border-border/50 pt-2">
            {!sidebarCollapsed && (
<p className="px-3 mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
              Log & DB Data
            </p>
            )}
            {logDataNavItems.map(({ href, label, icon: Icon, tab }) => {
              const isActive = tab != null
                ? pathname === "/" && currentTab === tab
                : pathname === href || (href !== "/" && pathname.startsWith(href));
              const linkEl = (
                <Link
                  href={href}
                  className={`flex items-center gap-2 rounded-md py-2 w-full text-sm font-medium transition-colors ${
                    sidebarCollapsed ? "justify-center px-0" : "px-3"
                  } ${
                    isActive
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{label}</span>}
                </Link>
              );
              return (
                <span key={href}>
                  {sidebarCollapsed ? (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                      <TooltipContent side="right">{label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    linkEl
                  )}
                </span>
              );
            })}
          </div>
          <div className="mt-auto border-t border-border/50 pt-2">
            {!sidebarCollapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                Settings
              </p>
            )}
            {configNavItems.map(({ href, label, icon: Icon, tab }) => {
              const isActive = tab != null
                ? pathname === "/" && currentTab === tab
                : pathname === href || (href !== "/" && pathname.startsWith(href));
              const linkEl = (
                <Link
                  href={href}
                  className={`flex items-center gap-2 rounded-md py-2 w-full text-sm font-medium transition-colors ${
                    sidebarCollapsed ? "justify-center px-0" : "px-3"
                  } ${
                    isActive
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{label}</span>}
                </Link>
              );
              return (
                <span key={href}>
                  {sidebarCollapsed ? (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                      <TooltipContent side="right">{label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    linkEl
                  )}
                </span>
              );
            })}
          </div>
        </nav>
        <div className={`mt-2 mx-2 border-t border-border/50 pt-2 ${sidebarCollapsed ? "flex justify-center" : ""}`}>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={sidebarCollapsed ? "h-8 w-8" : "h-8 w-8"}
                onClick={() => setSidebarCollapsed((c) => !c)}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>

      {/* Main content: scrollable, sidebar stays fixed. Suspense only around content so nav feels instant. */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-auto p-4 md:p-6">
        <Suspense fallback={null}>{children}</Suspense>
      </main>
    </div>
  );
}
