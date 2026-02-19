/** Definition Category Select component. */
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ArchitectureCategory } from "@/types/architecture";

interface DefinitionCategorySelectProps {
  filterCategory: ArchitectureCategory | "all";
  setFilterCategory: (category: ArchitectureCategory | "all") => void;
  ALL_CATEGORIES: ArchitectureCategory[];
  CATEGORY_LABELS: Record<ArchitectureCategory, string>;
}

export const DefinitionCategorySelect: React.FC<DefinitionCategorySelectProps> = ({
  filterCategory,
  setFilterCategory,
  ALL_CATEGORIES,
  CATEGORY_LABELS,
}) => {
  return (
    <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as ArchitectureCategory | "all")}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All categories</SelectItem>
        {ALL_CATEGORIES.map((cat) => (
          <SelectItem key={cat} value={cat}>
            {CATEGORY_LABELS[cat]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
