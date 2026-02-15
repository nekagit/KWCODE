"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { usePathname } from "next/navigation";
import { TerminalStatusBadge } from "@/components/molecules/Display/TerminalStatusBadge";
import { SidebarNavigation } from "@/components/organisms/SidebarNavigation";
import { SidebarToggle } from "@/components/molecules/ControlsAndButtons/SidebarToggle";
import { useRunState } from "@/context/run-state";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FloatingTerminalDialog } from "@/components/shared/FloatingTerminalDialog";

const SIDEBAR_STORAGE_KEY = "kwcode-sidebar-width";
const SIDEBAR_MIN = 160;
const SIDEBAR_MAX = 400;
const SIDEBAR_DEFAULT = 192; // w-48
const SIDEBAR_COLLAPSED = 52; // 3.25rem

function getStoredSidebarWidth(): number {
  if (typeof window === "undefined") return SIDEBAR_DEFAULT;
  const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
  if (stored == null) return SIDEBAR_DEFAULT;
  const n = parseInt(stored, 10);
  return Number.isFinite(n) ? Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, n)) : SIDEBAR_DEFAULT;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  useEffect(() => {
    setSidebarWidth(getStoredSidebarWidth());
  }, []);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(SIDEBAR_DEFAULT);
  const lastWidthRef = useRef(SIDEBAR_DEFAULT);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = sidebarWidth;
  }, [sidebarWidth]);

  useEffect(() => {
    if (!isResizing) return;
    document.body.classList.add("select-none", "cursor-col-resize");
    const onMove = (e: MouseEvent) => {
      const delta = e.clientX - resizeStartX.current;
      const next = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, resizeStartWidth.current + delta));
      lastWidthRef.current = next;
      setSidebarWidth(next);
    };
    const onUp = () => {
      setIsResizing(false);
      document.body.classList.remove("select-none", "cursor-col-resize");
      const toStore = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, lastWidthRef.current));
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(toStore));
      } catch (_) { }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      document.body.classList.remove("select-none", "cursor-col-resize");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isResizing]);

  const currentWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED : sidebarWidth;

  const {
    runningRuns,
    setSelectedRunId,
    stopRun,
    isTauriEnv,
  } = useRunState();

  return (
    <div className="flex h-screen overflow-hidden relative bg-transparent">
      {/* Running terminals widget */}

      {/* Sidebar: expandable and resizable. useSearchParams only inside Suspense so shell never suspends. */}
      <aside
        className="flex shrink-0 flex-col border-r border-border/60 bg-sidebar h-screen overflow-hidden relative"
        style={{
          width: `${currentWidth}px`,
          transition: isResizing ? "none" : "width 200ms ease-in-out",
        }}
        suppressHydrationWarning
      >
        {/* Branded header */}
        <div
          className={`sidebar-brand-underline shrink-0 overflow-hidden transition-all duration-200 ${sidebarCollapsed ? "px-2 py-3" : "px-4 pt-5 pb-4"
            }`}
        >
          {!sidebarCollapsed ? (
            <h1 className="text-lg font-extrabold whitespace-nowrap tracking-wide text-foreground/90">
              <span className="text-primary">KW</span>Code
            </h1>
          ) : (
            <h1 className="text-sm font-extrabold text-center text-primary">
              KW
            </h1>
          )}
        </div>

        {/* Scrollable nav area */}
        <div className="flex-1 min-h-0 overflow-y-auto sidebar-nav-scroll">
          <SidebarNavigation sidebarCollapsed={sidebarCollapsed} />
        </div>

        {/* Toggle footer */}
        <div className={`shrink-0 px-2 py-2 border-t border-border/40 ${sidebarCollapsed ? "flex justify-center" : ""
          }`}>
          <SidebarToggle
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />
        </div>

        {/* Resize handle */}
        {!sidebarCollapsed && (
          <div
            role="separator"
            aria-label="Resize sidebar"
            onMouseDown={startResize}
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:w-1.5 hover:bg-primary/20 active:bg-primary/30 transition-all shrink-0 z-10"
          />
        )}
      </aside>

      {/* Main content: scrollable, sidebar stays fixed. Grey-black content area for contrast with dark-black sidebar. */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-auto p-6 md:p-8 lg:p-10 xl:p-12 bg-background">
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center" aria-hidden>
              <div className="h-8 w-8 rounded-full border-2 border-border border-t-muted-foreground animate-spin" />
            </div>
          }
        >
          <ErrorBoundary fallbackTitle="Page error">
            <div className="flex flex-col min-h-0 flex-1">
              {children}
            </div>
          </ErrorBoundary>
        </Suspense>
      </main>

      {/* Floating terminal dialog for setup-prompt runs */}
      <FloatingTerminalDialog />
    </div>
  );
}
