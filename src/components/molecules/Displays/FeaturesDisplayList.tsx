import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Feature } from "@/types/project";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("Displays/FeaturesDisplayList.tsx");

interface FeaturesDisplayListProps {
  features: Feature[];
}

export const FeaturesDisplayList: React.FC<FeaturesDisplayListProps> = ({
  features,
}) => {
  return (
    <ScrollArea className={classes[0]}>
      <div className={classes[1]}>
        {features.map((f) => (
          <div key={f.id} className={classes[2]}>
            <p className={classes[3]}>{f.title}</p>
            <p className={classes[4]}>
              {f.prompt_ids.length} prompts · {f.project_paths.length} projects
            </p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
