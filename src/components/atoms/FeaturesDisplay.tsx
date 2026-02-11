import React from 'react';
import { ScrollArea } from "@/components/shadcn/scroll-area";
import type { Feature } from "@/types/project";

interface FeaturesDisplayProps {
  features: Feature[];
}

export const FeaturesDisplay: React.FC<FeaturesDisplayProps> = ({ features }) => {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">features ({features.length})</p>
      <ScrollArea className="h-48 rounded border bg-muted/30 p-3 font-mono text-xs whitespace-pre-wrap">
        <pre>{JSON.stringify(features, null, 2)}</pre>
      </ScrollArea>
    </div>
  );
};
