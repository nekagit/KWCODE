import React from 'react';
import type { Feature } from "@/types/project";
import type { TicketRow } from "@/types/ticket";
import { ListItemCard } from "@/components/shared/ListItemCard";
import { FeatureActions } from "./FeatureActions";

interface FeatureListItemProps {
  feature: Feature;
  tickets: TicketRow[];
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
  const subtitle = (
    <p className="text-xs text-muted-foreground">
      Prompts: {feature.prompt_ids.join(", ")}
      {feature.ticket_ids.length > 0 &&
        ` · Tickets: ${feature.ticket_ids.map((id) => tickets.find((t) => t.id === id)?.title ?? id).join(", ")}`}
      {feature.project_paths.length > 0 && ` · ${feature.project_paths.length} project(s)`}
    </p>
  );

  return (
    <ListItemCard
      id={feature.id}
      title={feature.title}
      subtitle={subtitle}
      footerButtons={
        <FeatureActions
          feature={feature}
          tickets={tickets}
          inQueue={inQueue}
          running={running}
          onAddFeatureToQueue={onAddFeatureToQueue}
          onRemoveFeatureFromQueue={onRemoveFeatureFromQueue}
          onRunForFeature={onRunForFeature}
          onDeleteFeature={onDeleteFeature}
        />
      }
      className="flex flex-col"
    />
  );
};
