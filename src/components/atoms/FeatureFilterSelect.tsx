import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ProjectOption {
  id: string;
  name: string;
}

interface FeatureFilterSelectProps {
  projectsList: ProjectOption[];
  featureProjectFilter: string;
  onFilterChange: (value: string) => void;
}

export const FeatureFilterSelect: React.FC<FeatureFilterSelectProps> = ({
  projectsList,
  featureProjectFilter,
  onFilterChange,
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Label className="text-sm text-muted-foreground shrink-0">Filter by project</Label>
      <Select value={featureProjectFilter || "all"} onValueChange={(v) => onFilterChange(v === "all" ? "" : v)}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="All projects" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All projects</SelectItem>
          {projectsList.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
