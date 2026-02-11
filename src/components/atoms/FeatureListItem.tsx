import React from 'react';
import { Button } from "@/components/shadcn/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/shadcn/tooltip";
import { Minus, Play, Loader2, Plus, Trash2 } from "lucide-react";
import type { Feature, Ticket } from "@/components/organisms/HomePageContent";

interface FeatureListItemProps {
  feature: Feature;
  tickets: Ticket[];
  inQueue: boolean;
  running: boolean;
  onAddFeatureToQueue: (feature: Feature) => void;
  onRemoveFeatureFromQueue: (id: string) => void;
  onRunForFeature: (feature: Feature) => Promise<void>;
  onDeleteFeature: (id: string) => Promise<void>;
}

export const FeatureListItem: React.FC<FeatureListItemProps> = ({
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
    <div
      key={feature.id}
      className="flex flex-wrap items-center gap-2 rounded-lg border p-3 bg-card"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{feature.title}</p>
        <p className="text-xs text-muted-foreground">
          Prompts: {feature.prompt_ids.join(", ")}
          {feature.ticket_ids.length > 0 &&
            ` · Tickets: ${feature.ticket_ids.map((id) => tickets.find((t) => t.id === id)?.title ?? id).join(", ")}`}
          {feature.project_paths.length > 0 && ` · ${feature.project_paths.length} project(s)`}
        </p>
      </div>
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
    </div>
  );
};
