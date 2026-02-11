import React from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Minus, Play, Loader2, Plus, Trash2 } from "lucide-react";
import type { Feature } from "@/types/project";
import type { TicketRow } from "@/types/ticket";

interface FeatureActionsProps {
  feature: Feature;
  tickets: Ticket[];
  inQueue: boolean;
  running: boolean;
  onAddFeatureToQueue: (feature: Feature) => void;
  onRemoveFeatureFromQueue: (id: string) => void;
  onRunForFeature: (feature: Feature) => Promise<void>;
  onDeleteFeature: (id: string) => Promise<void>;
}

export const FeatureActions: React.FC<FeatureActionsProps> = ({
  feature,
  tickets,
  inQueue,
  running,
  onAddFeatureToQueue,
  onRemoveFeatureFromQueue,
  onRunForFeature,
  onDeleteFeature,
}) => {
  return (
    <div className="flex gap-1">
      {inQueue ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onRemoveFeatureFromQueue(feature.id)}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove from queue</TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                onAddFeatureToQueue({
                  id: feature.id,
                  title: feature.title,
                  prompt_ids: feature.prompt_ids,
                  project_paths: feature.project_paths,
                  ticket_ids: feature.ticket_ids,
                  created_at: feature.created_at,
                  updated_at: feature.updated_at,
                })
              }
              disabled={feature.prompt_ids.length === 0}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add to run queue</TooltipContent>
        </Tooltip>
      )}
      <Button
        size="sm"
        onClick={() => onRunForFeature(feature)}
        disabled={feature.prompt_ids.length === 0}
      >
        {running ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        Run
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          // Implement logic to use feature in run
        }}
      >
        Use in run
      </Button>
      <Button size="sm" variant="outline" onClick={() => onDeleteFeature(feature.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
