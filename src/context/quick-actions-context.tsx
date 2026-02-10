"use client";

import React, { createContext, useCallback, useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ScrollText, Play, Settings, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/shadcn/dialog";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { useRunState } from "@/store/run-store";
import RunPage from "@/app/run/page";
import ConfigurationPage from "@/app/configuration/page";

type QuickModal = "log" | "run" | "config" | null;

interface QuickActionsContextValue {
  openLogModal: (runId?: string | null) => void;
  openRunModal: () => void;
  openConfigModal: () => void;
}

const QuickActionsContext = createContext<QuickActionsContextValue | null>(null);

export function useQuickActions() {
  const ctx = useContext(QuickActionsContext);
  if (!ctx) throw new Error("useQuickActions must be used within QuickActionsProvider");
  return ctx;
}

function LogModalContent({ initialRunId }: { initialRunId?: string | null }) {
  const { runningRuns, selectedRunId, setSelectedRunId } = useRunState();
  const run = React.useMemo(() => {
    if (initialRunId != null) return runningRuns.find((r) => r.runId === initialRunId);
    if (selectedRunId != null) return runningRuns.find((r) => r.runId === selectedRunId);
    return runningRuns[runningRuns.length - 1];
  }, [runningRuns, selectedRunId, initialRunId]);
  const displayLogLines = run?.logLines ?? [];
  const running = runningRuns.some((r) => r.status === "running");
  const logEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (initialRunId != null) setSelectedRunId(initialRunId);
  }, [initialRunId, setSelectedRunId]);

  React.useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayLogLines.length]);

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Script output</DialogTitle>
        <DialogDescription>
          {run
            ? `Live output: ${run.label ?? "Run"}`
            : "Select a run from the top-right to view its output, or start a run from Feature or Prompts."}
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="h-[400px] rounded border bg-muted/30 p-3 font-mono text-sm">
        {displayLogLines.length === 0 && !running && (
          <p className="text-muted-foreground">
            No output yet. Run a feature or start from the Prompts page, then open running terminals (top-right) to view.
          </p>
        )}
        {displayLogLines.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-all">
            {line}
          </div>
        ))}
        <div ref={logEndRef} />
      </ScrollArea>
    </div>
  );
}

const FAB_ACTIONS = [
  { id: "log" as const, label: "Log", icon: ScrollText },
  { id: "run" as const, label: "Run", icon: Play },
  { id: "config" as const, label: "Configuration", icon: Settings },
] as const;

/** Flutter-style FAB: always-visible main button bottom-right; hover reveals 3 action circles (Log, Run, Configuration). Portaled to body so it is never clipped by overflow-hidden on AppShell. */
export function QuickActionsFAB() {
  const { openLogModal, openRunModal, openConfigModal } = useQuickActions();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const fabContent = (
    <div
      className="fixed bottom-6 right-6 z-[99999] flex flex-col items-end gap-3 pointer-events-none"
      aria-label="Quick actions (Run, Log, Configuration)"
    >
      <div className="pointer-events-auto flex flex-col items-end gap-3">
        <div className="group flex flex-col items-end gap-3">
          {FAB_ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              aria-label={action.label}
              title={action.label}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-card text-card-foreground shadow-md border border-border transition-all duration-200 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              style={{
                boxShadow:
                  "0 2px 4px -1px rgba(0,0,0,0.06), 0 4px 6px -1px rgba(0,0,0,0.1), 0 6px 12px -2px rgba(0,0,0,0.08)",
              }}
              onClick={() => {
                if (action.id === "log") openLogModal();
                if (action.id === "run") openRunModal();
                if (action.id === "config") openConfigModal();
              }}
            >
              <action.icon className="h-5 w-5" />
            </button>
          ))}
          <div
            className="flex h-14 w-14 min-w-[3.5rem] min-h-[3.5rem] items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-primary/20 transition-all duration-200 group-hover:shadow-[0_8px_16px_-2px_rgba(0,0,0,0.2),0_12px_24px_-4px_rgba(0,0,0,0.15)] group-hover:scale-105 cursor-pointer border-0"
            style={{
              boxShadow:
                "0 4px 6px -1px rgba(0,0,0,0.1), 0 6px 12px -2px rgba(0,0,0,0.08), 0 10px 20px -4px rgba(0,0,0,0.12)",
            }}
            role="button"
            tabIndex={0}
            aria-label="Open quick actions (Log, Run, Configuration)"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                (e.currentTarget.parentElement?.querySelector("button") as HTMLElement)?.focus();
              }
            }}
          >
            <Plus className="h-7 w-7 shrink-0" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted || typeof document === "undefined") return null;
  return createPortal(fabContent, document.body);
}

export function QuickActionsProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<QuickModal>(null);
  const [logModalRunId, setLogModalRunId] = useState<string | null>(null);

  const openLogModal = useCallback((runId?: string | null) => {
    setLogModalRunId(runId ?? null);
    setModal("log");
  }, []);
  const openRunModal = useCallback(() => setModal("run"), []);
  const openConfigModal = useCallback(() => setModal("config"), []);

  const value: QuickActionsContextValue = {
    openLogModal,
    openRunModal,
    openConfigModal,
  };

  const closeModal = useCallback(() => {
    setModal(null);
    setLogModalRunId(null);
  }, []);

  return (
    <QuickActionsContext.Provider value={value}>
      {children}

      {/* Modals */}
      <Dialog open={modal === "log"} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <LogModalContent initialRunId={logModalRunId} />
        </DialogContent>
      </Dialog>

      <Dialog open={modal === "run"} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <ScrollArea className="max-h-[85vh]">
            <div className="p-6">
              <RunPage />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={modal === "config"} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <ScrollArea className="max-h-[85vh]">
            <div className="p-6">
              <ConfigurationPage />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </QuickActionsContext.Provider>
  );
}
