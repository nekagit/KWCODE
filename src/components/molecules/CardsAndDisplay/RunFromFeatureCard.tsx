"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getClasses } from "@/components/molecules/tailwind-molecules";
import { Layers } from "lucide-react";
import type { Feature } from "@/types/project";
import { Card } from "@/components/shared/Card";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";

const classes = getClasses("CardsAndDisplay/RunFromFeatureCard.tsx");

interface RunFromFeatureCardProps {
  features: Feature[];
  selectedFeatureId: string | null;
  applyFeature: (feature: Feature | null) => void;
}

export function RunFromFeatureCard({
  features,
  selectedFeatureId,
  applyFeature,
}: RunFromFeatureCardProps) {
  return (
    <Card
      title={<TitleWithIcon icon={Layers} title="Run from feature" className={classes[0]} iconClassName="text-info/90" />}
      subtitle="Prefill prompts and projects from a feature (tickets linked to prompts and projects)."
    >
      <Select
        value={selectedFeatureId ?? "__none__"}
        onValueChange={(id) => {
          if (id === "__none__") {
            applyFeature(null);
            return;
          }
          const f = features.find((x) => x.id === id) ?? null;
          applyFeature(f);
        }}
      >
        <SelectTrigger className={classes[1]}>
          <SelectValue placeholder="Select a feature (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">
            <span className={classes[2]}>None</span>
          </SelectItem>
          {features.map((f) => (
            <SelectItem key={f.id} value={f.id}>
              {f.title} ({f.prompt_ids.length} prompts, {f.project_paths.length} projects)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Card>
  );
}
