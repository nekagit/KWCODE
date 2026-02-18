"use client";

import { useMemo, useState } from "react";
import { Palette, RotateCcw, Search, X } from "lucide-react";
import type { Project } from "@/types/project";
import type { DesignRecord } from "@/types/design";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { ProjectDesignListItem } from "@/components/atoms/list-items/ProjectDesignListItem";
import { GridContainer } from "@/components/shared/GridContainer";
import { getClasses } from "@/components/molecules/tailwind-molecules";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const classes = getClasses("TabAndContentSections/ProjectDesignTab.tsx");

type DesignSortOrder = "name-asc" | "name-desc";

/** Project with resolved designs (from getProjectResolved). */
type ProjectWithDesigns = Project & { designs?: (DesignRecord & Record<string, unknown>)[] };

interface ProjectDesignTabProps {
  project: Project;
  projectId: string;
  /** When false, used inside Setup card with section title above; omit header to avoid duplicate. */
  showHeader?: boolean;
}

function getDesignsToShow(project: Project): DesignRecord[] {
  const withDesigns = project as ProjectWithDesigns;
  const designIds = project.designIds ?? [];
  if (designIds.length === 0) return [];

  const resolved = withDesigns.designs;
  if (Array.isArray(resolved) && resolved.length > 0) {
    return designIds
      .map((id) => resolved.find((d) => d && (d as { id?: string }).id === id))
      .filter(Boolean)
      .map((d) => d as DesignRecord);
  }

  return designIds.map((id) => ({ id, name: id } as DesignRecord));
}

export function ProjectDesignTab({
  project,
  projectId,
  showHeader = true,
}: ProjectDesignTabProps) {
  const designs = getDesignsToShow(project);
  const [filterQuery, setFilterQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<DesignSortOrder>("name-asc");

  const trimmedFilterQuery = filterQuery.trim().toLowerCase();
  const filteredDesigns = useMemo(
    () =>
      !trimmedFilterQuery
        ? designs
        : designs.filter((design) => {
            const name = (design.name ?? "").toLowerCase();
            const desc = (design.description ?? "").toLowerCase();
            return name.includes(trimmedFilterQuery) || desc.includes(trimmedFilterQuery);
          }),
    [designs, trimmedFilterQuery]
  );

  const sortedDesigns = useMemo(() => {
    const list = [...filteredDesigns];
    list.sort((a, b) => {
      const cmp = (a.name ?? a.id).localeCompare(b.name ?? b.id, undefined, { sensitivity: "base" });
      if (cmp !== 0) return sortOrder === "name-asc" ? cmp : -cmp;
      return (a.id ?? "").localeCompare(b.id ?? "", undefined, { sensitivity: "base" });
    });
    return list;
  }, [filteredDesigns, sortOrder]);

  const showFilterRow = designs.length > 0;
  const showEmptyFilterState = trimmedFilterQuery.length > 0 && filteredDesigns.length === 0;

  return (
    <div className={classes[0]}>
      {showHeader && (
        <ProjectCategoryHeader
          title="Design"
          icon={<Palette className={classes[1]} />}
          project={project}
        />
      )}

      {showFilterRow && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"
              aria-hidden
            />
            <Input
              type="text"
              placeholder="Filter designs by name…"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
              aria-label="Filter designs by name"
            />
          </div>
          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as DesignSortOrder)}>
            <SelectTrigger className="h-8 w-[130px] text-sm" aria-label="Sort designs by name">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc" className="text-sm">Name A–Z</SelectItem>
              <SelectItem value="name-desc" className="text-sm">Name Z–A</SelectItem>
            </SelectContent>
          </Select>
          {(trimmedFilterQuery || sortOrder !== "name-asc") && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterQuery("");
                setSortOrder("name-asc");
              }}
              className="h-8 gap-1.5"
              aria-label="Reset filters"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              Reset filters
            </Button>
          )}
          {trimmedFilterQuery ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFilterQuery("")}
              className="h-8 gap-1.5"
              aria-label="Clear filter"
            >
              <X className="size-3.5" aria-hidden />
              Clear
            </Button>
          ) : null}
          {trimmedFilterQuery ? (
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Showing {filteredDesigns.length} of {designs.length} designs
            </span>
          ) : null}
        </div>
      )}

      {designs.length === 0 ? (
        <div className="min-h-[140px] rounded-xl border border-border/40 bg-white dark:bg-card" />
      ) : showEmptyFilterState ? (
        <div className="min-h-[140px] rounded-xl border border-border/40 bg-white dark:bg-card flex items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">
            No designs match &quot;{filterQuery.trim()}&quot;.
          </p>
        </div>
      ) : (
        <GridContainer>
          {sortedDesigns.map((design) => (
            <ProjectDesignListItem
              key={design.id}
              design={design}
              projectId={projectId}
            />
          ))}
        </GridContainer>
      )}
    </div>
  );
}
