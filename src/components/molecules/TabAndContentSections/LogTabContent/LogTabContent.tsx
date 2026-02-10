"use client";

import { useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { ScrollArea } from "@/components/shadcn/scroll-area";

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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Script output</CardTitle>
        <CardDescription className="text-base">
          {selectedRunId != null
            ? `Live output: ${runningRuns.find((r) => r.runId === selectedRunId)?.label ?? "Run"}`
            : "Select a run from the top-right to view its output, or start a run from Feature or Prompts."}
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
