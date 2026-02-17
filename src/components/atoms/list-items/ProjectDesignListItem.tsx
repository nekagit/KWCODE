"use client";

import React from "react";
import { Card } from "@/components/shared/Card";
import { DesignVisualization } from "@/components/molecules/DesignVisualization";
import type { DesignRecord } from "@/types/design";

interface ProjectDesignListItemProps {
  design: DesignRecord;
  projectId: string;
}

export const ProjectDesignListItem: React.FC<ProjectDesignListItemProps> = ({
  design,
}) => {
  return (
    <li key={design.id}>
      <Card
        title={design.name}
        subtitle={design.description}
        className="flex flex-col bg-muted/30"
      >
        <DesignVisualization
          config={design.config ?? null}
          designName={design.name}
          showSamplePreview={true}
          samplePreviewHeight={260}
        />
      </Card>
    </li>
  );
};
