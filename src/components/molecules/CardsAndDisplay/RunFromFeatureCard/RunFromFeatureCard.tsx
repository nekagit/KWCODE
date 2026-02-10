"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { Layers } from "lucide-react";
import type { Feature } from "@/components/organisms/RunPageContent";

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
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Run from feature
        </CardTitle>
        <CardDescription>
          Prefill prompts and projects from a feature (tickets linked to prompts and projects).
        </CardDescription>
      </CardHeader>
      <CardContent>
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
          <SelectTrigger className="w-full max-w-md">
            <SelectValue placeholder="Select a feature (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">
              <span className="text-muted-foreground">None</span>
            </SelectItem>
            {features.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.title} ({f.prompt_ids.length} prompts, {f.project_paths.length} projects)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
