import React from 'react';
import { Button } from "@/components/shadcn/button";
import { ListOrdered, Play, Loader2 } from "lucide-react";
import { ButtonGroup } from "@/components/shared/ButtonGroup";

interface FeatureQueueActionsProps {
  featureQueueLength: number;
  running: boolean;
  onRunQueue: () => void;
  onClearQueue: () => void;
}

export const FeatureQueueActions: React.FC<FeatureQueueActionsProps> = ({
  featureQueueLength,
  running,
  onRunQueue,
  onClearQueue,
}) => {
  if (featureQueueLength === 0) return null;

  return (
    <div className="flex items-center gap-2 ml-4 pl-4 border-l">
      <span className="text-sm text-muted-foreground flex items-center gap-1">
        <ListOrdered className="h-4 w-4" />
        Queue ({featureQueueLength})
      </span>
      <ButtonGroup alignment="left">
        <Button
          size="sm"
          onClick={onRunQueue}
          disabled={running}
        >
          {running ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-1" />
          )}
          Run queue
        </Button>
        <Button size="sm" variant="outline" onClick={onClearQueue}>
          Clear queue
        </Button>
      </ButtonGroup>
    </div>
  );
};
