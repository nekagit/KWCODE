"use client";

import { useRef, useEffect } from "react";
import { Card } from "@/components/shared/Card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LogTabContentProps {
  displayLogLines: string[];
  selectedRunId: string | null;
  runningRuns: any[]; // Define a proper type for runningRuns if possible
  running: boolean;
}

export function LogTabContent({
  displayLogLines,
  selectedRunId,
  runningRuns,
  running,
}: LogTabContentProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayLogLines.length]);

  return (
    <Card
      title="Script output"
      subtitle={
        selectedRunId != null
          ? `Live output: ${runningRuns.find((r) => r.runId === selectedRunId)?.label ?? "Run"}`
          : "Select a run from the top-right to view its output, or start a run from Feature or Prompts."
      }
    >
      <ScrollArea className="h-[400px] rounded border bg-muted/30 p-3 font-mono text-sm">
        {displayLogLines.length === 0 && !running ? (
          <p className="text-muted-foreground">
            No output yet. Run a feature or start from the Prompts page, then open running terminals (top-right) to view.
          </p>
        ) : (
          displayLogLines.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap break-all">
              {line}
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </ScrollArea>
    </Card>
  );
}
