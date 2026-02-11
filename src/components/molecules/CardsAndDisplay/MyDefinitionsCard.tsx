"use client";

import { Card } from "@/components/shared/Card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import type { ArchitectureRecord, ArchitectureCategory } from "@/types/architecture";
import { DefinitionCategorySelect } from "@/components/atoms/forms/DefinitionCategorySelect";
import { DefinitionListItem } from "@/components/atoms/list-items/DefinitionListItem";
import { LoadingState, EmptyState } from "@/components/shared/EmptyState";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("CardsAndDisplay/MyDefinitionsCard.tsx");

interface MyDefinitionsCardProps {
  items: ArchitectureRecord[];
  loading: boolean;
  filterCategory: ArchitectureCategory | "all";
  setFilterCategory: (category: ArchitectureCategory | "all") => void;
  ALL_CATEGORIES: ArchitectureCategory[];
  CATEGORY_LABELS: Record<ArchitectureCategory, string>;
  openView: (record: ArchitectureRecord) => void;
  openEdit: (record: ArchitectureRecord) => void;
  handleDelete: (id: string) => Promise<void>;
}

export function MyDefinitionsCard({
  items,
  loading,
  filterCategory,
  setFilterCategory,
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  openView,
  openEdit,
  handleDelete,
}: MyDefinitionsCardProps) {
  const filteredItems =
    filterCategory === "all"
      ? items
      : items.filter((a) => a.category === filterCategory);

  return (
    <Card
      title="My definitions"
      subtitle="Definitions you added from templates or AI. Edit to add more inputs (references, anti-patterns, examples, custom fields)."
      footerButtons={
        <DefinitionCategorySelect
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          ALL_CATEGORIES={ALL_CATEGORIES}
          CATEGORY_LABELS={CATEGORY_LABELS}
        />
      }
    >
      {loading ? (
        <LoadingState />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          message={filterCategory === "all"
            ? "No definitions yet."
            : `No definitions in ${CATEGORY_LABELS[filterCategory as ArchitectureCategory]}.`}
          action="Add from Templates or generate with AI, then edit here."
        />
      ) : (
        <ScrollArea className={classes[0]}>
          <ul className={classes[1]}>
            {filteredItems.map((record) => (
              <DefinitionListItem
                key={record.id}
                record={record}
                CATEGORY_LABELS={CATEGORY_LABELS}
                onOpenView={openView}
                onOpenEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        </ScrollArea>
      )}
    </Card>
  );
}
