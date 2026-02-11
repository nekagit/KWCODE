import React from 'react';
import { Button } from "@/components/shadcn/button";
import { ScrollText } from "lucide-react";
import type { RunningRun } from "@/store/run-store";

interface ViewLogButtonProps {
  onClick: () => void;
  runningRuns: RunningRun[];
  setSelectedRunId: (id: string | null) => void;
}

export const ViewLogButton: React.FC<ViewLogButtonProps> = ({
  onClick,
  runningRuns,
  setSelectedRunId,
}) => {
  return (
    <Button
      variant="outline"
      onClick={() => {
        setSelectedRunId(runningRuns[runningRuns.length - 1]?.runId ?? null);
        onClick();
      }}
    >
      <ScrollText className="h-4 w-4 mr-2" />
      View log
    </Button>
  );
};
