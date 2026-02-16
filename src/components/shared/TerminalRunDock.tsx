"use client";

import React from "react";
import { useRunStore } from "@/store/run-store";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Dock of small circles in the bottom-right. One circle per run in runningRuns.
 * Clicking a circle opens the floating terminal with that run's output.
 */
export function TerminalRunDock() {
  const runningRuns = useRunStore((s) => s.runningRuns);
  const floatingRunId = useRunStore((s) => s.floatingTerminalRunId);
  const setFloatingTerminalRunId = useRunStore((s) => s.setFloatingTerminalRunId);
  const setFloatingTerminalMinimized = useRunStore((s) => s.setFloatingTerminalMinimized);

  const handleCircleClick = (runId: string) => {
    setFloatingTerminalRunId(runId);
    setFloatingTerminalMinimized(false);
  };

  if (runningRuns.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-40 flex flex-col-reverse items-center gap-2"
      aria-label="Run terminals"
    >
      <TooltipProvider delayDuration={300}>
        {runningRuns.map((run) => {
          const isActive = run.runId === floatingRunId;
          const isRunning = run.status === "running";
          return (
            <Tooltip key={run.runId}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => handleCircleClick(run.runId)}
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
                    isActive
                      ? "border-primary bg-primary/20 shadow-lg shadow-primary/20"
                      : "border-border/60 bg-card/90 shadow-md hover:border-primary/50 hover:bg-card",
                    isRunning && "ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-background"
                  )}
                  aria-label={`Open terminal: ${run.label}`}
                  aria-pressed={isActive}
                >
                  <span
                    className={cn(
                      "size-2.5 rounded-full",
                      isRunning
                        ? "bg-emerald-400 animate-pulse"
                        : "bg-sky-400"
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[200px]">
                <p className="text-xs font-medium truncate">{run.label}</p>
                <p className="text-[10px] text-muted-foreground">
                  {isRunning ? "Running" : "Done"} · Click to open terminal
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
