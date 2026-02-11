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
  Terminal,
  Folders,
  Ticket as TicketIcon,
  Layers,
  Lightbulb,
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
import { useQuickActions, QuickActionsFAB } from "@/context/quick-actions-context";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; tab?: string };

/** Dashboard at top; then grouped: Tools (Testing, Architecture, Database, Ideas), Work (Projects, Tickets, Feature, PromptRecords). */
const dashboardNavItem: NavItem = {
  href: "/",
  label: "Dashboard",
  icon: LayoutDashboard,
  tab: "dashboard",
};

/** Group: Testing, Architecture, Database, Ideas. */
const toolsNavItems: NavItem[] = [
  { href: "/testing", label: "Testing", icon: TestTube2 },
  { href: "/architecture", label: "Architecture", icon: Building2 },
  { href: "/?tab=all", label: "Database", icon: LayoutGrid, tab: "all" },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
];

/** Group: Projects, Tickets, Features, PromptRecords. */
const workNavItems: NavItem[] = [
  { href: "/projects", label: "Projects", icon: Folders },
  { href: "/?tab=tickets", label: "Tickets", icon: TicketIcon, tab: "tickets" },
  { href: "/?tab=feature", label: "Feature", icon: Layers, tab: "feature" },
  { href: "/prompts", label: "PromptRecords", icon: MessageSquare },
];

/** Reads search params for home tab; isolated so only this subtree suspends, not the whole shell. */
function SidebarNavWithParams({
  pathname,
  sidebarCollapsed,
}: {
  pathname: string;
  sidebarCollapsed: boolean;
}) {
  const searchParams = useSearchParams();
  const currentTab = pathname === "/" ? searchParams.get("tab") || "dashboard" : null;
  return (
    <SidebarNavLinks
      pathname={pathname}
      currentTab={currentTab}
      sidebarCollapsed={sidebarCollapsed}
    />
  );
}

function SidebarNavLinks({
  pathname,
  currentTab,
  sidebarCollapsed,
}: {
  pathname: string;
  currentTab: string | null;
  sidebarCollapsed: boolean;
}) {
  const renderItem = (item: NavItem) => {
    const { href, label, icon: Icon, tab } = item;
    const isActive = tab != null
      ? pathname === "/" && currentTab === tab
      : pathname === href || (href !== "/" && pathname.startsWith(href));
    const linkEl = (
      <Link
        href={href}
        className={`flex items-center gap-2 rounded-md py-2.5 w-full text-sm font-medium transition-colors ${
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
  };
  return (
    <>
      {renderItem(dashboardNavItem)}
      <div className="flex flex-col flex-1 min-h-0 gap-4 mt-4">
        <div className="flex flex-col flex-1 min-h-0 border-t border-border/50 pt-4 gap-1">
          {!sidebarCollapsed && (
            <p className="px-3 mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 shrink-0">
              Testing · Architecture · Data
            </p>
          )}
          {toolsNavItems.map(renderItem)}
        </div>
        <div className="flex flex-col flex-1 min-h-0 border-t border-border/50 pt-4 gap-1">
          {!sidebarCollapsed && (
            <p className="px-3 mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 shrink-0">
              Projects · Tickets · Features
            </p>
          )}
          {workNavItems.map(renderItem)}
        </div>
      </div>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [runningTerminalsOpen, setRunningTerminalsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const {
    runningRuns,
    setSelectedRunId,
    stopRun,
    isTauriEnv,
  } = useRunState();
  const { openLogModal } = useQuickActions();

  const running = runningRuns.some((r) => r.status === "running");
  const isTauri = isTauriEnv === true;

  return (
    <div className="flex h-screen overflow-hidden relative bg-transparent">
      {/* Running terminals widget */}
      <Popover open={runningTerminalsOpen} onOpenChange={setRunningTerminalsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="fixed top-3 right-3 z-50 flex items-center gap-1.5 rounded-lg border bg-background/95 px-2.5 py-1.5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:bg-muted/50 transition-colors glasgmorphism"
          >
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary" className="tabular-nums font-medium">
              {runningRuns.filter((r) => r.status === "running").length} running
            </Badge>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 max-h-80 overflow-auto glasgmorphism" align="end">
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
                      onClick={() => {
                        setSelectedRunId(run.runId);
                        setRunningTerminalsOpen(false);
                        openLogModal(run.runId);
                      }}
                    >
                      View log
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

      {/* Sidebar: collapsible, fixed height. useSearchParams only inside Suspense so shell never suspends. */}
      <aside
        className={`flex shrink-0 flex-col border-r bg-transparent py-4 h-screen overflow-hidden transition-[width] duration-200 ease-in-out glasgmorphism ${
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
              <h1 className="text-xl font-bold whitespace-nowrap uppercase">KWCode</h1>
              <p className="text-sm text-muted-foreground mt-0.5 whitespace-nowrap uppercase">
                Dashboard · PromptRecords · Projects · Tickets · Feature
              </p>
            </>
          )}
        </div>
        <nav className="flex flex-col flex-1 min-w-0 w-full px-2 gap-1">
          <Suspense fallback={<SidebarNavLinks pathname={pathname} currentTab="dashboard" sidebarCollapsed={sidebarCollapsed} />}>
            <SidebarNavWithParams pathname={pathname} sidebarCollapsed={sidebarCollapsed} />
          </Suspense>
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

      {/* Main content: scrollable, sidebar stays fixed. Normal colorless loading between pages; only initial app load is animated (root overlay). */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-auto p-4 md:p-6">
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center" aria-hidden>
              <div className="h-8 w-8 rounded-full border-2 border-border border-t-muted-foreground animate-spin" />
            </div>
          }
        >
          <div className="flex flex-col min-h-0 flex-1">
            {children}
          </div>
        </Suspense>
      </main>

      {/* Flutter-style FAB: always visible bottom-right; hover reveals Log, Run, Configuration */}
      <QuickActionsFAB />
    </div>
  );
}
