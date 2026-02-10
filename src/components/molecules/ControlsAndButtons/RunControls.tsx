"use client";

import { Button } from "@/components/shadcn/button";
import { Play, Square } from "lucide-react";
import Link from "next/link";

interface RunControlsProps {
  handleStart: () => Promise<void>;
  handleStop: () => Promise<void>;
  canStart: boolean;
  running: boolean;
}

export function RunControls({
  handleStart,
  handleStop,
  canStart,
  running,
}: RunControlsProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleStart} disabled={!canStart}>
          <Play className="mr-2 h-4 w-4" />
          Start
        </Button>
        <Button variant="destructive" onClick={handleStop} disabled={!running}>
          <Square className="mr-2 h-4 w-4" />
          Stop
        </Button>
        {!canStart && (
          <span className="text-sm text-muted-foreground">
            Select at least one prompt and one project to run.
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Timing (delays between operations) is configured on the{" "}
        <Link href="/configuration" className="underline hover:text-foreground">
          Configuration
        </Link>{" "}
        page. View output in the{" "}
        <Link href="/?tab=log" className="underline hover:text-foreground">
          Log
        </Link>{" "}
        tab.
      </p>
    </div>
  );
}
