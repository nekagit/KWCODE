"use client";

import { useState, Suspense } from "react";
import { usePathname } from "next/navigation";
import { TerminalStatusBadge } from "@/components/molecules/Display/TerminalStatusBadge";
import { RunningTerminalsPopover } from "@/components/organisms/RunningTerminalsPopover";
import { SidebarNavigation } from "@/components/organisms/SidebarNavigation";
import { SidebarToggle } from "@/components/molecules/ControlsAndButtons/SidebarToggle";
import { useRunState } from "@/context/run-state";
import { QuickActionsFAB, useQuickActions } from "@/context/quick-actions-context";

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

  return (
    <div className="flex h-screen overflow-hidden relative bg-transparent">
      {/* Running terminals widget */}
      <TerminalStatusBadge
        runningRuns={runningRuns}
        onOpenChange={setRunningTerminalsOpen}
        open={runningTerminalsOpen}
      />

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
        <SidebarNavigation sidebarCollapsed={sidebarCollapsed} />
        <div className={`mt-2 mx-2 border-t border-border/50 pt-2 ${sidebarCollapsed ? "flex justify-center" : ""}`}>
          <SidebarToggle
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />
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
